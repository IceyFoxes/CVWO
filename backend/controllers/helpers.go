package controllers

import (
	"database/sql"
	"fmt"
	"log"
	"strings"
	"time"

	"github.com/golang-jwt/jwt/v4"
)

var secretKey = []byte("1234567890") // Use a secure, environment-controlled secret key

// Helper function to generate username-based authentication tokens (JWT)
func generateJWT(username string) (string, error) {
	claims := jwt.MapClaims{
		"username": username,
		"exp":      time.Now().Add(24 * time.Hour).Unix(), // Token expires in 24 hours
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(secretKey)
}

// Helper function to validate content of created thread
func validateThread(db *sql.DB, isEdit bool, thread *struct {
	Title   *string `json:"title"`   // Title is nullable
	Content *string `json:"content"` // Content is nullable
}) []string {
	var errors []string

	// List of prohibited words
	var prohibitedWords = []string{"bitcoin", "tesla"}

	// Validate content
	if thread.Content == nil || len(*thread.Content) == 0 {
		errors = append(errors, "Content is required")
	} else {
		content := strings.ToLower(*thread.Content) // Dereference pointer
		// Check for prohibited words in the content
		for _, word := range prohibitedWords {
			if strings.Contains(content, word) {
				errors = append(errors, fmt.Sprintf("Content contains prohibited word: %s", word))
			}
		}

		// Validate content length
		if len(content) < 10 {
			errors = append(errors, "Content must be at least 10 characters long")
		}
		if len(content) > 1000 {
			errors = append(errors, "Content must be no more than 1000 characters long")
		}
	}

	// Validate title
	if thread.Title != nil {
		title := strings.ToLower(*thread.Title) // Dereference pointer

		// Check for prohibited words in the title
		for _, word := range prohibitedWords {
			if strings.Contains(title, word) {
				errors = append(errors, fmt.Sprintf("Title contains prohibited word: %s", word))
			}
		}

		// Validate title length
		if len(title) < 5 {
			errors = append(errors, "Title must be at least 5 characters long")
		}
		if len(title) > 100 {
			errors = append(errors, "Title must be no more than 100 characters long")
		}

		// If it's not an edit, check title uniqueness
		if !isEdit {
			var count int
			err := db.QueryRow("SELECT COUNT(*) FROM threads WHERE title = ?", *thread.Title).Scan(&count)
			if err != nil {
				log.Printf("Error checking title uniqueness: %v", err)
				errors = append(errors, "Error checking title uniqueness")
			} else if count > 0 {
				errors = append(errors, "Title must be unique")
			}
		}
	}

	return errors
}

// Helper function to check if the logged-in user is an admin
func isAdmin(db *sql.DB, username string) (bool, error) {
	var isAdmin bool
	err := db.QueryRow("SELECT is_admin FROM users WHERE username = ?", username).Scan(&isAdmin)
	if err != nil {
		if err == sql.ErrNoRows {
			return false, nil // User does not exist
		}
		return false, err // Other database errors
	}
	return isAdmin, nil
}

// Helper function to check if the user is the owner of the thread or an admin
func checkThreadOwnershipOrAdmin(db *sql.DB, username string, userID int, threadID int) bool {
	// Check if the thread exists and get the user_id (thread creator)
	var threadCreatorID int
	err := db.QueryRow("SELECT user_id FROM threads WHERE id = ?", threadID).Scan(&threadCreatorID)
	if err != nil {
		return false // If thread does not exist or there is an error, deny access
	}

	// If the user is the thread owner, return true
	if userID == threadCreatorID {
		return true
	}

	// Check if the user is an admin
	isAdmin, err := isAdmin(db, username)
	if err != nil {
		return false // If there's an error in checking admin status, deny access
	}

	// If the user is an admin, allow modification
	return isAdmin
}

// Helper function to get user ID from username and validate username existence
func getUserIDFromUsername(db *sql.DB, username string) (int, error) {
	if username == "" {
		return 0, fmt.Errorf("username is required")
	}

	var userID int
	err := db.QueryRow("SELECT id FROM users WHERE username = ?", username).Scan(&userID)
	if err != nil {
		if err == sql.ErrNoRows {
			return 0, fmt.Errorf("username does not exist")
		}
		return 0, fmt.Errorf("failed to fetch user information")
	}

	return userID, nil
}

// Helper function to calculate total pages (ThreadList)
func calculateTotalPagesForThreads(db *sql.DB, searchQuery string, limit int) int {
	var totalCount int
	query := `
        SELECT COUNT(*) 
        FROM threads 
        WHERE (title IS NOT NULL AND parent_id IS NULL)
        AND (title LIKE ? OR content LIKE ?)
    `
	err := db.QueryRow(query, "%"+searchQuery+"%", "%"+searchQuery+"%").Scan(&totalCount)
	if err != nil {
		log.Printf("Error calculating total pages: %v", err)
		return 0
	}
	totalPages := (totalCount + limit - 1) / limit // Ceiling division
	return totalPages
}

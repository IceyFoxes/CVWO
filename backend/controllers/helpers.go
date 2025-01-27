package controllers

import (
	"database/sql"
	"fmt"
	"log"
	"os"
	"strings"
	"time"

	"github.com/golang-jwt/jwt/v4"
	_ "github.com/joho/godotenv/autoload"
)

// Helper function to generate username-based authentication tokens (JWT)
func generateJWT(username string) (string, error) {
	claims := jwt.MapClaims{
		"username": username,
		"exp":      time.Now().Add(24 * time.Hour).Unix(), // Token expires in 24 hours
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	secretKey := []byte(os.Getenv("JWT_SECRET_KEY"))
	if len(secretKey) == 0 {
		return "", fmt.Errorf("JWT_SECRET_KEY environment variable not set")
	}
	return token.SignedString(secretKey)
}

// Helper function to validate content of created thread
func validateThread(db *sql.DB, isEdit bool, thread *struct {
	Title   *string `json:"title"`   // Title is nullable
	Content *string `json:"content"` // Content is nullable
}) []string {
	var errors []string

	// List of prohibited words
	var prohibitedWords = []string{"mother", "child"}

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

		// Check for prohibited words in the content (whole word match)
		words := strings.Fields(*thread.Content)
		for _, word := range words {
			for _, prohibited := range prohibitedWords {
				if word == prohibited {
					errors = append(errors, fmt.Sprintf("Content contains prohibited word: %s", prohibited))
				}
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
			err := db.QueryRow("SELECT COUNT(*) FROM threads WHERE title = $1", *thread.Title).Scan(&count)
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

// Helper function to validate content of created thread
func validateComment(comment *struct {
	Content *string `json:"content"` // Content is nullable
}) []string {
	var errors []string

	// List of prohibited words
	var prohibitedWords = []string{"mother", "child"}

	// Validate content
	if comment.Content == nil || len(*comment.Content) == 0 {
		errors = append(errors, "Content is required")
	} else {
		content := strings.ToLower(*comment.Content) // Dereference pointer

		// Check for prohibited words in the content (whole word match)
		words := strings.Fields(content) // Tokenize content into words
		for _, word := range words {
			for _, prohibited := range prohibitedWords {
				if word == prohibited {
					errors = append(errors, fmt.Sprintf("Content contains prohibited word: %s", prohibited))
				}
			}
		}

		// Validate content length
		if len(content) < 5 {
			errors = append(errors, "Content must be at least 5 characters long")
		}
		if len(content) > 500 {
			errors = append(errors, "Content must be no more than 500 characters long")
		}
	}

	return errors
}

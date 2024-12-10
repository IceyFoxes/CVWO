package main

import (
	"database/sql"
	"fmt"
	"log"
	"strings"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	_ "modernc.org/sqlite"
)

// Helper function to validate content of created thread
func validateThread(db *sql.DB, thread *struct {
	Title   string `json:"title"`
	Content string `json:"content"`
}) []string {
	var errors []string

	// List of prohibited words
	var prohibitedWords = []string{"internship", "CVWO", "summer", "CAP 5.0", "GPA 5.0"}

	// Check for prohibited words in the title or content
	for _, word := range prohibitedWords {
		if strings.Contains(strings.ToLower(thread.Title), word) {
			errors = append(errors, fmt.Sprintf("Title contains prohibited word: %s", word))
		}
		if strings.Contains(strings.ToLower(thread.Content), word) {
			errors = append(errors, fmt.Sprintf("Content contains prohibited word: %s", word))
		}
	}

	// Validate title length
	if len(thread.Title) < 5 {
		errors = append(errors, "Title must be at least 5 characters long")
	}
	if len(thread.Title) > 100 {
		errors = append(errors, "Title must be no more than 100 characters long")
	}

	// Validate content length
	if len(thread.Content) < 10 {
		errors = append(errors, "Content must be at least 10 characters long")
	}
	if len(thread.Content) > 1000 {
		errors = append(errors, "Content must be no more than 1000 characters long")
	}

	// Check if the title is unique
	var count int
	err := db.QueryRow("SELECT COUNT(*) FROM threads WHERE title = ?", thread.Title).Scan(&count)
	if err != nil {
		log.Printf("Error checking title uniqueness: %v", err)
		errors = append(errors, "Error checking title uniqueness")
	} else if count > 0 {
		errors = append(errors, "Title must be unique")
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
func checkThreadOwnershipOrAdmin(db *sql.DB, username string, userID int, threadID string) (bool, error) {
	var threadCreatorID int

	// Check if the thread exists and get the user_id (thread creator)
	err := db.QueryRow("SELECT user_id FROM threads WHERE id = ?", threadID).Scan(&threadCreatorID)
	if err != nil {
		if err == sql.ErrNoRows {
			return false, fmt.Errorf("Thread not found")
		}
		return false, fmt.Errorf("Failed to fetch thread information")
	}

	// Check if the current user is the owner of the thread
	if userID == threadCreatorID {
		return true, nil
	}

	// If the user is not the thread owner, check if the user is an admin
	isAdmin, err := isAdmin(db, username)
	if err != nil {
		return false, fmt.Errorf("Failed to check admin status")
	}

	if isAdmin {
		return true, nil // Admins can modify any thread
	}

	return false, fmt.Errorf("You are not authorized to modify this thread")
}

// Helper function to get user ID from username and validate username existence
func getUserIDFromUsername(db *sql.DB, username string) (int, error) {
	if username == "" {
		return 0, fmt.Errorf("Username is required")
	}

	var userID int
	err := db.QueryRow("SELECT id FROM users WHERE username = ?", username).Scan(&userID)
	if err != nil {
		if err == sql.ErrNoRows {
			return 0, fmt.Errorf("Username does not exist")
		}
		return 0, fmt.Errorf("Failed to fetch user information")
	}

	return userID, nil
}

// Helper function to initialize the database and seed the necessary tables
func initializeDatabase() (*sql.DB, error) {
	// Connect to the SQLite database
	db, err := sql.Open("sqlite", "./forum.db")
	if err != nil {
		return nil, fmt.Errorf("failed to open database: %v", err)
	}

	// Ping the database to check the connection
	err = db.Ping()
	if err != nil {
		return nil, fmt.Errorf("failed to ping database: %v", err)
	}
	fmt.Println("Database connected successfully!")

	// Create Threads table if it doesn't exist
	_, err = db.Exec(`
        CREATE TABLE IF NOT EXISTS threads (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            content TEXT NOT NULL,
            user_id INTEGER NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    `)
	if err != nil {
		return nil, fmt.Errorf("failed to create threads table: %v", err)
	}

	// Create users table if it doesn't exist
	_, err = db.Exec(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            is_admin BOOLEAN NOT NULL DEFAULT 0
        );
    `)
	if err != nil {
		return nil, fmt.Errorf("failed to create users table: %v", err)
	}
	fmt.Println("Users table created with 'is_admin' flag!")

	// Seed a default admin user if none exists
	_, err = db.Exec("INSERT OR IGNORE INTO users (id, username, is_admin) VALUES (1, 'admin_user', 1)")
	if err != nil {
		return nil, fmt.Errorf("failed to seed admin user: %v", err)
	}
	fmt.Println("Admin user seeded!")

	// Seed a default welcome thread
	_, err = db.Exec(`
        INSERT OR IGNORE INTO threads (id, title, content, user_id)
        VALUES (1, 'Welcome to the Forum', 'This is the first thread.', 1)
    `)
	if err != nil {
		return nil, fmt.Errorf("failed to seed default thread: %v", err)
	}
	fmt.Println("Default welcome thread seeded!")

	return db, nil
}

func main() {
	db, err := initializeDatabase()
	if err != nil {
		log.Fatalf("Error initializing database: %v", err)
	}
	defer db.Close()

	r := gin.Default()
	r.Use(cors.Default())

	// Route for testing
	r.GET("/test", func(c *gin.Context) {
		c.JSON(200, gin.H{"message": "Server is working!"})
	})

	// Route to register a new user
	r.POST("/users", func(c *gin.Context) {
		var user struct {
			Username string `json:"username"`
		}

		// Bind the incoming JSON request to the struct
		if err := c.ShouldBindJSON(&user); err != nil {
			c.JSON(400, gin.H{"error": err.Error()})
			return
		}

		// Check if the username already exists
		var existingUser string
		err := db.QueryRow("SELECT username FROM users WHERE username = ?", user.Username).Scan(&existingUser)
		if err == nil {
			c.JSON(400, gin.H{"error": "Username already exists"})
			return
		}

		// Insert the new user into the database
		_, err = db.Exec("INSERT INTO users (username) VALUES (?)", user.Username)
		if err != nil {
			c.JSON(500, gin.H{"error": "Failed to create user"})
			return
		}

		c.JSON(200, gin.H{"message": "User created!"})
	})

	// Route to log in a user by username
	r.POST("/login", func(c *gin.Context) {
		var loginData struct {
			Username string `json:"username"`
		}

		// Bind the incoming JSON request to the struct
		if err := c.ShouldBindJSON(&loginData); err != nil {
			c.JSON(400, gin.H{"error": err.Error()})
			return
		}

		// Check if the username exists in the database
		var existingUser string
		err := db.QueryRow("SELECT username FROM users WHERE username = ?", loginData.Username).Scan(&existingUser)
		if err != nil {
			if err == sql.ErrNoRows {
				c.JSON(400, gin.H{"error": "Invalid username"})
			} else {
				c.JSON(500, gin.H{"error": "Failed to authenticate user"})
			}
			return
		}

		c.JSON(200, gin.H{"message": "User authenticated!"})
	})

	// Route to view all threads
	r.GET("/threads", func(c *gin.Context) {
		// Fetch all threads
		rows, err := db.Query("SELECT id, title, content FROM threads")
		if err != nil {
			c.JSON(500, gin.H{"error": "Failed to fetch threads"})
			return
		}
		defer rows.Close()

		var threads []gin.H
		for rows.Next() {
			var id int
			var title, content string
			if err := rows.Scan(&id, &title, &content); err != nil {
				c.JSON(500, gin.H{"error": "Failed to scan thread"})
				return
			}
			threads = append(threads, gin.H{
				"id":      id,
				"title":   title,
				"content": content,
			})
		}

		// Handle empty threads case
		if len(threads) == 0 {
			c.JSON(200, gin.H{"threads": []interface{}{}}) // Return an empty array
			return
		}

		c.JSON(200, threads)
	})

	// Route to view single thread
	r.GET("/threads/:id", func(c *gin.Context) {
		// Get the thread ID from the URL parameter
		threadID := c.Param("id")

		// Query the database for the thread by ID
		var thread struct {
			ID      int    `json:"id"`
			Title   string `json:"title"`
			Content string `json:"content"`
			UserID  int    `json:"user_id"` // Assuming you're storing user ID
		}

		// Fetch the thread data from the database
		err := db.QueryRow("SELECT id, title, content, user_id FROM threads WHERE id = ?", threadID).Scan(&thread.ID, &thread.Title, &thread.Content, &thread.UserID)
		if err != nil {
			if err == sql.ErrNoRows {
				c.JSON(404, gin.H{"error": "Thread not found"})
			} else {
				c.JSON(500, gin.H{"error": "Failed to fetch thread"})
			}
			return
		}

		// Return the thread data as JSON
		c.JSON(200, thread)
	})

	// Route to create a thread
	r.POST("/threads", func(c *gin.Context) {
		// Get the username from the query or header
		username := c.DefaultQuery("username", "")

		// Validate and get the user ID using the helper function
		userID, err := getUserIDFromUsername(db, username)
		if err != nil {
			c.JSON(400, gin.H{"error": err.Error()})
			return
		}

		// Bind the incoming JSON request to the struct for thread data
		var thread struct {
			Title   string `json:"title"`
			Content string `json:"content"`
		}

		if err := c.ShouldBindJSON(&thread); err != nil {
			c.JSON(400, gin.H{"error": "Invalid request body"})
			return
		}

		// Validate the thread data
		errors := validateThread(db, &thread)
		if len(errors) > 0 {
			c.JSON(400, gin.H{"errors": errors}) // Send validation errors
			return
		}

		// Insert the new thread into the database
		_, err = db.Exec("INSERT INTO threads (title, content, user_id) VALUES (?, ?, ?)", thread.Title, thread.Content, userID)
		if err != nil {
			c.JSON(500, gin.H{"error": "Failed to insert thread"})
			return
		}

		c.JSON(200, gin.H{"message": "Thread created successfully!"})
	})

	// Route to update a thread
	r.PUT("/threads/:id", func(c *gin.Context) {
		// Get the username from the query or header
		username := c.DefaultQuery("username", "")

		// Validate and get the user ID using the helper function
		userID, err := getUserIDFromUsername(db, username)
		if err != nil {
			c.JSON(400, gin.H{"error": err.Error()})
			return
		}

		// Get the thread ID from the URL parameter
		threadID := c.Param("id")

		// Check ownership or admin status
		authorized, err := checkThreadOwnershipOrAdmin(db, username, userID, threadID)
		if !authorized {
			c.JSON(403, gin.H{"error": "You are not authorized to edit this thread"})
			return
		}

		if err != nil {
			c.JSON(403, gin.H{"error": err.Error()})
			return
		}

		// Bind the incoming JSON request to the struct for thread data
		var thread struct {
			Title   string `json:"title"`
			Content string `json:"content"`
		}

		if err := c.ShouldBindJSON(&thread); err != nil {
			c.JSON(400, gin.H{"error": err.Error()})
			return
		}

		// Validate the thread data
		errors := validateThread(db, &thread)
		if len(errors) > 0 {
			c.JSON(400, gin.H{"errors": errors}) // Send validation errors
			return
		}

		// Update the thread in the database
		_, err = db.Exec("UPDATE threads SET title = ?, content = ? WHERE id = ?", thread.Title, thread.Content, threadID)
		if err != nil {
			c.JSON(500, gin.H{"error": "Failed to edit thread"})
			return
		}

		c.JSON(200, gin.H{"message": "Thread edited!"})
	})

	// Route to delete a thread
	r.DELETE("/threads/:id", func(c *gin.Context) {
		// Get the username from the query or header
		username := c.DefaultQuery("username", "")

		// Validate and get the user ID using the helper function
		userID, err := getUserIDFromUsername(db, username)
		if err != nil {
			c.JSON(400, gin.H{"error": err.Error()})
			return
		}

		// Get the thread ID from the URL parameter
		threadID := c.Param("id")

		// Check ownership or admin status
		authorized, err := checkThreadOwnershipOrAdmin(db, username, userID, threadID)
		if !authorized {
			c.JSON(403, gin.H{"error": "You are not authorized to delete this thread"})
			return
		}

		if err != nil {
			c.JSON(403, gin.H{"error": err.Error()})
			return
		}

		// Delete the thread from the database
		_, err = db.Exec("DELETE FROM threads WHERE id = ?", threadID)
		if err != nil {
			c.JSON(500, gin.H{"error": "Failed to delete thread"})
			return
		}

		c.JSON(200, gin.H{"message": "Thread deleted!"})
	})

	// Start the server
	r.Run(":8080")
}

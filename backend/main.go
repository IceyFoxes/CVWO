package main

import (
	"database/sql"
	"fmt"
	"log"
	"strconv"
	"strings"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	_ "modernc.org/sqlite"
)

// Helper function to validate content of created thread
func validateThread(db *sql.DB, isEdit bool, thread *struct {
	Title   string `json:"title"`
	Content string `json:"content"`
}) []string {
	var errors []string

	// List of prohibited words
	var prohibitedWords = []string{"internship", "cvwo", "summer", "cap 5.0", "gpa 5.0"}
	// Check for prohibited words in the title or content
	for _, word := range prohibitedWords {
		// Convert both title and content to lowercase for case-insensitive comparison
		title := strings.ToLower(thread.Title)
		content := strings.ToLower(thread.Content)

		if strings.Contains(title, word) {
			errors = append(errors, fmt.Sprintf("Title contains prohibited word: %s", word))
		}
		if strings.Contains(content, word) {
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

	// If it's not an edit (i.e., creating a new thread), check title uniqueness
	if !isEdit {
		// Check if the title is unique
		var count int
		err := db.QueryRow("SELECT COUNT(*) FROM threads WHERE title = ?", thread.Title).Scan(&count)
		if err != nil {
			log.Printf("Error checking title uniqueness: %v", err)
			errors = append(errors, "Error checking title uniqueness")
		} else if count > 0 {
			errors = append(errors, "Title must be unique")
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
func checkThreadOwnershipOrAdmin(db *sql.DB, username string, userID int, threadID string) bool {
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
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
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

	// Create Comments table if it doesn't exist
	_, err = db.Exec(`
        CREATE TABLE IF NOT EXISTS comments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            thread_id INTEGER NOT NULL,
            user_id INTEGER NOT NULL,
            content TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (thread_id) REFERENCES threads(id) ON DELETE CASCADE,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );
    `)
	if err != nil {
		return nil, fmt.Errorf("failed to create comments table: %v", err)
	}
	fmt.Println("Comments table created!")

	// Create Likes table if it doesn't exist
	_, err = db.Exec(`
        CREATE TABLE IF NOT EXISTS likes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            thread_id INTEGER NOT NULL,
            user_id INTEGER NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (thread_id) REFERENCES threads(id) ON DELETE CASCADE,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            UNIQUE (thread_id, user_id)
        );
    `)
	if err != nil {
		return nil, fmt.Errorf("failed to create likes table: %v", err)
	}
	fmt.Println("Likes table created!")

	// Create Dislikes table if it doesn't exist
	_, err = db.Exec(`
	CREATE TABLE IF NOT EXISTS dislikes (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		thread_id INTEGER NOT NULL,
		user_id INTEGER NOT NULL,
		created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
		FOREIGN KEY (thread_id) REFERENCES threads(id) ON DELETE CASCADE,
		FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
		UNIQUE (thread_id, user_id)
	);
	`)
	if err != nil {
		return nil, fmt.Errorf("failed to create dislikes table: %v", err)
	}
	fmt.Println("Dislikes table created!")

	// Seed a default admin user if none exists
	_, err = db.Exec("INSERT OR IGNORE INTO users (id, username, is_admin) VALUES (1, 'admin_user', 1)")
	if err != nil {
		return nil, fmt.Errorf("failed to seed admin user: %v", err)
	}
	fmt.Println("Admin user seeded!")

	// Seed a default welcome thread
	_, err = db.Exec(`
        INSERT OR IGNORE INTO threads (id, title, content, user_id)
        VALUES (1, 'Welcome to the Forum', 'Please do not post any inappropriate content', 1)
    `)
	if err != nil {
		return nil, fmt.Errorf("failed to seed default thread: %v", err)
	}
	fmt.Println("Default welcome thread seeded!")

	return db, nil
}

// Helper function to calculate total pages
func calculateTotalPages(db *sql.DB, searchQuery string, limit int) int {
	var totalCount int
	err := db.QueryRow("SELECT COUNT(*) FROM threads WHERE title LIKE ? OR content LIKE ?", "%"+searchQuery+"%", "%"+searchQuery+"%").Scan(&totalCount)
	if err != nil {
		log.Printf("Error calculating total pages: %v", err)
		return 0
	}
	totalPages := (totalCount + limit - 1) / limit // Calculate total pages
	return totalPages
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

	// Route to get threads with pagination
	r.GET("/threads", func(c *gin.Context) {
		// Retrieve query parameters for search and sorting
		searchQuery := c.DefaultQuery("search", "")      // Search query parameter
		sortBy := c.DefaultQuery("sortBy", "created_at") // Sort by field, default is "created_at"
		sortOrder := c.DefaultQuery("sortOrder", "asc")  // Sort order (asc or desc), default is "asc"

		// Validate the `sortBy` parameter
		validSortColumns := map[string]bool{"id": true, "title": true, "content": true, "created_at": true}
		if !validSortColumns[sortBy] {
			sortBy = "created_at" // Default to sorting by "created_at"
		}

		// Validate the `sortOrder` parameter
		if strings.ToLower(sortOrder) != "asc" && strings.ToLower(sortOrder) != "desc" {
			sortOrder = "asc" // Default to ascending order
		}

		// Handle pagination
		page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))   // Default to page 1 if not provided
		limit, _ := strconv.Atoi(c.DefaultQuery("limit", "3")) // Default to 3 threads per page
		if page < 1 {
			page = 1
		}
		if limit < 1 {
			limit = 3
		}

		offset := (page - 1) * limit // Calculate offset for pagination

		// Build the SQL query dynamically
		query := fmt.Sprintf(`
			SELECT id, title, content, created_at
			FROM threads
			WHERE title LIKE ? OR content LIKE ?
			ORDER BY %s %s
			LIMIT ? OFFSET ?
		`, sortBy, sortOrder)

		// Execute the query with the search term
		rows, err := db.Query(query, "%"+searchQuery+"%", "%"+searchQuery+"%", limit, offset)
		if err != nil {
			c.JSON(500, gin.H{"error": "Failed to fetch threads"})
			return
		}
		defer rows.Close()

		// Parse results into a slice of threads
		var threads []gin.H
		for rows.Next() {
			var id int
			var title, content, createdAt string
			if err := rows.Scan(&id, &title, &content, &createdAt); err != nil {
				c.JSON(500, gin.H{"error": "Failed to scan thread"})
				return
			}
			threads = append(threads, gin.H{
				"id":         id,
				"title":      title,
				"content":    content,
				"created_at": createdAt,
			})
		}

		// If no threads are found, return an empty array
		if len(threads) == 0 {
			c.JSON(200, gin.H{"threads": []interface{}{}}) // Respond with an empty array
			return
		}

		// Return the fetched threads
		c.JSON(200, gin.H{
			"threads":     threads,
			"currentPage": page,
			"totalPages":  calculateTotalPages(db, searchQuery, limit), // Helper function to calculate total pages
		})
	})

	// Route to check edit thread authorization
	r.GET("/threads/:id/authorize", func(c *gin.Context) {
		// Get username from query
		username := c.DefaultQuery("username", "")

		// Fetch user ID
		userID, err := getUserIDFromUsername(db, username)
		if err != nil {
			c.JSON(400, gin.H{"error": "Invalid userID"})
			return
		}

		// Get thread ID
		threadID := c.Param("id")

		// Check if the user is authorized (owner or admin)
		authorized := checkThreadOwnershipOrAdmin(db, username, userID, threadID)

		// If the user is not authorized
		if !authorized {
			c.JSON(403, gin.H{"error": "You are not authorized to modify this thread"})
			return
		}

		c.JSON(200, gin.H{"message": "User is authorized to modify this thread"})
	})

	// Route to view single thread
	r.GET("/threads/:id", func(c *gin.Context) {
		// Get the thread ID from the URL parameter
		threadID := c.Param("id")

		// Define the thread struct
		var thread struct {
			ID        int    `json:"id"`
			Title     string `json:"title"`
			Content   string `json:"content"`
			UserID    int    `json:"user_id"`
			CreatedAt string `json:"created_at"`
		}

		// Fetch the thread data from the database
		err := db.QueryRow(`
			SELECT id, title, content, user_id, created_at 
			FROM threads 
			WHERE id = ?
		`, threadID).Scan(&thread.ID, &thread.Title, &thread.Content, &thread.UserID, &thread.CreatedAt)

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

	// Route to view comments
	r.GET("/threads/:id/comments", func(c *gin.Context) {
		threadID := c.Param("id")
		rows, err := db.Query(`
			SELECT comments.id, comments.content, users.username, comments.created_at 
			FROM comments
			JOIN users ON comments.user_id = users.id
			WHERE comments.thread_id = ?
			ORDER BY comments.created_at ASC
		`, threadID)
		if err != nil {
			c.JSON(500, gin.H{"error": "Failed to fetch comments"})
			return
		}
		defer rows.Close()

		var comments []gin.H
		for rows.Next() {
			var id int
			var content, username, createdAt string
			if err := rows.Scan(&id, &content, &username, &createdAt); err != nil {
				c.JSON(500, gin.H{"error": "Failed to parse comments"})
				return
			}
			comments = append(comments, gin.H{
				"id":         id,
				"content":    content,
				"username":   username,
				"created_at": createdAt,
			})
		}

		c.JSON(200, gin.H{"comments": comments})
	})

	// Route to get likes count
	r.GET("/threads/:id/likes", func(c *gin.Context) {
		threadID := c.Param("id")
		var count int

		err := db.QueryRow("SELECT COUNT(*) FROM likes WHERE thread_id = ?", threadID).Scan(&count)
		if err != nil {
			c.JSON(500, gin.H{"error": "Failed to fetch likes count"})
			return
		}

		c.JSON(200, gin.H{"likes_count": count})
	})

	// Route to get dislikes count
	r.GET("/threads/:id/dislikes", func(c *gin.Context) {
		threadID := c.Param("id")
		var count int

		err := db.QueryRow("SELECT COUNT(*) FROM dislikes WHERE thread_id = ?", threadID).Scan(&count)
		if err != nil {
			c.JSON(500, gin.H{"error": "Failed to fetch dislikes count"})
			return
		}

		c.JSON(200, gin.H{"dislikes_count": count})
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
		errors := validateThread(db, false, &thread)
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

	// Route to like a thread
	r.POST("/threads/:id/like", func(c *gin.Context) {
		threadID := c.Param("id")
		username := c.DefaultQuery("username", "")

		userID, err := getUserIDFromUsername(db, username)
		if err != nil {
			c.JSON(400, gin.H{"error": "Invalid username"})
			return
		}

		_, err = db.Exec("INSERT INTO likes (thread_id, user_id) VALUES (?, ?) ON CONFLICT DO NOTHING", threadID, userID)
		if err != nil {
			c.JSON(500, gin.H{"error": "Failed to like thread"})
			return
		}

		c.JSON(200, gin.H{"message": "Thread liked successfully!"})
	})

	// Route to dislike a thread
	r.POST("/threads/:id/dislike", func(c *gin.Context) {
		threadID := c.Param("id")
		username := c.DefaultQuery("username", "")

		userID, err := getUserIDFromUsername(db, username)
		if err != nil {
			c.JSON(400, gin.H{"error": "Invalid username"})
			return
		}

		_, err = db.Exec("INSERT INTO dislikes (thread_id, user_id) VALUES (?, ?) ON CONFLICT DO NOTHING", threadID, userID)
		if err != nil {
			c.JSON(500, gin.H{"error": "Failed to dislike thread"})
			return
		}

		c.JSON(200, gin.H{"message": "Thread disliked successfully!"})
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

	// Route to create a comment
	r.POST("/threads/:id/comments", func(c *gin.Context) {
		threadID := c.Param("id")
		username := c.DefaultQuery("username", "")

		// Get user ID
		userID, err := getUserIDFromUsername(db, username)
		if err != nil {
			c.JSON(400, gin.H{"error": "Invalid username"})
			return
		}

		var comment struct {
			Content string `json:"content"`
		}

		if err := c.ShouldBindJSON(&comment); err != nil {
			c.JSON(400, gin.H{"error": "Invalid comment payload"})
			return
		}

		if len(comment.Content) == 0 {
			c.JSON(400, gin.H{"error": "Comment content cannot be empty"})
			return
		}

		_, err = db.Exec("INSERT INTO comments (thread_id, user_id, content) VALUES (?, ?, ?)", threadID, userID, comment.Content)
		if err != nil {
			c.JSON(500, gin.H{"error": "Failed to create comment"})
			return
		}

		c.JSON(200, gin.H{"message": "Comment created successfully!"})
	})

	// Route to update a thread
	r.PUT("/threads/:id", func(c *gin.Context) {
		// Get the username from the query
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
		authorized := checkThreadOwnershipOrAdmin(db, username, userID, threadID)
		if !authorized {
			c.JSON(403, gin.H{"error": "You are not authorized to edit this thread"})
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
		errors := validateThread(db, true, &thread)
		if len(errors) > 0 {
			c.JSON(400, gin.H{"errors": errors}) // Send validation errors
			return
		}

		// Prepare the SQL query for partial update, ensuring that empty fields are not included in the update
		updateQuery := "UPDATE threads SET"
		params := []interface{}{}

		if thread.Title != "" {
			updateQuery += " title = ?,"
			params = append(params, thread.Title)
		}

		if thread.Content != "" {
			updateQuery += " content = ?,"
			params = append(params, thread.Content)
		}

		// Remove the trailing comma
		updateQuery = updateQuery[:len(updateQuery)-1]

		// Finalize the query with the thread ID
		updateQuery += " WHERE id = ?"
		params = append(params, threadID)

		// Execute the update query
		_, err = db.Exec(updateQuery, params...)
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
		authorized := checkThreadOwnershipOrAdmin(db, username, userID, threadID)
		if !authorized {
			c.JSON(403, gin.H{"error": "You are not authorized to delete this thread"})
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

	// Route to remove a like
	r.DELETE("/threads/:id/like", func(c *gin.Context) {
		threadID := c.Param("id")
		username := c.DefaultQuery("username", "")

		userID, err := getUserIDFromUsername(db, username)
		if err != nil {
			c.JSON(400, gin.H{"error": "Invalid username"})
			return
		}

		_, err = db.Exec("DELETE FROM likes WHERE thread_id = ? AND user_id = ?", threadID, userID)
		if err != nil {
			c.JSON(500, gin.H{"error": "Failed to remove like"})
			return
		}

		c.JSON(200, gin.H{"message": "Thread unliked successfully!"})
	})

	// Route to remove a dislike
	r.DELETE("/threads/:id/dislike", func(c *gin.Context) {
		threadID := c.Param("id")
		username := c.DefaultQuery("username", "")

		userID, err := getUserIDFromUsername(db, username)
		if err != nil {
			c.JSON(400, gin.H{"error": "Invalid username"})
			return
		}

		_, err = db.Exec("DELETE FROM dislikes WHERE thread_id = ? AND user_id = ?", threadID, userID)
		if err != nil {
			c.JSON(500, gin.H{"error": "Failed to remove dislike"})
			return
		}

		c.JSON(200, gin.H{"message": "Dislike removed successfully!"})
	})

	// Start the server
	r.Run(":8080")
}

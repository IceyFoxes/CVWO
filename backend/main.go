package main

import (
	"database/sql"
	"fmt"
	"log"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v4"
	_ "modernc.org/sqlite"
)

// Reusable Helper Functions
// -------------------------------------------------------------------------------------
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

// Middleware to verify JWT tokens
func authMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Missing token"})
			return
		}

		// Parse and validate the token
		tokenString := strings.TrimPrefix(authHeader, "Bearer ")
		token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
			// Ensure the signing method is HMAC
			if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, fmt.Errorf("unexpected signing method")
			}
			return secretKey, nil
		})

		if err != nil {
			fmt.Println("JWT parse error:", err)
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Invalid or expired token"})
			return
		}

		// Extract claims from the token
		if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
			username, exists := claims["username"].(string)
			if !exists || username == "" {
				c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Invalid token claims"})
				return
			}
			c.Set("username", username)
		} else {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Invalid token claims"})
			return
		}

		c.Next()
	}
}

// Helper function to validate content of created thread
func validateThread(db *sql.DB, isEdit bool, thread *struct {
	Title   string `json:"title"` // Title is empty or null for comments
	Content string `json:"content"`
}) []string {
	var errors []string

	// List of prohibited words
	var prohibitedWords = []string{"bitcoin", "tesla"}
	// Check for prohibited words in the content
	content := strings.ToLower(thread.Content)
	for _, word := range prohibitedWords {
		if strings.Contains(content, word) {
			errors = append(errors, fmt.Sprintf("Content contains prohibited word: %s", word))
		}
	}

	// Title validation (only if Title is not empty)
	if thread.Title != "" {
		// Convert title to lowercase for case-insensitive comparison
		title := strings.ToLower(thread.Title)

		// Check for prohibited words in the title
		for _, word := range prohibitedWords {
			if strings.Contains(title, word) {
				errors = append(errors, fmt.Sprintf("Title contains prohibited word: %s", word))
			}
		}

		// Validate title length
		if len(thread.Title) < 5 {
			errors = append(errors, "Title must be at least 5 characters long")
		}
		if len(thread.Title) > 100 {
			errors = append(errors, "Title must be no more than 100 characters long")
		}

		// If it's not an edit, check title uniqueness
		if !isEdit {
			var count int
			err := db.QueryRow("SELECT COUNT(*) FROM threads WHERE title = ?", thread.Title).Scan(&count)
			if err != nil {
				log.Printf("Error checking title uniqueness: %v", err)
				errors = append(errors, "Error checking title uniqueness")
			} else if count > 0 {
				errors = append(errors, "Title must be unique")
			}
		}
	}

	// Validate content length
	if len(thread.Content) < 10 {
		errors = append(errors, "Content must be at least 10 characters long")
	}
	if len(thread.Content) > 1000 {
		errors = append(errors, "Content must be no more than 1000 characters long")
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

// Helper function to initialize the database
func initializeDatabase() (*sql.DB, error) {
	db, err := sql.Open("sqlite", "./forum.db")
	if err != nil {
		return nil, fmt.Errorf("failed to open database: %v", err)
	}

	_, err = db.Exec("PRAGMA foreign_keys = ON;")
	if err != nil {
		return nil, fmt.Errorf("failed to enable foreign keys: %v", err)
	}

	err = db.Ping()
	if err != nil {
		return nil, fmt.Errorf("failed to ping database: %v", err)
	}
	fmt.Println("Database connected successfully!")

	// Table creation queries
	tables := map[string]string{
		"threads": `
			CREATE TABLE IF NOT EXISTS threads (
				id INTEGER PRIMARY KEY AUTOINCREMENT,
				title TEXT, -- Optional for comments
				content TEXT NOT NULL,
				user_id INTEGER NOT NULL,
				parent_id INTEGER, -- NULL for top-level threads
				created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
				depth INTEGER DEFAULT 0, -- Nesting level
				FOREIGN KEY (user_id) REFERENCES users(id),
				FOREIGN KEY (parent_id) REFERENCES threads(id) ON DELETE CASCADE
			);
		`,
		"users": `
			CREATE TABLE IF NOT EXISTS users (
				id INTEGER PRIMARY KEY AUTOINCREMENT,
				username TEXT UNIQUE NOT NULL,
				is_admin BOOLEAN NOT NULL DEFAULT 0
			)
		`,
		"likes": `
			CREATE TABLE IF NOT EXISTS likes (
				id INTEGER PRIMARY KEY AUTOINCREMENT,
				thread_id INTEGER NOT NULL,
				user_id INTEGER NOT NULL,
				created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
				FOREIGN KEY (thread_id) REFERENCES threads(id) ON DELETE CASCADE,
				FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
				UNIQUE (thread_id, user_id)
			)
		`,
		"dislikes": `
			CREATE TABLE IF NOT EXISTS dislikes (
				id INTEGER PRIMARY KEY AUTOINCREMENT,
				thread_id INTEGER NOT NULL,
				user_id INTEGER NOT NULL,
				created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
				FOREIGN KEY (thread_id) REFERENCES threads(id) ON DELETE CASCADE,
				FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
				UNIQUE (thread_id, user_id)
			)
		`,
	}

	for name, query := range tables {
		_, err = db.Exec(query)
		if err != nil {
			return nil, fmt.Errorf("failed to create %s table: %v", name, err)
		}
		fmt.Printf("%s table created!\n", name)
	}

	// Initial seeds
	seeds := map[string]string{
		"admin_user": `
			INSERT OR IGNORE INTO users (id, username, is_admin)
			VALUES (1, 'admin_user', 1)
		`,
		"welcome_thread": `
			INSERT OR IGNORE INTO threads (id, title, content, user_id)
			VALUES (1, 'Welcome to the Forum', 'Please follow the rules.', 1)
		`,
	}

	for name, query := range seeds {
		_, err = db.Exec(query)
		if err != nil {
			return nil, fmt.Errorf("failed to seed %s: %v", name, err)
		}
		fmt.Printf("%s seeded!\n", name)
	}

	return db, nil
}

func main() {
	db, err := initializeDatabase()
	if err != nil {
		log.Fatalf("Error initializing database: %v", err)
	}
	defer db.Close()

	r := gin.Default()
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:3000"}, // Your frontend's origin
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		AllowCredentials: true,
	}))

	// Thread Routes
	// --------------------------------------------------------------------------------------------------------------------
	threadRoutes := r.Group("/threads")
	threadRoutes.Use(authMiddleware())
	{
		// Route for MAIN threads
		threadRoutes.GET("", func(c *gin.Context) {
			searchQuery := c.DefaultQuery("search", "")
			sortBy := c.DefaultQuery("sortBy", "created_at") // Default sort field is `created_at`

			// Map valid sort fields to their corresponding aliases
			validSortColumns := map[string]string{
				"created_at": "threads.created_at",
				"likes":      "likes_count",
				"dislikes":   "dislikes_count",
				"comments":   "comments_count",
			}

			// Validate and sanitize `sortBy`
			sortColumn, ok := validSortColumns[sortBy]
			if !ok {
				sortColumn = "threads.created_at"
			}

			// Handle pagination
			page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
			limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))
			if page < 1 {
				page = 1
			}
			if limit < 1 {
				limit = 3
			}
			offset := (page - 1) * limit

			// Build the SQL query dynamically
			query := fmt.Sprintf(`
				SELECT 
					users.username AS author,
					threads.id, 
					COALESCE(threads.title, '') AS title, 
					threads.content, 
					threads.created_at,
					COUNT(DISTINCT likes.id) AS likes_count,
					COUNT(DISTINCT dislikes.id) AS dislikes_count,
					COUNT(DISTINCT comments.id) AS comments_count
				FROM threads
				LEFT JOIN users ON threads.user_id = users.id
				LEFT JOIN likes ON threads.id = likes.thread_id
				LEFT JOIN dislikes ON threads.id = dislikes.thread_id
				LEFT JOIN threads AS comments ON threads.id = comments.parent_id
				WHERE threads.title IS NOT NULL
				AND (threads.title LIKE ? OR threads.content LIKE ?)
				GROUP BY users.username, threads.id, threads.title, threads.content, threads.created_at
				ORDER BY %s DESC
				LIMIT ? OFFSET ?
			`, sortColumn)

			// Execute the query
			rows, err := db.Query(query, "%"+searchQuery+"%", "%"+searchQuery+"%", limit, offset)
			if err != nil {
				log.Printf("Error executing query: %v", err)
				c.JSON(500, gin.H{"error": "Failed to fetch threads"})
				return
			}
			defer rows.Close()

			var threads []gin.H
			for rows.Next() {
				var id, likesCount, dislikesCount, commentsCount int
				var author, title, content, createdAt string
				if err := rows.Scan(&author, &id, &title, &content, &createdAt, &likesCount, &dislikesCount, &commentsCount); err != nil {
					log.Printf("Error scanning row: %v", err)
					c.JSON(500, gin.H{"error": "Failed to scan thread"})
					return
				}
				threads = append(threads, gin.H{
					"id":             id,
					"author":         author,
					"title":          title,
					"content":        content,
					"created_at":     createdAt,
					"likes_count":    likesCount,
					"dislikes_count": dislikesCount,
					"comments_count": commentsCount,
				})
			}

			if len(threads) == 0 {
				c.JSON(200, gin.H{"threads": []interface{}{}})
				return
			}

			c.JSON(200, gin.H{
				"threads":     threads,
				"currentPage": page,
				"totalPages":  calculateTotalPagesForThreads(db, searchQuery, limit),
			})
		})

		// Route to check thread authorization
		threadRoutes.GET("/:id/authorize", func(c *gin.Context) {
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
				c.JSON(200, gin.H{"authorized": false, "message": "User is not authorized to modify this thread"})
				return
			}

			c.JSON(200, gin.H{"authorized": true, "message": "User is authorized to modify this thread"})
		})

		// Route to view single thread and ALL its child comments (Recursive)
		threadRoutes.GET("/:id", func(c *gin.Context) {
			threadID := c.Param("id")
			query := c.DefaultQuery("query", "")
			sortBy := c.DefaultQuery("sortBy", "created_at")

			// Fetch thread details
			var thread struct {
				ID        int
				Title     sql.NullString
				Content   string
				CreatedAt string
				ParentID  sql.NullInt64
			}
			err := db.QueryRow(`
				SELECT id, title, content, created_at, parent_id
				FROM threads
				WHERE id = ?
			`, threadID).Scan(&thread.ID, &thread.Title, &thread.Content, &thread.CreatedAt, &thread.ParentID)
			if err != nil {
				c.JSON(404, gin.H{"error": "Thread not found"})
				return
			}

			// Fetch all comments recursively
			rows, err := db.Query(`
				WITH RECURSIVE CommentTree AS (
					SELECT * FROM threads WHERE parent_id = ?
					UNION ALL
					SELECT t.* FROM threads t
					INNER JOIN CommentTree ct ON t.parent_id = ct.id
				)
				SELECT 
					ct.id, 
					ct.parent_id, 
					ct.user_id, 
					ct.content, 
					ct.created_at, 
					users.username AS author,
					(SELECT COUNT(*) FROM likes WHERE likes.thread_id = ct.id) AS likes_count,
					(SELECT COUNT(*) FROM dislikes WHERE dislikes.thread_id = ct.id) AS dislikes_count
				FROM CommentTree ct
				LEFT JOIN users ON ct.user_id = users.id
				WHERE ct.id != ? AND (ct.content LIKE ? OR users.username LIKE ?)
				ORDER BY 
					CASE 
						WHEN ? = 'created_at' THEN ct.created_at
						WHEN ? = 'likes' THEN likes_count
						WHEN ? = 'dislikes' THEN dislikes_count
						ELSE ct.created_at
					END DESC;
			`, threadID, threadID, "%"+query+"%", "%"+query+"%", sortBy, sortBy, sortBy)

			if err != nil {
				log.Printf("Error fetching comments: %v", err)
				c.JSON(500, gin.H{"error": "Failed to fetch comments"})
				return
			}
			defer rows.Close()

			// Parse comments
			comments := []gin.H{}
			for rows.Next() {
				var id, userID, likesCount, dislikesCount int
				var parentID sql.NullInt64
				var author, content, createdAt string
				if err := rows.Scan(&id, &parentID, &userID, &content, &createdAt, &author, &likesCount, &dislikesCount); err != nil {
					log.Printf("Error scanning row: %v", err)
					c.JSON(500, gin.H{"error": "Failed to parse comments"})
					return
				}
				comments = append(comments, gin.H{
					"id":             id,
					"parent_id":      parentID.Int64,
					"author":         author,
					"content":        content,
					"created_at":     createdAt,
					"likes_count":    likesCount,
					"dislikes_count": dislikesCount,
				})
			}

			c.JSON(200, gin.H{
				"thread": gin.H{
					"id":         thread.ID,
					"title":      thread.Title.String,
					"content":    thread.Content,
					"created_at": thread.CreatedAt,
					"parent_id":  thread.ParentID.Int64,
				},
				"comments": comments,
			})
		})

		// Route to create a thread
		threadRoutes.POST("", func(c *gin.Context) {
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

		// Route to update a thread
		threadRoutes.PUT("/:id", func(c *gin.Context) {
			username := c.DefaultQuery("username", "")

			// Validate user
			userID, err := getUserIDFromUsername(db, username)
			if err != nil {
				c.JSON(400, gin.H{"error": err.Error()})
				return
			}

			threadID := c.Param("id")

			// Check ownership or admin privileges
			authorized := checkThreadOwnershipOrAdmin(db, username, userID, threadID)
			if !authorized {
				c.JSON(403, gin.H{"error": "You are not authorized to edit this thread"})
				return
			}

			// Bind JSON payload
			var thread struct {
				Title   string `json:"title"`
				Content string `json:"content"`
			}
			if err := c.ShouldBindJSON(&thread); err != nil {
				c.JSON(400, gin.H{"error": err.Error()})
				return
			}

			// Check if it's a comment
			var existingTitle sql.NullString
			err = db.QueryRow(`SELECT title FROM threads WHERE id = ?`, threadID).Scan(&existingTitle)
			if err != nil {
				c.JSON(404, gin.H{"error": "Thread not found"})
				return
			}

			isComment := !existingTitle.Valid

			// Validate input
			errors := validateThread(db, !isComment, &thread)
			if len(errors) > 0 {
				c.JSON(400, gin.H{"errors": errors})
				return
			}

			// Build update query
			query := "UPDATE threads SET"
			params := []interface{}{}

			if !isComment && thread.Title != "" {
				query += " title = ?,"
				params = append(params, thread.Title)
			}

			if thread.Content != "" {
				query += " content = ?,"
				params = append(params, thread.Content)
			}

			if len(params) == 0 {
				c.JSON(400, gin.H{"error": "No valid fields to update"})
				return
			}

			query = query[:len(query)-1] + " WHERE id = ?"
			params = append(params, threadID)

			// Execute query
			_, err = db.Exec(query, params...)
			if err != nil {
				c.JSON(500, gin.H{"error": "Failed to update thread"})
				return
			}

			c.JSON(200, gin.H{"message": "Thread updated successfully"})
		})

		// Route to delete a thread
		threadRoutes.DELETE("/:id", func(c *gin.Context) {
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

		// Route to create a comment as a thread
		threadRoutes.POST("/:id/comment", func(c *gin.Context) {
			threadID := c.Param("id")
			username := c.DefaultQuery("username", "")

			userID, err := getUserIDFromUsername(db, username)
			if err != nil {
				c.JSON(400, gin.H{"error": "Invalid username"})
				return
			}

			var comment struct {
				Content string `json:"content"`
			}
			if err := c.ShouldBindJSON(&comment); err != nil {
				c.JSON(400, gin.H{"error": "Invalid payload"})
				return
			}

			var parentDepth int
			db.QueryRow(`SELECT depth FROM threads WHERE id = ?`, threadID).Scan(&parentDepth)

			if parentDepth >= 5 { // Limit nesting to 5 levels
				c.JSON(400, gin.H{"error": "Maximum nesting depth reached"})
				return
			}

			_, err = db.Exec(`
				INSERT INTO threads (content, user_id, parent_id, depth, created_at)
				VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
			`, comment.Content, userID, threadID, parentDepth+1)
			if err != nil {
				c.JSON(500, gin.H{"error": "Failed to create comment"})
				return
			}

			c.JSON(200, gin.H{"message": "Comment created successfully!"})
		})
	}

	// User Interaction Routes
	// -------------------------------------------------------------------------------------
	interactionRoutes := r.Group("/threads/:id")
	{
		// Route to get user's interaction state (liked/disliked)
		interactionRoutes.GET("/interaction", func(c *gin.Context) {
			threadID := c.Param("id")
			username := c.Query("username")

			// Validate username
			userID, err := getUserIDFromUsername(db, username)
			if err != nil {
				c.JSON(400, gin.H{"error": "Invalid username"})
				return
			}

			// Check if user liked the thread
			var liked bool
			err = db.QueryRow("SELECT EXISTS(SELECT 1 FROM likes WHERE thread_id = ? AND user_id = ?)", threadID, userID).Scan(&liked)
			if err != nil {
				c.JSON(500, gin.H{"error": "Failed to fetch like state"})
				return
			}

			// Check if user disliked the thread
			var disliked bool
			err = db.QueryRow("SELECT EXISTS(SELECT 1 FROM dislikes WHERE thread_id = ? AND user_id = ?)", threadID, userID).Scan(&disliked)
			if err != nil {
				c.JSON(500, gin.H{"error": "Failed to fetch dislike state"})
				return
			}

			c.JSON(200, gin.H{
				"liked":    liked,
				"disliked": disliked,
			})
		})

		// Route to get likes count
		interactionRoutes.GET("/likes", func(c *gin.Context) {
			threadID := c.Param("id")
			username := c.Query("username")
			var count int

			err := db.QueryRow("SELECT COUNT(*) FROM likes WHERE thread_id = ?", threadID).Scan(&count)
			if err != nil {
				c.JSON(500, gin.H{"error": "Failed to fetch likes count"})
				return
			}

			// Check if the current user has liked the thread
			var hasLiked bool
			if username != "" {
				err = db.QueryRow(`
					SELECT EXISTS (
						SELECT 1 FROM likes
						JOIN users ON likes.user_id = users.id
						WHERE likes.thread_id = ? AND users.username = ?
					)
				`, threadID, username).Scan(&hasLiked)
				if err != nil {
					c.JSON(500, gin.H{"error": "Failed to fetch user like status"})
					return
				}
			}

			c.JSON(200, gin.H{"likes_count": count})
		})

		// Route to get dislikes count
		interactionRoutes.GET("/dislikes", func(c *gin.Context) {
			threadID := c.Param("id")
			username := c.Query("username")

			var count int

			err := db.QueryRow("SELECT COUNT(*) FROM dislikes WHERE thread_id = ?", threadID).Scan(&count)
			if err != nil {
				c.JSON(500, gin.H{"error": "Failed to fetch dislikes count"})
				return
			}

			// Check if the current user has disliked the thread
			var hasDisliked bool
			if username != "" {
				err = db.QueryRow(`
					SELECT EXISTS (
						SELECT 1 FROM dislikes
						JOIN users ON dislikes.user_id = users.id
						WHERE dislikes.thread_id = ? AND users.username = ?
					)
				`, threadID, username).Scan(&hasDisliked)
				if err != nil {
					c.JSON(500, gin.H{"error": "Failed to fetch user dislike status"})
					return
				}
			}

			c.JSON(200, gin.H{"dislikes_count": count})
		})

		// Route to like a thread
		interactionRoutes.POST("/like", func(c *gin.Context) {
			threadID := c.Param("id")
			username := c.DefaultQuery("username", "")

			// Validate username and get user ID
			userID, err := getUserIDFromUsername(db, username)
			if err != nil {
				c.JSON(400, gin.H{"error": "Invalid username"})
				return
			}

			// Validate if thread exists
			var exists int
			err = db.QueryRow("SELECT COUNT(*) FROM threads WHERE id = ?", threadID).Scan(&exists)
			if err != nil || exists == 0 {
				c.JSON(404, gin.H{"error": "Thread not found"})
				return
			}

			// Remove dislike if it exists
			_, err = db.Exec("DELETE FROM dislikes WHERE thread_id = ? AND user_id = ?", threadID, userID)
			if err != nil {
				c.JSON(500, gin.H{"error": "Failed to remove dislike"})
				return
			}

			// Add like
			_, err = db.Exec("INSERT INTO likes (thread_id, user_id) VALUES (?, ?) ON CONFLICT DO NOTHING", threadID, userID)
			if err != nil {
				c.JSON(500, gin.H{"error": "Failed to like thread"})
				return
			}

			c.JSON(200, gin.H{"message": "Thread liked successfully!"})
		})

		// Route to dislike a thread
		interactionRoutes.POST("/dislike", func(c *gin.Context) {
			threadID := c.Param("id")
			username := c.DefaultQuery("username", "")

			// Validate username and get user ID
			userID, err := getUserIDFromUsername(db, username)
			if err != nil {
				c.JSON(400, gin.H{"error": "Invalid username"})
				return
			}

			// Validate if thread exists
			var exists int
			err = db.QueryRow("SELECT COUNT(*) FROM threads WHERE id = ?", threadID).Scan(&exists)
			if err != nil || exists == 0 {
				c.JSON(404, gin.H{"error": "Thread not found"})
				return
			}

			// Remove like if it exists
			_, err = db.Exec("DELETE FROM likes WHERE thread_id = ? AND user_id = ?", threadID, userID)
			if err != nil {
				c.JSON(500, gin.H{"error": "Failed to remove like"})
				return
			}

			// Add dislike
			_, err = db.Exec("INSERT INTO dislikes (thread_id, user_id) VALUES (?, ?) ON CONFLICT DO NOTHING", threadID, userID)
			if err != nil {
				c.JSON(500, gin.H{"error": "Failed to dislike thread"})
				return
			}

			c.JSON(200, gin.H{"message": "Thread disliked successfully!"})
		})

		// Route to remove a like
		interactionRoutes.DELETE("/like", func(c *gin.Context) {
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
		interactionRoutes.DELETE("/dislike", func(c *gin.Context) {
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
	}

	// User Routes
	// -------------------------------------------------------------------------------------
	userRoutes := r.Group("/users")
	{
		// Route to register a new user
		userRoutes.POST("", func(c *gin.Context) {
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

		// Route to log in a user by username and generate JWT
		userRoutes.POST("/login", func(c *gin.Context) {
			var credentials struct {
				Username string `json:"username"`
			}

			// Bind the incoming JSON request to the struct
			if err := c.ShouldBindJSON(&credentials); err != nil {
				c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid payload"})
				return
			}

			// Check if the username exists in the database
			var existingUser string
			err := db.QueryRow("SELECT username FROM users WHERE username = ?", credentials.Username).Scan(&existingUser)
			if err != nil {
				if err == sql.ErrNoRows {
					c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid username"})
				} else {
					c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to authenticate user"})
				}
				return
			}

			// Generate JWT token for the authenticated user
			token, err := generateJWT(existingUser)
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
				return
			}

			c.JSON(http.StatusOK, gin.H{"token": token})
		})
	}

	// Start the server
	r.Run(":8080")
}

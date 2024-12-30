package controllers

import (
	"backend/models"
	"database/sql"
	"log"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

// Retrieves threads with optional filters for category, and tag
func GetThreads(c *gin.Context, db *sql.DB) {
	// Extract query parameters
	query := c.DefaultQuery("query", "")
	sortBy := c.DefaultQuery("sortBy", "created_at")
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))
	category := c.Query("category")
	tag := c.Query("tag")

	// Validate pagination inputs
	if page < 1 {
		page = 1
	}
	if limit < 1 {
		limit = 10
	}
	offset := (page - 1) * limit

	// Fetch threads with the appropriate filters
	threads, err := models.FetchThreads(db, query, sortBy, limit, offset, tag, category)
	if err != nil {
		log.Printf("Error fetching threads: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch threads"})
		return
	}

	// Count threads for pagination
	totalCount := models.GetThreadCount(db, query, tag, category)
	totalPages := (totalCount + limit - 1) / limit

	// Check if no threads are returned
	if len(threads) == 0 {
		c.JSON(http.StatusOK, gin.H{
			"threads":     []interface{}{},
			"currentPage": page,
			"totalPages":  totalPages,
		})
		return
	}

	// Respond with threads and pagination info
	c.JSON(http.StatusOK, gin.H{
		"threads":     threads,
		"currentPage": page,
		"totalPages":  totalPages,
	})
}

// Check thread authorization
func GetThreadAuthorization(c *gin.Context, db *sql.DB) {
	// Get username from query
	username := c.DefaultQuery("username", "")

	if username == "" {
		c.JSON(200, gin.H{"authorized": false, "message": "User is not authorized to modify this thread"})
		return
	}

	// Fetch user ID
	userID, err := models.GetUserIDFromUsername(db, username)
	if err != nil {
		c.JSON(400, gin.H{"error": "Invalid userID"})
		return
	}

	// Get thread ID
	threadID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid thread ID"})
		return
	}

	// Check if the user is authorized (owner or admin)
	authorized := models.CheckThreadOwnershipOrAdmin(db, username, userID, threadID)

	// If the user is not authorized
	if !authorized {
		c.JSON(200, gin.H{"authorized": false, "message": "User is not authorized to modify this thread"})
		return
	}

	c.JSON(200, gin.H{"authorized": true, "message": "User is authorized to modify this thread"})
}

// view single thread and ALL its child comments (Recursive)
func GetThreadDetails(c *gin.Context, db *sql.DB) {
	// Get thread ID from URL parameters
	threadID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid thread ID"})
		return
	}

	// Fetch thread details
	thread, err := models.FetchThreadByID(db, threadID)
	if err != nil {
		log.Printf("Error fetching thread: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch thread"})
		return
	}
	if thread == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Thread not found"})
		return
	}

	// Fetch comments
	query := c.DefaultQuery("query", "")
	sortBy := c.DefaultQuery("sortBy", "created_at")
	comments, err := models.FetchCommentsByThreadID(db, threadID, query, sortBy)
	if err != nil {
		log.Printf("Error fetching comments: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch comments"})
		return
	}

	//Return empty array instead of null
	if len(comments) == 0 {
		c.JSON(http.StatusOK, gin.H{
			"thread":   thread,
			"comments": []interface{}{},
		})
		return
	}

	// Respond with thread details and comments
	c.JSON(http.StatusOK, gin.H{
		"thread":   thread,
		"comments": comments,
	})
}

// GetCategories handles the request to fetch all categories
func GetCategories(c *gin.Context, db *sql.DB) {
	// Call the model to fetch categories
	categories, err := models.FetchCategories(db)
	if err != nil {
		log.Printf("Error fetching categories: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch categories"})
		return
	}

	// Return categories as JSON
	c.JSON(http.StatusOK, gin.H{"categories": categories})
}

// GetCategories handles the request to fetch all tags
func GetTags(c *gin.Context, db *sql.DB) {
	// Call the model to fetch tags
	tags, err := models.FetchTags(db)
	if err != nil {
		log.Printf("Error fetching tags: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch tags"})
		return
	}

	// Return categories as JSON
	c.JSON(http.StatusOK, gin.H{"tags": tags})
}

// Create a thread (+ Tags + Category)
func CreateThread(c *gin.Context, db *sql.DB) {
	// Bind the incoming JSON request to the struct for thread data
	var requestBody struct {
		Username string  `json:"username"` // Add username to the request body
		Title    *string `json:"title"`
		Content  *string `json:"content"`
		Category string  `json:"category"`
		Tag      string  `json:"tag"`
	}

	if err := c.ShouldBindJSON(&requestBody); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}

	// Check if username is provided
	if requestBody.Username == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Username is required"})
		return
	}

	// Validate and get the user ID using the helper function
	userID, err := models.GetUserIDFromUsername(db, requestBody.Username)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid username"})
		return
	}

	// Validate the thread data using a helper function
	thread := struct {
		Title   *string `json:"title"`
		Content *string `json:"content"`
	}{
		Title:   requestBody.Title,
		Content: requestBody.Content,
	}

	errors := validateThread(db, false, &thread)
	if len(errors) > 0 {
		c.JSON(http.StatusUnprocessableEntity, gin.H{"errors": errors})
		return
	}

	// Use the model function to create the thread
	err = models.CreateThread(db, requestBody.Title, requestBody.Content, userID, requestBody.Category, requestBody.Tag)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create thread"})
		return
	}

	// Return a success message
	c.JSON(http.StatusCreated, gin.H{"message": "Thread created successfully!"})
}

// Update a thread
func UpdateThread(c *gin.Context, db *sql.DB) {
	username := c.DefaultQuery("username", "")

	// Validate user
	userID, err := models.GetUserIDFromUsername(db, username)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Parse thread ID
	threadID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid thread ID"})
		return
	}

	// Check ownership or admin privileges
	authorized := models.CheckThreadOwnershipOrAdmin(db, username, userID, threadID)
	if !authorized {
		c.JSON(http.StatusForbidden, gin.H{"error": "You are not authorized to edit this thread"})
		return
	}

	// Bind JSON payload
	var threadUpdate struct {
		Title   *string `json:"title"`   // Nullable field for title
		Content *string `json:"content"` // Nullable field for content
	}
	if err := c.ShouldBindJSON(&threadUpdate); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}

	// Check if it's a comment
	var existingTitle sql.NullString
	err = db.QueryRow(`SELECT title FROM threads WHERE id = ?`, threadID).Scan(&existingTitle)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Thread not found"})
		return
	}

	isComment := !existingTitle.Valid

	// Validate input
	errors := validateThread(db, !isComment, &threadUpdate)
	if len(errors) > 0 {
		c.JSON(http.StatusBadRequest, gin.H{"errors": errors})
		return
	}

	// Execute the update using the model
	err = models.UpdateThread(db, threadID, threadUpdate.Title, threadUpdate.Content)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update thread"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Thread updated successfully"})
}

// Delete a thread
func DeleteThread(c *gin.Context, db *sql.DB) {
	// Get the username from the query or header
	username := c.DefaultQuery("username", "")

	// Validate and get the user ID using the helper function
	userID, err := models.GetUserIDFromUsername(db, username)
	if err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}

	// Get the thread ID from the URL parameter
	threadID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid thread ID"})
		return
	}

	// Check ownership or admin status
	authorized := models.CheckThreadOwnershipOrAdmin(db, username, userID, threadID)
	if !authorized {
		c.JSON(403, gin.H{"error": "You are not authorized to delete this thread"})
		return
	}

	// Delete the thread from the database
	err = models.DeleteThread(db, threadID)
	if err != nil {
		c.JSON(500, gin.H{"error": "Failed to delete thread"})
		return
	}

	c.JSON(200, gin.H{"message": "Thread deleted!"})
}

// Create a comment as a thread
func CommentThread(c *gin.Context, db *sql.DB) {
	// Get thread ID and username
	threadIDStr := c.Param("id")
	username := c.DefaultQuery("username", "")

	// Parse thread ID
	threadID, err := strconv.Atoi(threadIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid thread ID"})
		return
	}

	// Validate username and get user ID
	userID, err := models.GetUserIDFromUsername(db, username)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid username"})
		return
	}

	// Bind JSON payload for comment content
	var comment struct {
		Content string `json:"content"`
	}
	if err := c.ShouldBindJSON(&comment); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid payload"})
		return
	}

	// Get parent depth
	var parentDepth int
	err = db.QueryRow(`SELECT depth FROM threads WHERE id = ?`, threadID).Scan(&parentDepth)
	if err != nil {
		if err == sql.ErrNoRows {
			c.JSON(http.StatusNotFound, gin.H{"error": "Thread not found"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch thread depth"})
		}
		return
	}

	// Use the model to create the comment
	err = models.CreateComment(db, comment.Content, userID, threadID, parentDepth+1)
	if err != nil {
		if err.Error() == "maximum nesting depth reached" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Maximum nesting depth reached"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create comment"})
		}
		return
	}

	// Respond with success
	c.JSON(http.StatusCreated, gin.H{"message": "Comment created successfully!"})
}

package controllers

import (
	"backend/models"
	"database/sql"
	"log"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

// Get user's interaction state (liked/disliked)
func GetInteractionState(c *gin.Context, db *sql.DB) {
	threadID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(400, gin.H{"error": "Invalid thread ID"})
		return
	}

	username := c.Query("username")
	userID, err := models.GetUserIDFromUsername(db, username)
	if err != nil {
		c.JSON(400, gin.H{"error": "Invalid username"})
		return
	}

	liked, disliked, err := models.GetInteractionState(db, threadID, userID)
	if err != nil {
		c.JSON(500, gin.H{"error": "Failed to fetch interaction state"})
		return
	}

	c.JSON(200, gin.H{
		"liked":    liked,
		"disliked": disliked,
	})
}

// Get likes count
func GetLikesCount(c *gin.Context, db *sql.DB) {
	threadID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid thread ID"})
		return
	}

	if err := models.CheckThreadExists(db, threadID); err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	count, err := models.GetLikesCount(db, threadID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch likes count"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"likes_count": count})
}

// Get dislikes count
func GetDislikesCount(c *gin.Context, db *sql.DB) {
	threadID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid thread ID"})
		return
	}

	if err := models.CheckThreadExists(db, threadID); err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	count, err := models.GetDislikesCount(db, threadID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch dislikes count"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"dislikes_count": count})
}

// Like a thread
func LikeThread(c *gin.Context, db *sql.DB) {
	threadID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(400, gin.H{"error": "Invalid thread ID"})
		return
	}

	username := c.DefaultQuery("username", "")
	userID, err := models.GetUserIDFromUsername(db, username)
	if err != nil {
		c.JSON(400, gin.H{"error": "Invalid username"})
		return
	}

	if err := models.CheckThreadExists(db, threadID); err != nil {
		c.JSON(404, gin.H{"error": err.Error()})
		return
	}

	if err := models.AddLike(db, threadID, userID); err != nil {
		c.JSON(500, gin.H{"error": "Failed to like thread"})
		return
	}

	c.JSON(200, gin.H{"message": "Thread liked successfully!"})
}

// Dislike a thread
func DislikeThread(c *gin.Context, db *sql.DB) {
	threadID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(400, gin.H{"error": "Invalid thread ID"})
		return
	}

	username := c.DefaultQuery("username", "")
	userID, err := models.GetUserIDFromUsername(db, username)
	if err != nil {
		c.JSON(400, gin.H{"error": "Invalid username"})
		return
	}

	if err := models.CheckThreadExists(db, threadID); err != nil {
		c.JSON(404, gin.H{"error": err.Error()})
		return
	}

	if err := models.AddDislike(db, threadID, userID); err != nil {
		c.JSON(500, gin.H{"error": "Failed to dislike thread"})
		return
	}

	c.JSON(200, gin.H{"message": "Thread disliked successfully!"})
}

// Remove a like
func RemoveLike(c *gin.Context, db *sql.DB) {
	threadID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid thread ID"})
		return
	}

	username := c.DefaultQuery("username", "")
	userID, err := models.GetUserIDFromUsername(db, username)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid username"})
		return
	}

	if err := models.CheckThreadExists(db, threadID); err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	if err := models.RemoveLike(db, threadID, userID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to remove like"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Like removed successfully!"})
}

// Remove a dislike
func RemoveDislike(c *gin.Context, db *sql.DB) {
	threadID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid thread ID"})
		return
	}

	username := c.DefaultQuery("username", "")
	userID, err := models.GetUserIDFromUsername(db, username)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid username"})
		return
	}

	if err := models.CheckThreadExists(db, threadID); err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	if err := models.RemoveDislike(db, threadID, userID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to remove dislike"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Dislike removed successfully!"})
}

func GetSaveState(c *gin.Context, db *sql.DB) {
	threadID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid thread ID"})
		return
	}

	username := c.Query("username")
	userID, err := models.GetUserIDFromUsername(db, username)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid username"})
		return
	}

	var saveState bool
	saveState, err = models.FetchSaveState(db, threadID, userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to check save state"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"isSaved": saveState})
}

func SaveThread(c *gin.Context, db *sql.DB) {
	// Log the incoming request
	log.Println("SaveThread handler called")

	// Extract and validate thread ID
	threadID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		log.Printf("Invalid thread ID: %v", c.Param("id"))
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid thread ID"})
		return
	}
	log.Printf("Thread ID: %d", threadID)

	// Extract and validate username
	username := c.Query("username")
	if username == "" {
		log.Println("Username query parameter is missing")
		c.JSON(http.StatusBadRequest, gin.H{"error": "Username is required"})
		return
	}
	log.Printf("Username: %s", username)

	// Fetch user ID
	userID, err := models.GetUserIDFromUsername(db, username)
	if err != nil {
		log.Printf("Failed to fetch user ID for username '%s': %v", username, err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid username"})
		return
	}
	log.Printf("User ID: %d", userID)

	// Attempt to save the thread
	err = models.SaveThread(db, threadID, userID)
	if err != nil {
		log.Printf("Failed to save thread (Thread ID: %d, User ID: %d): %v", threadID, userID, err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save thread"})
		return
	}
	log.Printf("Thread saved successfully (Thread ID: %d, User ID: %d)", threadID, userID)

	// Respond with success
	c.JSON(http.StatusOK, gin.H{"message": "Thread saved successfully"})
}

func UnsaveThread(c *gin.Context, db *sql.DB) {
	threadID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(400, gin.H{"error": "Invalid thread ID"})
		return
	}

	username := c.Query("username")
	userID, err := models.GetUserIDFromUsername(db, username)
	if err != nil {
		c.JSON(400, gin.H{"error": "Invalid username"})
		return
	}

	if err := models.UnsaveThread(db, threadID, userID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to unsave thread"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Thread unsaved successfully"})
}

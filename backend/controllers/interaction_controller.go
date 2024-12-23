package controllers

import (
	"backend/models"
	"database/sql"
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
	userID, err := getUserIDFromUsername(db, username)
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
	userID, err := getUserIDFromUsername(db, username)
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
	userID, err := getUserIDFromUsername(db, username)
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
	userID, err := getUserIDFromUsername(db, username)
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
	userID, err := getUserIDFromUsername(db, username)
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

package controllers

import (
	"backend/models"
	"database/sql"
	"net/http"

	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
)

type PasswordChangeRequest struct {
	CurrentPassword string `json:"currentPassword"`
	NewPassword     string `json:"newPassword"`
}

// Register a new user
func Register(c *gin.Context, db *sql.DB) {
	type UserInput struct {
		Username string `json:"username"`
		Password string `json:"password"`
	}

	var input UserInput
	// Bind the incoming JSON request to the struct
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}

	// Check if the username already exists
	exists, err := models.CheckUsernameExists(db, input.Username)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}
	if exists {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Username already exists"})
		return
	}

	// Hash the password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to hash password"})
		return
	}

	// Insert the new user into the database
	err = models.CreateUser(db, input.Username, string(hashedPassword))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create user"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "User created!"})
}

// Log in a user by username and generate JWT
func Login(c *gin.Context, db *sql.DB) {
	type LoginInput struct {
		Username string `json:"username"`
		Password string `json:"password"`
	}

	var input LoginInput
	// Bind the incoming JSON request to the struct
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid payload"})
		return
	}

	// Retrieve the user from the database
	var hashedPassword string
	hashedPassword, err := models.GetPassword(db, input.Username)
	if err == sql.ErrNoRows {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid username or password"})
		return
	} else if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to query database"})
		return
	}

	// Compare passwords
	err = bcrypt.CompareHashAndPassword([]byte(hashedPassword), []byte(input.Password))
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Wrong password"})
		return
	}

	// Generate JWT token for the authenticated user
	token, err := generateJWT(input.Username)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"token": token})
}

func GetAuthorization(c *gin.Context, db *sql.DB) {
	username := c.Param("username")
	if username == "" {
		c.JSON(http.StatusBadRequest, false)
		return
	}

	isAdmin, err := models.IsAdmin(db, username)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to check admin status"})
		return
	}

	c.JSON(http.StatusOK, isAdmin)
}

func GetUserScores(c *gin.Context, db *sql.DB) {
	username := c.Param("username")
	if username == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Username is required"})
		return
	}

	scores, err := models.FetchUserScores(db, username)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to check user scores"})
		return
	}

	c.JSON(http.StatusOK, scores)
}

func GetLeaderboard(c *gin.Context, db *sql.DB) {
	leaderboard, err := models.FetchLeaderboard(db)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to check leaderboard"})
		return
	}

	c.JSON(http.StatusOK, leaderboard)
}

func GetUserInfo(c *gin.Context, db *sql.DB) {
	username := c.Param("username")
	if username == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Username is required"})
		return
	}

	info, err := models.FetchUserInfo(db, username)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to check user information"})
		return
	}

	c.JSON(http.StatusOK, info)
}

func GetUserMetrics(c *gin.Context, db *sql.DB) {
	username := c.Param("username")

	metrics, err := models.FetchUserMetrics(db, username)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to fetch metrics",
		})
		return
	}

	if metrics == nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "Metrics not found for the specified user",
		})
		return
	}

	c.JSON(http.StatusOK, metrics)
}

func GetUserActivity(c *gin.Context, db *sql.DB) {
	username := c.Param("username")

	// Fetch threads and comments for the user
	userActivity, err := models.FetchUserActivity(db, username)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch user activity"})
		return
	}

	c.JSON(http.StatusOK, userActivity)
}

// Retrieves a user's saved threads for SideBar
func GetUserSavedThreads(c *gin.Context, db *sql.DB) {
	username := c.Param("username")

	userID, err := models.GetUserIDFromUsername(db, username)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid username"})
		return
	}

	savedThreads, err := models.FetchUserSavedThreads(db, userID)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Failed to fetch saved threads"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"savedThreads": savedThreads})
}

func UpdatePasswordHandler(c *gin.Context, db *sql.DB) {
	var req PasswordChangeRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}

	username := c.Param("username")

	hashedPassword, err := models.GetPassword(db, username)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Internal server error"})
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(hashedPassword), []byte(req.CurrentPassword)); err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Current password is incorrect"})
		return
	}

	newHashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.NewPassword), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update password"})
		return
	}

	if err := models.UpdatePassword(db, username, string(newHashedPassword)); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update password"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Password updated successfully"})
}

func UpdateUserBio(c *gin.Context, db *sql.DB) {
	username := c.Param("username")

	var requestBody struct {
		Bio string `json:"bio"`
	}

	if err := c.ShouldBindJSON(&requestBody); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}

	if requestBody.Bio == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Bio cannot be empty"})
		return
	}

	err := models.UpdateBio(db, requestBody.Bio, username)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update bio"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Bio updated successfully"})
}

func PromoteUserHandler(c *gin.Context, db *sql.DB) {
	username := c.Param("username")

	err := models.PromoteUser(db, username)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to promote user"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "User promoted to admin successfully"})
}

func DemoteUserHandler(c *gin.Context, db *sql.DB) {
	username := c.Param("username")

	err := models.DemoteUser(db, username)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to demote user"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "User demoted successfully"})
}

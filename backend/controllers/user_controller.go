package controllers

import (
	"backend/models"
	"database/sql"
	"net/http"

	"github.com/gin-gonic/gin"
)

// Register a new user
func Register(c *gin.Context, db *sql.DB) {
	var user struct {
		Username string `json:"username"`
	}

	// Bind the incoming JSON request to the struct
	if err := c.ShouldBindJSON(&user); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid payload"})
		return
	}

	// Check if the username already exists
	exists, err := models.CheckUsernameExists(db, user.Username)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}
	if exists {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Username already exists"})
		return
	}

	// Insert the new user into the database
	err = models.CreateUser(db, user.Username)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create user"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "User created!"})
}

// Log in a user by username and generate JWT
func Login(c *gin.Context, db *sql.DB) {
	var credentials struct {
		Username string `json:"username"`
	}

	// Bind the incoming JSON request to the struct
	if err := c.ShouldBindJSON(&credentials); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid payload"})
		return
	}

	// Check if the username exists in the database
	authenticated, err := models.AuthenticateUser(db, credentials.Username)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to authenticate user"})
		return
	}
	if !authenticated {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid username"})
		return
	}

	// Generate JWT token for the authenticated user
	token, err := generateJWT(credentials.Username)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"token": token})
}

package models

import (
	"database/sql"
)

// Check if a username exists in the database
func CheckUsernameExists(db *sql.DB, username string) (bool, error) {
	var existingUser string
	err := db.QueryRow("SELECT username FROM users WHERE username = ?", username).Scan(&existingUser)
	if err != nil {
		if err == sql.ErrNoRows {
			return false, nil // Username does not exist
		}
		return false, err // Database error
	}
	return true, nil // Username exists
}

// Insert a new user into the database
func CreateUser(db *sql.DB, username string) error {
	_, err := db.Exec("INSERT INTO users (username) VALUES (?)", username)
	return err
}

// Authenticate a user by username
func AuthenticateUser(db *sql.DB, username string) (bool, error) {
	exists, err := CheckUsernameExists(db, username)
	if err != nil {
		return false, err
	}
	return exists, nil
}

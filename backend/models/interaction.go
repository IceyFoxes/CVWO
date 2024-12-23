package models

import (
	"database/sql"
	"errors"
)

// GetInteractionState retrieves whether the user liked or disliked a thread
func GetInteractionState(db *sql.DB, threadID, userID int) (bool, bool, error) {
	var liked, disliked bool

	// Check like state
	err := db.QueryRow("SELECT EXISTS(SELECT 1 FROM likes WHERE thread_id = ? AND user_id = ?)", threadID, userID).Scan(&liked)
	if err != nil {
		return false, false, err
	}

	// Check dislike state
	err = db.QueryRow("SELECT EXISTS(SELECT 1 FROM dislikes WHERE thread_id = ? AND user_id = ?)", threadID, userID).Scan(&disliked)
	if err != nil {
		return false, false, err
	}

	return liked, disliked, nil
}

// GetLikesCount retrieves the total number of likes for a thread
func GetLikesCount(db *sql.DB, threadID int) (int, error) {
	var count int
	err := db.QueryRow("SELECT COUNT(*) FROM likes WHERE thread_id = ?", threadID).Scan(&count)
	return count, err
}

// GetDislikesCount retrieves the total number of dislikes for a thread
func GetDislikesCount(db *sql.DB, threadID int) (int, error) {
	var count int
	err := db.QueryRow("SELECT COUNT(*) FROM dislikes WHERE thread_id = ?", threadID).Scan(&count)
	return count, err
}

// AddLike adds a like for a thread and removes any existing dislike
func AddLike(db *sql.DB, threadID, userID int) error {
	// Remove dislike
	_, err := db.Exec("DELETE FROM dislikes WHERE thread_id = ? AND user_id = ?", threadID, userID)
	if err != nil {
		return err
	}

	// Add like
	_, err = db.Exec("INSERT INTO likes (thread_id, user_id) VALUES (?, ?) ON CONFLICT DO NOTHING", threadID, userID)
	return err
}

// AddDislike adds a dislike for a thread and removes any existing like
func AddDislike(db *sql.DB, threadID, userID int) error {
	// Remove like
	_, err := db.Exec("DELETE FROM likes WHERE thread_id = ? AND user_id = ?", threadID, userID)
	if err != nil {
		return err
	}

	// Add dislike
	_, err = db.Exec("INSERT INTO dislikes (thread_id, user_id) VALUES (?, ?) ON CONFLICT DO NOTHING", threadID, userID)
	return err
}

// RemoveLike removes a like for a thread
func RemoveLike(db *sql.DB, threadID, userID int) error {
	_, err := db.Exec("DELETE FROM likes WHERE thread_id = ? AND user_id = ?", threadID, userID)
	return err
}

// RemoveDislike removes a dislike for a thread
func RemoveDislike(db *sql.DB, threadID, userID int) error {
	_, err := db.Exec("DELETE FROM dislikes WHERE thread_id = ? AND user_id = ?", threadID, userID)
	return err
}

// CheckThreadExists verifies if a thread exists
func CheckThreadExists(db *sql.DB, threadID int) error {
	var exists int
	err := db.QueryRow("SELECT COUNT(*) FROM threads WHERE id = ?", threadID).Scan(&exists)
	if err != nil || exists == 0 {
		return errors.New("thread not found")
	}
	return nil
}

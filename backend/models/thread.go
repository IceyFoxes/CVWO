package models

import (
	"database/sql"
	"fmt"
)

type Thread struct {
	ID            int     `json:"id"`
	Title         *string `json:"title,omitempty"` // Title is nullable (for comments)
	Content       string  `json:"content"`
	Author        string  `json:"author"`
	CreatedAt     string  `json:"created_at"`
	UserID        int     `json:"user_id"`
	ParentID      *int    `json:"parent_id,omitempty"` // Nullable parent thread
	LikesCount    int     `json:"likes_count"`
	DislikesCount int     `json:"dislikes_count"`
	CommentsCount int     `json:"comments_count"`
	Depth         int     `json:"depth"` // Depth for nested comments
}

func FetchMainThreads(db *sql.DB, searchQuery, sortBy string, limit, offset int) ([]Thread, error) {
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

	query := fmt.Sprintf(`
		SELECT 
			threads.id, 
			COALESCE(threads.title, '') AS title, 
			threads.content, 
			users.username AS author, 
			threads.created_at, 
			threads.user_id,
			COUNT(DISTINCT likes.id) AS likes_count,
			COUNT(DISTINCT dislikes.id) AS dislikes_count,
			COUNT(DISTINCT comments.id) AS comments_count,
			threads.depth
		FROM threads
		LEFT JOIN users ON threads.user_id = users.id
		LEFT JOIN likes ON threads.id = likes.thread_id
		LEFT JOIN dislikes ON threads.id = dislikes.thread_id
		LEFT JOIN threads AS comments ON threads.id = comments.parent_id
		WHERE threads.title IS NOT NULL
		AND (threads.title LIKE ? OR threads.content LIKE ?)
		GROUP BY threads.id, threads.title, threads.content, threads.created_at, threads.user_id, users.username
		ORDER BY %s DESC
		LIMIT ? OFFSET ?
	`, sortColumn)

	rows, err := db.Query(query, "%"+searchQuery+"%", "%"+searchQuery+"%", limit, offset)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var threads []Thread
	for rows.Next() {
		var thread Thread
		if err := rows.Scan(
			&thread.ID,
			&thread.Title,
			&thread.Content,
			&thread.Author,
			&thread.CreatedAt,
			&thread.UserID,
			&thread.LikesCount,
			&thread.DislikesCount,
			&thread.CommentsCount,
			&thread.Depth,
		); err != nil {
			return nil, err
		}
		threads = append(threads, thread)
	}
	return threads, nil
}

func FetchThreadByID(db *sql.DB, threadID int) (*Thread, error) {
	var thread Thread
	err := db.QueryRow(`
		SELECT 
			threads.id, 
			threads.title, 
			threads.content, 
			users.username AS author, 
			threads.created_at, 
			threads.user_id, 
			threads.parent_id, 
			COUNT(DISTINCT likes.id) AS likes_count,
			COUNT(DISTINCT dislikes.id) AS dislikes_count,
			COUNT(DISTINCT comments.id) AS comments_count,
			threads.depth
		FROM threads
		LEFT JOIN users ON threads.user_id = users.id
		LEFT JOIN likes ON threads.id = likes.thread_id
		LEFT JOIN dislikes ON threads.id = dislikes.thread_id
		LEFT JOIN threads AS comments ON threads.id = comments.parent_id
		WHERE threads.id = ?
	`, threadID).Scan(
		&thread.ID,
		&thread.Title,
		&thread.Content,
		&thread.Author,
		&thread.CreatedAt,
		&thread.UserID,
		&thread.ParentID,
		&thread.LikesCount,
		&thread.DislikesCount,
		&thread.CommentsCount,
		&thread.Depth)

	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil // No thread found
		}
		return nil, err
	}
	return &thread, nil
}

func FetchCommentsByThreadID(db *sql.DB, threadID int, query, sortBy string) ([]Thread, error) {
	validSortColumns := map[string]string{
		"created_at": "ct.created_at",
		"likes":      "likes_count",
		"dislikes":   "dislikes_count",
	}

	// Validate and sanitize `sortBy`
	sortColumn, ok := validSortColumns[sortBy]
	if !ok {
		sortColumn = "ct.created_at"
	}

	queryString := fmt.Sprintf(`
		WITH RECURSIVE CommentTree AS (
			SELECT * FROM threads WHERE parent_id = ?
			UNION ALL
			SELECT t.* FROM threads t
			INNER JOIN CommentTree ct ON t.parent_id = ct.id
		)
		SELECT 
			ct.id, 
			COALESCE(ct.title, NULL) AS title, 
			ct.content, 
			users.username AS author, 
			ct.created_at, 
			ct.user_id, 
			ct.parent_id, 
			(SELECT COUNT(*) FROM likes WHERE likes.thread_id = ct.id) AS likes_count,
			(SELECT COUNT(*) FROM dislikes WHERE dislikes.thread_id = ct.id) AS dislikes_count,
			(SELECT COUNT(*) FROM threads WHERE threads.parent_id = ct.id) AS comments_count,
			ct.depth
		FROM CommentTree ct
		LEFT JOIN users ON ct.user_id = users.id
		WHERE ct.id != ? AND (ct.content LIKE ? OR users.username LIKE ?)
		ORDER BY %s DESC
	`, sortColumn)

	rows, err := db.Query(queryString, threadID, threadID, "%"+query+"%", "%"+query+"%")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var comments []Thread
	for rows.Next() {
		var comment Thread
		var title sql.NullString
		var parentID sql.NullInt64

		if err := rows.Scan(
			&comment.ID,
			&title,
			&comment.Content,
			&comment.Author,
			&comment.CreatedAt,
			&comment.UserID,
			&parentID,
			&comment.LikesCount,
			&comment.DislikesCount,
			&comment.CommentsCount,
			&comment.Depth,
		); err != nil {
			return nil, err
		}

		// Handle nullable fields
		if title.Valid {
			comment.Title = &title.String
		} else {
			comment.Title = nil
		}
		if parentID.Valid {
			tempID := int(parentID.Int64)
			comment.ParentID = &tempID
		} else {
			comment.ParentID = nil
		}

		comments = append(comments, comment)
	}

	return comments, nil
}

func CreateThread(db *sql.DB, title *string, content *string, userID int) error {
	_, err := db.Exec(`
		INSERT INTO threads (title, content, user_id, created_at)
		VALUES (?, ?, ?, datetime('now'))
	`, title, content, userID)
	return err
}

func UpdateThread(db *sql.DB, threadID int, title, content *string) error {
	query := "UPDATE threads SET"
	params := []interface{}{}

	if title != nil {
		query += " title = ?,"
		params = append(params, *title)
	}

	if content != nil {
		query += " content = ?,"
		params = append(params, *content)
	}

	query = query[:len(query)-1] + " WHERE id = ?"
	params = append(params, threadID)

	_, err := db.Exec(query, params...)
	return err
}

func DeleteThread(db *sql.DB, threadID int) error {
	_, err := db.Exec("DELETE FROM threads WHERE id = ?", threadID)
	return err
}

func CreateComment(db *sql.DB, content string, userID int, parentID int, depth int) error {
	// Ensure the depth does not exceed the limit
	if depth > 5 {
		return fmt.Errorf("maximum nesting depth reached")
	}

	// Insert the comment
	_, err := db.Exec(`
		INSERT INTO threads (content, user_id, parent_id, depth, created_at)
		VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
	`, content, userID, parentID, depth)
	return err
}

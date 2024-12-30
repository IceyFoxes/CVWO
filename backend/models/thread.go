package models

import (
	"database/sql"
	"fmt"
	"log"
	"strings"
)

type Thread struct {
	ID            int     `json:"id"`
	Title         *string `json:"title,omitempty"` // Nullable for comments
	Content       string  `json:"content"`
	Category      *string `json:"category,omitempty"` // Nullable category
	Author        string  `json:"author"`
	CreatedAt     string  `json:"createdAt"`
	UserID        int     `json:"userId"`
	ParentID      *int    `json:"parentId,omitempty"` // Nullable parent thread
	LikesCount    int     `json:"likesCount"`
	DislikesCount int     `json:"dislikesCount"`
	CommentsCount int     `json:"commentsCount"`
	Depth         int     `json:"depth"`
	Tag           *string `json:"tag,omitempty"` // Nullable for comments
}

// Category struct for mapping database categories and tags
type Classifier struct {
	ID   int    `json:"id"`
	Name string `json:"name"`
}

// Fetch a list of threads filtering for category, tag, or other queries
func FetchThreads(db *sql.DB, searchQuery, sortBy string, limit, offset int, tag, category string) ([]Thread, error) {
	validSortColumns := map[string]string{
		"created_at": "threads.created_at",
		"likes":      "likes_count",
		"dislikes":   "dislikes_count",
		"comments":   "comments_count",
	}

	// Validate `sortBy`
	sortColumn, ok := validSortColumns[sortBy]
	if !ok {
		sortColumn = "threads.created_at"
	}

	// Add conditions for tag and category dynamically
	var conditions []string
	var params []interface{}
	params = append(params, "%"+searchQuery+"%", "%"+searchQuery+"%")
	if tag != "" {
		conditions = append(conditions, "tags.name = ?")
		params = append(params, tag)
	}
	if category != "" {
		conditions = append(conditions, "categories.name = ?")
		params = append(params, category)
	}
	conditionsString := ""
	if len(conditions) > 0 {
		conditionsString = "AND " + strings.Join(conditions, " AND ")
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
			threads.depth,
			categories.name AS category,
			COALESCE(tags.name, '') AS tag
		FROM threads
		LEFT JOIN users ON threads.user_id = users.id
		LEFT JOIN likes ON threads.id = likes.thread_id
		LEFT JOIN dislikes ON threads.id = dislikes.thread_id
		LEFT JOIN threads AS comments ON threads.id = comments.parent_id
		LEFT JOIN categories ON threads.category_id = categories.id
		LEFT JOIN tags ON threads.tag_id = tags.id
		WHERE threads.title IS NOT NULL
		AND (threads.title LIKE ? OR threads.content LIKE ?)
		%s
		GROUP BY threads.id, threads.title, threads.content, threads.created_at, threads.user_id, users.username, categories.name, tags.name
		ORDER BY %s DESC
		LIMIT ? OFFSET ?
	`, conditionsString, sortColumn)

	// Add pagination params
	params = append(params, limit, offset)

	rows, err := db.Query(query, params...)
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
			&thread.Category,
			&thread.Tag,
		); err != nil {
			return nil, err
		}
		threads = append(threads, thread)
	}
	return threads, nil
}

// Single Thread (Fetching the Thread content)
func FetchThreadByID(db *sql.DB, threadID int) (*Thread, error) {
	var thread Thread

	query := `
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
		threads.depth,
		categories.name AS category,
		tags.name AS tag
	FROM threads
	LEFT JOIN users ON threads.user_id = users.id
	LEFT JOIN likes ON threads.id = likes.thread_id
	LEFT JOIN dislikes ON threads.id = dislikes.thread_id
	LEFT JOIN threads AS comments ON threads.id = comments.parent_id
	LEFT JOIN categories ON threads.category_id = categories.id
	LEFT JOIN tags ON threads.tag_id = tags.id
	WHERE threads.id = ?
	GROUP BY threads.id, users.username, categories.name, tags.name
	`

	err := db.QueryRow(query, threadID).Scan(
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
		&thread.Depth,
		&thread.Category,
		&thread.Tag,
	)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil // No thread found
		}
		return nil, err
	}

	return &thread, nil
}

// Single Thread (Fetching the comments)
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
				SELECT 
					t.*, 
					categories.name AS category,
					tags.name AS tag
				FROM threads t
				LEFT JOIN categories ON t.category_id = categories.id
				LEFT JOIN tags ON t.tag_id = tags.id
				WHERE t.parent_id = ?
				UNION ALL
				SELECT 
					t.*, 
					COALESCE(ct.category, NULL) AS category,
					COALESCE(ct.tag, NULL) AS tag
				FROM threads t
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
				ct.depth,
				ct.category,
				ct.tag
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
			&comment.Category,
			&comment.Tag,
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

// FetchCategories retrieves all categories from the database
func FetchCategories(db *sql.DB) ([]Classifier, error) {
	query := "SELECT id, name FROM categories ORDER BY id ASC"
	rows, err := db.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var categories []Classifier
	for rows.Next() {
		var category Classifier
		if err := rows.Scan(&category.ID, &category.Name); err != nil {
			return nil, err
		}
		categories = append(categories, category)
	}

	return categories, nil
}

// FetchTags retrieves all tags from the database.
func FetchTags(db *sql.DB) ([]Classifier, error) {
	// Query to fetch all tags
	rows, err := db.Query("SELECT id, name FROM tags")
	if err != nil {
		return nil, fmt.Errorf("failed to fetch tags: %v", err)
	}
	defer rows.Close()

	// Slice to store the retrieved tags
	var tags []Classifier
	for rows.Next() {
		var tag Classifier
		if err := rows.Scan(&tag.ID, &tag.Name); err != nil {
			return nil, fmt.Errorf("failed to scan tag: %v", err)
		}
		tags = append(tags, tag)
	}

	// Check for errors from iterating over rows
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating over tags: %v", err)
	}

	return tags, nil
}

func CreateThread(db *sql.DB, title *string, content *string, userID int, category, tag string) error {
	// Resolve or insert the category
	var categoryID int
	err := db.QueryRow(`
        SELECT id FROM categories WHERE name = ?
    `, category).Scan(&categoryID)
	if err != nil {
		if err == sql.ErrNoRows {
			res, insertErr := db.Exec(`INSERT INTO categories (name) VALUES (?)`, category)
			if insertErr != nil {
				return fmt.Errorf("error inserting new category '%s': %v", category, insertErr)
			}
			id, _ := res.LastInsertId()
			categoryID = int(id)
		} else {
			return err
		}
	}

	// Resolve or insert the tag
	var tagID int
	err = db.QueryRow(`
        SELECT id FROM tags WHERE name = ?
    `, tag).Scan(&tagID)
	if err != nil {
		if err == sql.ErrNoRows {
			res, insertErr := db.Exec(`INSERT INTO tags (name) VALUES (?)`, tag)
			if insertErr != nil {
				return fmt.Errorf("error inserting new tag '%s': %v", tag, insertErr)
			}
			id, _ := res.LastInsertId()
			tagID = int(id)
		} else {
			return err
		}
	}

	// Insert the thread
	_, err = db.Exec(`
        INSERT INTO threads (title, content, user_id, category_id, tag_id, created_at)
        VALUES (?, ?, ?, ?, ?, datetime('now'))
    `, title, content, userID, categoryID, tagID)
	if err != nil {
		return fmt.Errorf("error inserting thread: %v", err)
	}

	return nil
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
	if depth > 3 {
		return fmt.Errorf("maximum nesting depth reached")
	}

	// Insert the comment
	_, err := db.Exec(`
		INSERT INTO threads (content, user_id, parent_id, depth, created_at)
		VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
	`, content, userID, parentID, depth)
	return err
}

func GetThreadCount(db *sql.DB, searchQuery, tag, category string) int {
	query := `
	SELECT COUNT(*) 
	FROM threads 
	LEFT JOIN categories ON threads.category_id = categories.id
	LEFT JOIN tags ON threads.tag_id = tags.id
	WHERE threads.title IS NOT NULL 
	AND (threads.title LIKE ? OR threads.content LIKE ?)
	`

	var conditions []string
	var params []interface{}
	params = append(params, "%"+searchQuery+"%", "%"+searchQuery+"%")
	if tag != "" {
		conditions = append(conditions, "tags.name = ?")
		params = append(params, tag)
	}
	if category != "" {
		conditions = append(conditions, "categories.name = ?")
		params = append(params, category)
	}

	if len(conditions) > 0 {
		query += " AND " + strings.Join(conditions, " AND ")
	}

	var count int
	err := db.QueryRow(query, params...).Scan(&count)
	if err != nil {
		log.Printf("Error counting threads: %v", err)
		return 0
	}

	return count
}

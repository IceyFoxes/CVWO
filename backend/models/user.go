package models

import (
	"database/sql"
	"fmt"
	"log"
)

type UserInfo struct {
	UserID   int    `json:"userId"`
	Username string `json:"username"`
	JoinDate string `json:"joinDate"`
	Role     string `json:"role"`
	Bio      string `json:"bio"`
}

type UserScores struct {
	UserID            int     `json:"userId"`
	Username          string  `json:"username"`
	ThreadsScore      float64 `json:"threadsScore"`
	CommentsScore     float64 `json:"commentsScore"`
	ContributionScore float64 `json:"contributionScore"`
}

/*Contribution Score =
  (Threads Created × 5) +
  (Average Likes per Thread × 10) +
  (Comments Made × 2) +
  (Average Likes per Comment × 5) -
  (Dislikes Received × 2)*/

type UserMetrics struct {
	ThreadsCreated   int `json:"threadsCreated"`
	CommentsMade     int `json:"commentsMade"`
	LikesReceived    int `json:"likesReceived"`
	DislikesReceived int `json:"dislikesReceived"`
}

type UserActivity struct {
	Threads  []Thread `json:"threads"`
	Comments []Thread `json:"comments"` // Comments are threads with null title
}

type SavedThread struct {
	ID        int    `json:"id"`
	Title     string `json:"title"`
	CreatedAt string `json:"createdAt"`
}

// Check if a user is an admin
func IsAdmin(db *sql.DB, username string) (bool, error) {
	var isAdmin bool
	err := db.QueryRow("SELECT is_admin FROM users WHERE username = $1", username).Scan(&isAdmin)
	if err != nil {
		if err == sql.ErrNoRows {
			return false, nil // User does not exist
		}
		return false, err // Other database errors
	}
	return isAdmin, nil
}

// Check if the user is the owner of the thread or an admin
func CheckThreadOwnershipOrAdmin(db *sql.DB, username string, userID int, threadID int) bool {
	// Check if the thread exists and get the user_id (thread creator)
	var threadCreatorID int
	err := db.QueryRow("SELECT user_id FROM threads WHERE id = $1", threadID).Scan(&threadCreatorID)
	if err != nil {
		return false // If thread does not exist or there is an error, deny access
	}

	// If the user is the thread owner, return true
	if userID == threadCreatorID {
		return true
	}

	// Check if the user is an admin
	isAdmin, err := IsAdmin(db, username)
	if err != nil {
		return false // If there's an error in checking admin status, deny access
	}

	// If the user is an admin, allow modification
	return isAdmin
}

// Get user ID from username and validate username existence
func GetUserIDFromUsername(db *sql.DB, username string) (int, error) {
	if username == "" {
		return 0, fmt.Errorf("username is required")
	}

	var userID int
	err := db.QueryRow("SELECT id FROM users WHERE username = $1", username).Scan(&userID)
	if err != nil {
		if err == sql.ErrNoRows {
			return 0, fmt.Errorf("username does not exist")
		}
		return 0, fmt.Errorf("failed to fetch user information: %v", err)
	}

	return userID, nil
}

// Check if a username exists in the database
func CheckUsernameExists(db *sql.DB, username string) (bool, error) {
	var existingUser string
	err := db.QueryRow("SELECT username FROM users WHERE username = $1", username).Scan(&existingUser)
	if err != nil {
		if err == sql.ErrNoRows {
			return false, nil // Username does not exist
		}
		return false, err // Database error
	}
	return true, nil // Username exists
}

// Insert a new user into the database
func CreateUser(db *sql.DB, username string, password string) error {
	_, err := db.Exec("INSERT INTO users (username, password) VALUES ($1, $2)", username, password)
	return err
}

// Get the hashed password for a user
func GetPassword(db *sql.DB, username string) (string, error) {
	var hashedPassword string

	// Query the database for the hashed password
	err := db.QueryRow("SELECT password FROM users WHERE username = $1", username).Scan(&hashedPassword)
	if err != nil {
		return "", err
	}

	return hashedPassword, nil
}

// Update the password for a user
func UpdatePassword(db *sql.DB, username string, newPassword string) error {
	_, err := db.Exec("UPDATE users SET password = $1 WHERE username = $2", newPassword, username)
	if err != nil {
		return err
	}
	return nil
}

// Fetch a user's activity scores
func FetchUserScores(db *sql.DB, username string) (*UserScores, error) {
	query := `
		SELECT 
			u.id AS user_id,
			u.username,

			-- Threads Score
			COUNT(CASE WHEN t.parent_id IS NULL THEN 1 END) * 5 +
			COALESCE(AVG(CASE WHEN t.parent_id IS NULL THEN l.likes END), 0) * 10 AS threads_score,

			-- Comments Score
			COUNT(CASE WHEN t.parent_id IS NOT NULL THEN 1 END) * 2 +
			COALESCE(AVG(CASE WHEN t.parent_id IS NOT NULL THEN lc.likes END), 0) * 5 AS comments_score,

			-- Contribution Score
			(
				COUNT(CASE WHEN t.parent_id IS NULL THEN 1 END) * 5 +
				COALESCE(AVG(CASE WHEN t.parent_id IS NULL THEN l.likes END), 0) * 10 +
				COUNT(CASE WHEN t.parent_id IS NOT NULL THEN 1 END) * 2 +
				COALESCE(AVG(CASE WHEN t.parent_id IS NOT NULL THEN lc.likes END), 0) * 5 - 
				COUNT(d.id) * 2
			) AS contribution_score

		FROM 
			users u
		LEFT JOIN threads t ON u.id = t.user_id
		LEFT JOIN (
			SELECT thread_id, COUNT(*) AS likes 
			FROM likes 
			GROUP BY thread_id
		) l ON t.id = l.thread_id
		LEFT JOIN (
			SELECT thread_id, COUNT(*) AS likes 
			FROM likes 
			GROUP BY thread_id
		) lc ON t.id = lc.thread_id
		LEFT JOIN dislikes d ON t.id = d.thread_id

		WHERE u.username = $1
		GROUP BY u.id, u.username
    `

	row := db.QueryRow(query, username)

	var entry UserScores
	err := row.Scan(
		&entry.UserID,
		&entry.Username,
		&entry.ThreadsScore,
		&entry.CommentsScore,
		&entry.ContributionScore,
	)
	if err != nil {
		return nil, err
	}

	return &entry, nil
}

// Fetch ALL users' activity scores
func FetchLeaderboard(db *sql.DB) ([]UserScores, error) {
	query := `
		SELECT 
			u.id AS user_id,
			u.username,

			-- Threads Score
			COUNT(CASE WHEN t.parent_id IS NULL THEN 1 END) * 5 +
			COALESCE(AVG(CASE WHEN t.parent_id IS NULL THEN l.likes END), 0) * 10 AS threads_score,

			-- Comments Score
			COUNT(CASE WHEN t.parent_id IS NOT NULL THEN 1 END) * 2 +
			COALESCE(AVG(CASE WHEN t.parent_id IS NOT NULL THEN lc.likes END), 0) * 5 AS comments_score,

			-- Contribution Score
			(
				COUNT(CASE WHEN t.parent_id IS NULL THEN 1 END) * 5 +
				COALESCE(AVG(CASE WHEN t.parent_id IS NULL THEN l.likes END), 0) * 10 +
				COUNT(CASE WHEN t.parent_id IS NOT NULL THEN 1 END) * 2 +
				COALESCE(AVG(CASE WHEN t.parent_id IS NOT NULL THEN lc.likes END), 0) * 5 - 
				COUNT(d.id) * 2
			) AS contribution_score

		FROM 
			users u
		LEFT JOIN threads t ON u.id = t.user_id
		LEFT JOIN dislikes d ON t.id = d.thread_id
		GROUP BY u.id, u.username
		ORDER BY contribution_score DESC;
	`

	rows, err := db.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var leaderboard []UserScores
	for rows.Next() {
		var entry UserScores
		err := rows.Scan(
			&entry.UserID,
			&entry.Username,
			&entry.ThreadsScore,
			&entry.CommentsScore,
			&entry.ContributionScore,
		)
		if err != nil {
			log.Println("Error scanning row:", err)
			continue
		}
		leaderboard = append(leaderboard, entry)
	}

	return leaderboard, nil
}

// Fetch a user's visible basic information
func FetchUserInfo(db *sql.DB, username string) (*UserInfo, error) {
	query := `
		SELECT 
			id AS user_id,
			username,
			created_at AS join_date,
			CASE
				WHEN is_admin = TRUE THEN 'Admin'
				ELSE 'Regular User'
			END AS role,
			bio
		FROM users
		WHERE username = $1;
	`

	row := db.QueryRow(query, username)

	var userInfo UserInfo
	err := row.Scan(
		&userInfo.UserID,
		&userInfo.Username,
		&userInfo.JoinDate,
		&userInfo.Role,
		&userInfo.Bio,
	)
	if err != nil {
		return nil, err
	}

	return &userInfo, nil
}

// Fetch a user's activity metrics
func FetchUserMetrics(db *sql.DB, username string) (*UserMetrics, error) {
	query := `
		SELECT 
			COUNT(CASE WHEN t.parent_id IS NULL THEN 1 END) AS threads_created,
			COUNT(CASE WHEN t.parent_id IS NOT NULL THEN 1 END) AS comments_made,
			COALESCE(SUM(likes_count), 0) AS likes_received,
			COALESCE(SUM(dislikes_count), 0) AS dislikes_received
		FROM 
			users u
		LEFT JOIN threads t ON u.id = t.user_id
		LEFT JOIN (
			SELECT thread_id, COUNT(*) AS likes_count FROM likes GROUP BY thread_id
		) l ON t.id = l.thread_id
		LEFT JOIN (
			SELECT thread_id, COUNT(*) AS dislikes_count FROM dislikes GROUP BY thread_id
		) d ON t.id = d.thread_id
		WHERE 
			u.username = $1
		GROUP BY u.id;
	`

	row := db.QueryRow(query, username)

	var metrics UserMetrics
	err := row.Scan(
		&metrics.ThreadsCreated,
		&metrics.CommentsMade,
		&metrics.LikesReceived,
		&metrics.DislikesReceived,
	)
	if err != nil {
		return nil, err
	}

	return &metrics, nil
}

// Fetch a user's posts and comments
func FetchUserActivity(db *sql.DB, username string) (*UserActivity, error) {
	query := `
		SELECT 
			th.id, 
			th.title, 
			th.content, 
			u_current.username AS author, -- Author of the current thread
			th.created_at, 
			th.user_id, 
			th.parent_id, 
			u_parent.username AS parent_author, -- Author of the parent thread
			(SELECT COUNT(*) FROM likes WHERE thread_id = th.id) AS likes_count,
			(SELECT COUNT(*) FROM dislikes WHERE thread_id = th.id) AS dislikes_count,
			(SELECT COUNT(*) FROM threads WHERE parent_id = th.id) AS comments_count
		FROM threads th
		LEFT JOIN users u_current ON th.user_id = u_current.id
		LEFT JOIN threads th_parent ON th.parent_id = th_parent.id 
		LEFT JOIN users u_parent ON th_parent.user_id = u_parent.id 
		WHERE u_current.username = $1;
	`

	rows, err := db.Query(query, username)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var threads []Thread
	var comments []Thread

	for rows.Next() {
		var thread Thread
		var parentAuthor sql.NullString

		// Scan the query results
		err := rows.Scan(
			&thread.ID, &thread.Title, &thread.Content,
			&thread.Author, &thread.CreatedAt, &thread.UserID, &thread.ParentID,
			&parentAuthor,
			&thread.LikesCount, &thread.DislikesCount, &thread.CommentsCount,
		)
		if err != nil {
			return nil, err
		}

		// Map `parent_author` if not null
		if parentAuthor.Valid {
			thread.ParentAuthor = &parentAuthor.String
		} else {
			thread.ParentAuthor = nil
		}

		// Categorize as thread or comment
		if thread.Title == nil {
			comments = append(comments, thread)
		} else {
			threads = append(threads, thread)
		}
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return &UserActivity{Threads: threads, Comments: comments}, nil
}

// Fetch saved threads for a user
func FetchUserSavedThreads(db *sql.DB, userID int) ([]SavedThread, error) {
	query := `
		SELECT 
			t.id, t.title, t.created_at
		FROM 
			threads t
		JOIN 
			saved_threads st ON t.id = st.thread_id
		WHERE 
			st.user_id = $1;
	`
	rows, err := db.Query(query, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var savedThreads []SavedThread
	for rows.Next() {
		var thread SavedThread
		err := rows.Scan(&thread.ID, &thread.Title, &thread.CreatedAt)
		if err != nil {
			return nil, err
		}
		savedThreads = append(savedThreads, thread)
	}

	if savedThreads == nil {
		savedThreads = []SavedThread{}
	}

	return savedThreads, nil
}

// Update a user's bio
func UpdateBio(db *sql.DB, bio string, username string) error {
	_, err := db.Exec("UPDATE users SET bio = $1 WHERE username = $2", bio, username)
	return err
}

// Promote a user to admin
func PromoteUser(db *sql.DB, username string) error {
	_, err := db.Exec("UPDATE users SET is_admin = TRUE WHERE username = $1", username)
	return err
}

// Demote a user from admin
func DemoteUser(db *sql.DB, username string) error {
	_, err := db.Exec("UPDATE users SET is_admin = FALSE WHERE username = $1", username)
	return err
}

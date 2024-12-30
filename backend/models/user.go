package models

import (
	"database/sql"
	"fmt"
	"log"
)

type UserScores struct {
	UserID            int     `json:"userId"`
	Username          string  `json:"username"`
	ThreadsScore      float64 `json:"threadsScore"`
	CommentsScore     float64 `json:"commentsScore"`
	ContributionScore float64 `json:"contributionScore"`
}

type UserInfo struct {
	UserID   int    `json:"userId"`
	Username string `json:"username"`
	JoinDate string `json:"joinDate"`
	Role     string `json:"role"`
	Bio      string `json:"bio"`
}

type UserMetrics struct {
	ThreadsCreated   int `json:"threadsCreated"`
	CommentsMade     int `json:"commentsMade"`
	LikesReceived    int `json:"likesReceived"`
	DislikesReceived int `json:"dislikesReceived"`
}

type UserThread struct {
	ID            int     `json:"id"`
	Title         *string `json:"title,omitempty"`
	Content       string  `json:"content"`
	Author        string  `json:"author"`
	ParentAuthor  *string `json:"parentAuthor"`
	CreatedAt     string  `json:"createdAt"`
	UserID        int     `json:"userId"`
	ParentID      *int    `json:"parentId,omitempty"`
	LikesCount    int     `json:"likesCount"`
	DislikesCount int     `json:"dislikesCount"`
	CommentsCount int     `json:"commentsCount"`
}

type UserActivity struct {
	Threads  []UserThread `json:"threads"`
	Comments []UserThread `json:"comments"` // Comments are threads with null title
}

type SavedThread struct {
	ID        int    `json:"id"`
	Title     string `json:"title"`
	CreatedAt string `json:"createdAt"`
}

/*Contribution Score =
  (Threads Created × 5) +
  (Average Likes per Thread × 10) +
  (Comments Made × 2) +
  (Average Likes per Comment × 5) -
  (Dislikes Received × 2)*/

// Check if the logged-in user is an admin
func IsAdmin(db *sql.DB, username string) (bool, error) {
	var isAdmin bool
	err := db.QueryRow("SELECT is_admin FROM users WHERE username = ?", username).Scan(&isAdmin)
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
	err := db.QueryRow("SELECT user_id FROM threads WHERE id = ?", threadID).Scan(&threadCreatorID)
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
	err := db.QueryRow("SELECT id FROM users WHERE username = ?", username).Scan(&userID)
	if err != nil {
		if err == sql.ErrNoRows {
			return 0, fmt.Errorf("username does not exist")
		}
		return 0, fmt.Errorf("failed to fetch user information")
	}

	return userID, nil
}

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
func CreateUser(db *sql.DB, username string, password string) error {
	_, err := db.Exec("INSERT INTO users (username, password) VALUES (?, ?)", username, password)
	return err
}

func GetPassword(db *sql.DB, username string) (string, error) {
	var hashedPassword string

	// Query the database for the hashed password
	err := db.QueryRow("SELECT password FROM users WHERE username = ?", username).Scan(&hashedPassword)
	if err != nil {
		return "", err
	}

	return hashedPassword, nil
}

func UpdatePassword(db *sql.DB, username string, newPassword string) error {
	_, err := db.Exec("UPDATE users SET password = ? WHERE username = ?", newPassword, username)
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

		GROUP BY u.id, u.username;
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

		GROUP BY u.id, u.username
		ORDER BY contribution_score DESC; -- Sort by contribution score
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
			log.Println("Error scanning row:", err) // Log the error for each row
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
				WHEN is_admin = 1 THEN 'Admin'
				ELSE 'Regular User'
			END AS role,
			bio
		FROM users
		WHERE username = ?;
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
            u.username = ?
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
			usr.username AS author, 
			CASE 
				WHEN th.parent_id IS NOT NULL THEN pusr.username 
				ELSE NULL 
			END AS parent_author, 
			th.created_at, 
			th.user_id, 
			th.parent_id, 
			(SELECT COUNT(*) FROM likes WHERE thread_id = th.id) AS likes_count,
			(SELECT COUNT(*) FROM dislikes WHERE thread_id = th.id) AS dislikes_count,
			(SELECT COUNT(*) FROM threads WHERE parent_id = th.id) AS comments_count
		FROM threads th
		LEFT JOIN users usr ON th.user_id = usr.id
		LEFT JOIN threads pth ON th.parent_id = pth.id
		LEFT JOIN users pusr ON pth.user_id = pusr.id
		WHERE usr.username = ?;
	`

	rows, err := db.Query(query, username)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var threads []UserThread
	var comments []UserThread

	for rows.Next() {
		var thread UserThread

		err := rows.Scan(
			&thread.ID, &thread.Title, &thread.Content,
			&thread.Author, &thread.ParentAuthor, &thread.CreatedAt, &thread.UserID, &thread.ParentID,
			&thread.LikesCount, &thread.DislikesCount, &thread.CommentsCount,
		)
		if err != nil {
			return nil, err
		}

		// Categorize as thread or comment
		if thread.Title == nil {
			comments = append(comments, thread)
		} else {
			threads = append(threads, thread)
		}
	}

	// Check for errors during iteration
	if err := rows.Err(); err != nil {
		return nil, err
	}

	return &UserActivity{Threads: threads, Comments: comments}, nil
}

func FetchUserSavedThreads(db *sql.DB, userID int) ([]SavedThread, error) {
	query := `
        SELECT 
            t.id, t.title, t.created_at
        FROM 
            threads t
        JOIN 
            saved_threads st ON t.id = st.thread_id
        WHERE 
            st.user_id = ?;
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

	return savedThreads, err
}

func UpdateBio(db *sql.DB, bio string, username string) error {
	_, err := db.Exec("UPDATE users SET bio = ? WHERE username = ?", bio, username)
	return err
}

func PromoteUser(db *sql.DB, username string) error {
	_, err := db.Exec("UPDATE users SET is_admin = 1 WHERE username = ?", username)
	return err
}

func DemoteUser(db *sql.DB, username string) error {
	_, err := db.Exec("UPDATE users SET is_admin = 0 WHERE username = ?", username)
	return err
}

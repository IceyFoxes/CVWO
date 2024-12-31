package config

import (
	"database/sql"
	"log"
	"os"

	_ "github.com/lib/pq"
)

// For Local Testing Purposes
/*func initializeDatabase() (*sql.DB, error) {
	db, err := sql.Open("sqlite", "./forum.db")
	if err != nil {
		return nil, fmt.Errorf("failed to open database: %v", err)
	}

	_, err = db.Exec("PRAGMA foreign_keys = ON;")
	if err != nil {
		return nil, fmt.Errorf("failed to enable foreign keys: %v", err)
	}

	err = db.Ping()
	if err != nil {
		return nil, fmt.Errorf("failed to ping database: %v", err)
	}
	fmt.Println("Database connected successfully!")

	// Table creation queries
	tables := map[string]string{
		"threads": `
			CREATE TABLE IF NOT EXISTS threads (
				id INTEGER PRIMARY KEY AUTOINCREMENT,
				title TEXT, -- Optional for comments
				content TEXT NOT NULL,
				category_id INTEGER,
				tag_id INTEGER,
				user_id INTEGER NOT NULL,
				parent_id INTEGER, -- NULL for top-level threads
				created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
				depth INTEGER DEFAULT 0, -- Nesting level,
				FOREIGN KEY (user_id) REFERENCES users(id),
				FOREIGN KEY (parent_id) REFERENCES threads(id) ON DELETE CASCADE
			);
		`,
		"saved threads": `
			CREATE TABLE IF NOT EXISTS saved_threads (
				id INTEGER PRIMARY KEY AUTOINCREMENT,
				user_id INTEGER NOT NULL,
				thread_id INTEGER NOT NULL,
				FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
				FOREIGN KEY (thread_id) REFERENCES threads(id) ON DELETE CASCADE,
				UNIQUE (user_id, thread_id) -- Ensure a user can't save the same thread multiple times
			);
		`,
		"categories": `
			CREATE TABLE IF NOT EXISTS categories (
				id INTEGER PRIMARY KEY AUTOINCREMENT,
				name TEXT UNIQUE NOT NULL
			);
		`,
		"tags": `
			CREATE TABLE IF NOT EXISTS tags (
				id INTEGER PRIMARY KEY AUTOINCREMENT,
				name TEXT UNIQUE NOT NULL
			);
		`,
		"users": `
			CREATE TABLE IF NOT EXISTS users (
				id INTEGER PRIMARY KEY AUTOINCREMENT,
				username TEXT UNIQUE NOT NULL,
				password TEXT NOT NULL,
				created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
				bio TEXT DEFAULT 'This user has not added a bio yet.',
				is_admin BOOLEAN NOT NULL DEFAULT 0
			);
		`,
		"likes": `
			CREATE TABLE IF NOT EXISTS likes (
				id INTEGER PRIMARY KEY AUTOINCREMENT,
				thread_id INTEGER NOT NULL,
				user_id INTEGER NOT NULL,
				created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
				FOREIGN KEY (thread_id) REFERENCES threads(id) ON DELETE CASCADE,
				FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
				UNIQUE (thread_id, user_id)
			);
		`,
		"dislikes": `
			CREATE TABLE IF NOT EXISTS dislikes (
				id INTEGER PRIMARY KEY AUTOINCREMENT,
				thread_id INTEGER NOT NULL,
				user_id INTEGER NOT NULL,
				created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
				FOREIGN KEY (thread_id) REFERENCES threads(id) ON DELETE CASCADE,
				FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
				UNIQUE (thread_id, user_id)
			);
		`,
	}

	for name, query := range tables {
		_, err = db.Exec(query)
		if err != nil {
			return nil, fmt.Errorf("failed to create %s table: %v", name, err)
		}
		fmt.Printf("%s table created!\n", name)
	}

	// Initial seeds
	seeds := map[string]string{
		"categories": `
			INSERT OR IGNORE INTO categories (id, name) VALUES
			(1, 'Featured'),
			(2, 'Coursework'),
			(3, 'Events'),
			(4, 'Community')
		`,
		"admin_user": `
			INSERT OR IGNORE INTO users (id, username, password, created_at, bio, is_admin)
			VALUES (1, 'admin_user', '$2y$10$rEbQNZucaJ3pgh.qq/WzLujs7F97Zm24ODYam41gcSw1cc4DbiWwK', datetime('now'), 'I am the king.', 1)
		`,
		"welcome_thread": `
			INSERT OR IGNORE INTO threads (id, title, content, category_id, tag_id, user_id, created_at)
			VALUES (1, 'Welcome to the Forum', 'Please follow the rules.', 1, 1, 1, datetime('now'))
		`,
		"tags": `
			INSERT OR IGNORE INTO tags (id, name) VALUES
			(1, 'rules')
		`,
	}

	for name, query := range seeds {
		_, err = db.Exec(query)
		if err != nil {
			return nil, fmt.Errorf("failed to seed %s: %v", name, err)
		}
		fmt.Printf("%s seeded!\n", name)
	}

	return db, nil
}*/

// ConnectDB initializes the database connection
func ConnectDB() (*sql.DB, error) {
	connStr := os.Getenv("DATABASE_URL")
	db, err := sql.Open("postgres", connStr)
	if err != nil {
		log.Printf("Error initializing the database: %v", err)
		return nil, err
	}

	return db, nil
}

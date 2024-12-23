package config

import (
	"database/sql"
	"fmt"
	"log"

	_ "modernc.org/sqlite" // SQLite driver
)

// initializeDatabase creates tables, enables foreign keys, and seeds initial data
func initializeDatabase() (*sql.DB, error) {
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
				user_id INTEGER NOT NULL,
				parent_id INTEGER, -- NULL for top-level threads
				created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
				depth INTEGER DEFAULT 0, -- Nesting level
				FOREIGN KEY (user_id) REFERENCES users(id),
				FOREIGN KEY (parent_id) REFERENCES threads(id) ON DELETE CASCADE
			);
		`,
		"users": `
			CREATE TABLE IF NOT EXISTS users (
				id INTEGER PRIMARY KEY AUTOINCREMENT,
				username TEXT UNIQUE NOT NULL,
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
		"admin_user": `
			INSERT OR IGNORE INTO users (id, username, is_admin)
			VALUES (1, 'admin_user', 1)
		`,
		"welcome_thread": `
			INSERT OR IGNORE INTO threads (id, title, content, user_id)
			VALUES (1, 'Welcome to the Forum', 'Please follow the rules.', 1)
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
}

// ConnectDB initializes the database connection
func ConnectDB() (*sql.DB, error) {
	db, err := initializeDatabase() // Call initializeDatabase
	if err != nil {
		log.Printf("Error initializing the database: %v", err)
		return nil, err
	}
	return db, nil
}

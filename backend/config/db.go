package config

import (
	"database/sql"
	"fmt"
	"log"
	"os"

	_ "github.com/lib/pq"
)

// For Deployment
func InitializeDatabase() (*sql.DB, error) {
	connStr := os.Getenv("DATABASE_URL")
	db, err := sql.Open("postgres", connStr)
	if err != nil {
		return nil, fmt.Errorf("failed to connect to database: %v", err)
	}

	err = db.Ping()
	if err != nil {
		return nil, fmt.Errorf("failed to ping database: %v", err)
	}
	fmt.Println("Database connected successfully!")

	// Table creation queries in an ordered slice
	queries := []struct {
		name  string
		query string
	}{
		{"users", `
			CREATE TABLE IF NOT EXISTS users (
				id SERIAL PRIMARY KEY,
				username TEXT UNIQUE NOT NULL,
				password TEXT NOT NULL,
				created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
				bio TEXT DEFAULT 'This user has not added a bio yet.',
				is_admin BOOLEAN NOT NULL DEFAULT FALSE
			);
		`},
		{"categories", `
			CREATE TABLE IF NOT EXISTS categories (
				id SERIAL PRIMARY KEY,
				name TEXT UNIQUE NOT NULL
			);
		`},
		{"tags", `
			CREATE TABLE IF NOT EXISTS tags (
				id SERIAL PRIMARY KEY,
				name TEXT UNIQUE NOT NULL
			);
		`},
		{"threads", `
			CREATE TABLE IF NOT EXISTS threads (
				id SERIAL PRIMARY KEY,
				title TEXT UNIQUE,
				content TEXT NOT NULL,
				category_id INTEGER,
				tag_id INTEGER,
				user_id INTEGER NOT NULL,
				parent_id INTEGER,
				created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
				depth INTEGER DEFAULT 0,
				FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
			);
		`}, // Note: parent_id foreign key added separately
		{"saved_threads", `
			CREATE TABLE IF NOT EXISTS saved_threads (
				id SERIAL PRIMARY KEY,
				user_id INTEGER NOT NULL,
				thread_id INTEGER NOT NULL,
				FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
				FOREIGN KEY (thread_id) REFERENCES threads(id) ON DELETE CASCADE,
				UNIQUE (user_id, thread_id)
			);
		`},
		{"likes", `
			CREATE TABLE IF NOT EXISTS likes (
				id SERIAL PRIMARY KEY,
				thread_id INTEGER NOT NULL,
				user_id INTEGER NOT NULL,
				created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
				FOREIGN KEY (thread_id) REFERENCES threads(id) ON DELETE CASCADE,
				FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
				UNIQUE (thread_id, user_id)
			);
		`},
		{"dislikes", `
			CREATE TABLE IF NOT EXISTS dislikes (
				id SERIAL PRIMARY KEY,
				thread_id INTEGER NOT NULL,
				user_id INTEGER NOT NULL,
				created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
				FOREIGN KEY (thread_id) REFERENCES threads(id) ON DELETE CASCADE,
				FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
				UNIQUE (thread_id, user_id)
			);
		`},
	}

	// Execute table creation in the specified order
	for _, item := range queries {
		_, err = db.Exec(item.query)
		if err != nil {
			return nil, fmt.Errorf("failed to create %s table: %v", item.name, err)
		}
		fmt.Printf("%s table created!\n", item.name)
	}

	// Add the self-referencing foreign key to the threads table
	_, err = db.Exec(`
		DO $$
		BEGIN
			IF NOT EXISTS (
				SELECT 1
				FROM information_schema.table_constraints
				WHERE constraint_name = 'threads_parent_id_fkey'
				AND table_name = 'threads'
			) THEN
				ALTER TABLE threads
				ADD CONSTRAINT threads_parent_id_fkey
				FOREIGN KEY (parent_id) REFERENCES threads(id) ON DELETE CASCADE;
			END IF;
		END $$;
	`)
	if err != nil {
		log.Printf("Error adding foreign key constraint: %v", err)
	} else {
		fmt.Println("Foreign key constraint added successfully or already exists.")
	}

	// Initial seeds
	seeds := map[string]string{
		"categories": `
			INSERT INTO categories (name)
			VALUES ('Featured'), ('Coursework'), ('Events'), ('Community')
			ON CONFLICT (name) DO NOTHING;
		`,
		"tags": `
			INSERT INTO tags (name)
			VALUES ('Rules')
			ON CONFLICT (name) DO NOTHING;
		`,
		"admin_user": `
			INSERT INTO users (id, username, password, bio, is_admin)
			VALUES (1, 'admin_user', '$2y$10$rEbQNZucaJ3pgh.qq/WzLujs7F97Zm24ODYam41gcSw1cc4DbiWwK', 'I am the king.', TRUE)
			ON CONFLICT (username) DO NOTHING;
		`,
		"welcome_thread": `
			INSERT INTO threads (title, content, category_id, tag_id, user_id, created_at)
			VALUES ('Welcome to the Forum', 'Please follow the rules.', 1, 1, 1, CURRENT_TIMESTAMP)
			ON CONFLICT (title) DO NOTHING;
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

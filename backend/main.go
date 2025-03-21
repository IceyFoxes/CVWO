package main

import (
	"backend/config"
	"backend/routes"
	"log"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	db, err := config.InitializeDatabase()
	if err != nil {
		log.Fatalf("Error initializing database: %v", err)
	}
	defer db.Close()

	router := gin.Default()
	router.Use(cors.New(cors.Config{
		// Change to your deployment app URL if deployed
		AllowOrigins:     []string{"http://localhost:3000", "https://forum2025.netlify.app"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		AllowCredentials: true,
	}))

	// Register routes
	routes.RegisterRoutes(router, db)

	// Start the server
	if err := router.Run(":8080"); err != nil {
		log.Fatalf("Failed to start the server: %v", err)
	}
}

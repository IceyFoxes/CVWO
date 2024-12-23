package routes

import (
	"backend/controllers"
	"backend/middleware"
	"database/sql"

	"github.com/gin-gonic/gin"
)

// RegisterRoutes sets up all the API routes for the application
func RegisterRoutes(router *gin.Engine, db *sql.DB) {
	// Group routes for threads
	threadRoutes := router.Group("/threads")
	threadRoutes.Use(middleware.AuthMiddleware())
	{
		threadRoutes.GET("", func(c *gin.Context) { controllers.GetMainThread(c, db) })
		threadRoutes.GET("/:id/authorize", func(c *gin.Context) { controllers.GetAuthorization(c, db) })
		threadRoutes.GET("/:id", func(c *gin.Context) { controllers.GetThreadDetails(c, db) })
		threadRoutes.POST("", func(c *gin.Context) { controllers.CreateThread(c, db) })
		threadRoutes.POST("/:id/comment", func(c *gin.Context) { controllers.CommentThread(c, db) })
		threadRoutes.PUT("/:id", func(c *gin.Context) { controllers.UpdateThread(c, db) })
		threadRoutes.DELETE("/:id", func(c *gin.Context) { controllers.DeleteThread(c, db) })
	}

	// Group routes for interactions
	interactionRoutes := router.Group("/threads/:id")
	interactionRoutes.Use(middleware.AuthMiddleware())
	{
		interactionRoutes.GET("/interaction", func(c *gin.Context) { controllers.GetInteractionState(c, db) })
		interactionRoutes.GET("/likes", func(c *gin.Context) { controllers.GetLikesCount(c, db) })
		interactionRoutes.GET("/dislikes", func(c *gin.Context) { controllers.GetDislikesCount(c, db) })
		interactionRoutes.POST("/like", func(c *gin.Context) { controllers.LikeThread(c, db) })
		interactionRoutes.POST("/dislike", func(c *gin.Context) { controllers.DislikeThread(c, db) })
		interactionRoutes.DELETE("/like", func(c *gin.Context) { controllers.RemoveLike(c, db) })
		interactionRoutes.DELETE("/dislike", func(c *gin.Context) { controllers.RemoveDislike(c, db) })
	}

	// Group routes for users
	userRoutes := router.Group("/users")
	{
		userRoutes.POST("", func(c *gin.Context) { controllers.Register(c, db) })
		userRoutes.POST("/login", func(c *gin.Context) { controllers.Login(c, db) })
	}
}

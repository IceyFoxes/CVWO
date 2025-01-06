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
	{
		threadRoutes.GET("", func(c *gin.Context) { controllers.GetThreads(c, db) })
		threadRoutes.GET("/categories", func(c *gin.Context) { controllers.GetCategories(c, db) })
		threadRoutes.GET("/tags", func(c *gin.Context) { controllers.GetTags(c, db) })
		threadRoutes.GET("/:id/authorize", func(c *gin.Context) { controllers.GetThreadAuthorization(c, db) })
		threadRoutes.GET("/:id", func(c *gin.Context) { controllers.GetThreadDetails(c, db) })
	}

	// Protected Thread Routes
	protectedThreadRoutes := router.Group("/threads")
	protectedThreadRoutes.Use(middleware.AuthMiddleware())
	{
		protectedThreadRoutes.POST("", func(c *gin.Context) { controllers.CreateThread(c, db) })
		protectedThreadRoutes.POST("/:id/comment", func(c *gin.Context) { controllers.CommentThread(c, db) })
		protectedThreadRoutes.PUT("/:id", func(c *gin.Context) { controllers.UpdateThread(c, db) })
		protectedThreadRoutes.DELETE("/:id", func(c *gin.Context) { controllers.DeleteThread(c, db) })
	}

	// Group routes for interactions
	interactionRoutes := router.Group("/threads/:id")
	{
		interactionRoutes.GET("/likestate", func(c *gin.Context) { controllers.GetInteractionState(c, db) })
		interactionRoutes.GET("/likes", func(c *gin.Context) { controllers.GetLikesCount(c, db) })
		interactionRoutes.GET("/dislikes", func(c *gin.Context) { controllers.GetDislikesCount(c, db) })
		interactionRoutes.GET("/savestate", func(c *gin.Context) { controllers.GetSaveState(c, db) })
	}

	// Protected Interaction Routes
	protectedInteractionRoutes := router.Group("/threads/:id")
	protectedInteractionRoutes.Use(middleware.AuthMiddleware())
	{
		protectedInteractionRoutes.POST("/like", func(c *gin.Context) { controllers.LikeThread(c, db) })
		protectedInteractionRoutes.POST("/dislike", func(c *gin.Context) { controllers.DislikeThread(c, db) })
		protectedInteractionRoutes.POST("/save", func(c *gin.Context) { controllers.SaveThread(c, db) })
		protectedInteractionRoutes.DELETE("/like", func(c *gin.Context) { controllers.RemoveLike(c, db) })
		protectedInteractionRoutes.DELETE("/dislike", func(c *gin.Context) { controllers.RemoveDislike(c, db) })
		protectedInteractionRoutes.DELETE("/save", func(c *gin.Context) { controllers.UnsaveThread(c, db) })
	}

	// Group routes for users
	userRoutes := router.Group("/users")
	{
		userRoutes.POST("", func(c *gin.Context) { controllers.Register(c, db) })
		userRoutes.POST("/login", func(c *gin.Context) { controllers.Login(c, db) })
		userRoutes.GET("/:username/authorize", func(c *gin.Context) { controllers.GetAuthorization(c, db) })
		userRoutes.GET("/:username/info", func(c *gin.Context) { controllers.GetUserInfo(c, db) })
		userRoutes.GET("/:username/scores", func(c *gin.Context) { controllers.GetUserScores(c, db) })
		userRoutes.GET("/:username/metrics", func(c *gin.Context) { controllers.GetUserMetrics(c, db) })
		userRoutes.GET("/:username/activity", func(c *gin.Context) { controllers.GetUserActivity(c, db) })
		userRoutes.GET("/:username/saved", func(c *gin.Context) { controllers.GetUserSavedThreads(c, db) })
		userRoutes.GET("/leaderboard", func(c *gin.Context) { controllers.GetLeaderboard(c, db) })
	}

	// Protected User Routes
	protectedUserRoutes := router.Group("/users")
	protectedUserRoutes.Use(middleware.AuthMiddleware())
	{
		userRoutes.POST("/:username/password", func(c *gin.Context) { controllers.UpdatePasswordHandler(c, db) })
		userRoutes.PUT("/:username/bio", func(c *gin.Context) { controllers.UpdateUserBio(c, db) })
		userRoutes.PUT("/:username/promote", func(c *gin.Context) { controllers.PromoteUserHandler(c, db) })
		userRoutes.PUT("/:username/demote", func(c *gin.Context) { controllers.DemoteUserHandler(c, db) })
	}
}

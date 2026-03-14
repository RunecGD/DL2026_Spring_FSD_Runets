package main

import (
	"backend/api/config"
	"backend/api/middleware"
	"backend/api/model"
	"backend/api/route"
	"log"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	// Подключаемся к БД
	log.Println("Подключаемся к базе данных...")
	config.ConnectDatabase()
	log.Println("✅ База данных подключена")

	// Автоматически создаем таблицы
	if err := config.DB.AutoMigrate(&model.User{}, &model.Place{}); err != nil {
		log.Fatal("Failed to migrate database:", err)
	}

	// Создаем роутер
	r := gin.Default()
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"*"}, // разрешить все домены
		AllowMethods:     []string{"GET", "POST", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		AllowCredentials: true,
	}))
	// Публичные маршруты (не требуют авторизации)
	public := r.Group("/api")
	{
		// Auth endpoints
		public.POST("/register", route.Register)
		public.POST("/login", route.Login)

		// Places endpoints (открытые)
		public.GET("/places", route.GetPlace)
		public.GET(`/places/nearby`, route.GetNearbyPlaces)
	}

	// Защищенные маршруты (требуют JWT токен)
	protected := r.Group("/api")
	protected.Use(middleware.AuthMiddleware())
	{
		// User profile
		protected.GET("/profile", route.GetProfile)

		// Здесь можно добавить защищенные эндпоинты
		// protected.POST("/places", route.CreatePlace)
		// protected.PUT("/places/:id", route.UpdatePlace)
		// protected.DELETE("/places/:id", route.DeletePlace)
	}

	// Health check
	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status":  "ok",
			"version": "1.0.0",
		})
	})

	log.Println("🚀 Сервер запущен на :8080")
	log.Println("📌 Доступные эндпоинты:")
	log.Println("   POST /api/register - регистрация")
	log.Println("   POST /api/login - вход")
	log.Println("   GET  /api/places - все места")
	log.Println("   GET  /api/places/nearby/top5?lat=...&lng=... - 5 ближайших")
	log.Println("   GET  /api/profile - профиль (требует токен)")
	log.Println("   GET  /health - проверка")

	r.Run(":8080")
}

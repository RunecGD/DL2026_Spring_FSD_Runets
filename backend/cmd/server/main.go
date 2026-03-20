package main

import (
	"backend/api/config"
	"backend/api/middleware"
	"backend/api/model"
	"backend/api/route"
	"log"
	"os"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func init() {
	// Загружаем .env файл ДО инициализации пакета middleware
	if err := godotenv.Load(); err != nil {
		log.Println("⚠️  .env файл не найден, используем системные переменные")
	}
}

func main() {
	// Проверяем JWT_SECRET
	if os.Getenv("JWT_SECRET") == "" {
		log.Fatal("❌ JWT_SECRET is not set!")
	}
	log.Println("✅ JWT_SECRET загружен")

	// Подключаемся к БД
	log.Println("Подключаемся к базе данных...")
	config.ConnectDatabase()
	log.Println("✅ База данных подключена")

	// Автоматически создаем таблицы
	if err := config.DB.AutoMigrate(&model.User{}, &model.Place{}, &model.VisitedPlace{}); err != nil {
		log.Fatal("Failed to migrate database:", err)
	}

	// Создаем роутер
	r := gin.Default()
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:5173", "http://localhost:8080"},
		AllowMethods:     []string{"GET", "POST", "DELETE", "OPTIONS"}, // ← добавь DELETE
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
	}))

	public := r.Group("/api")
	{
		public.POST("/register", route.Register)
		public.POST("/login", route.Login)
		public.GET("/places", route.GetPlace)
		public.GET("/places/nearby", route.GetNearbyPlaces)
		public.GET("/places/type", route.GetPlaceType)
	}

	protected := r.Group("/api")
	protected.Use(middleware.AuthMiddleware())
	{
		protected.GET("/profile", route.GetProfile)
		protected.POST("/places/:id/visit", route.MarkVisited)
		protected.DELETE("/places/:id/visit", route.RemoveVisit)
		protected.GET("/places/visited", route.GetVisitedPlaces)
	}

	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok", "version": "1.0.0"})
	})

	log.Println("🚀 Сервер запущен на :8080")
	r.Run(":8080")
}

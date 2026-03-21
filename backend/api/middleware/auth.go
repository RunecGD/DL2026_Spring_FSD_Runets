package middleware

import (
	"backend/api/model"
	"fmt"
	"log"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/joho/godotenv"
)

var jwtSecret []byte

func init() {
	// Загружаем .env перед инициализацией переменных
	if err := loadEnv(); err != nil {
		log.Println("⚠️  .env file not found, using system environment variables")
	}
	jwtSecret = []byte(os.Getenv("JWT_SECRET"))
	if len(jwtSecret) == 0 {
		log.Println("⚠️  JWT_SECRET is not set in .env file")
	}
}

func loadEnv() error {
	// Пытаемся загрузить из разных путей
	paths := []string{".env", "../.env", "../../.env", "../../../.env"}
	for _, path := range paths {
		if err := godotenv.Load(path); err == nil {
			return nil
		}
	}
	return godotenv.Load() // стандартный путь
}

func GenerateToken(user model.User) (string, error) {
	if len(jwtSecret) == 0 {
		return "", fmt.Errorf("JWT_SECRET is not configured")
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"user_id":  user.ID,
		"username": user.Username,
		"email":    user.Email,
		"exp":      time.Now().Add(time.Hour * 24).Unix(), // 24 часа
	})

	return token.SignedString(jwtSecret)
}

// AuthMiddleware проверяет JWT токен
func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Authorization header required"})
			c.Abort()
			return
		}

		// Проверяем формат "Bearer <token>"
		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 || parts[0] != "Bearer" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid authorization format"})
			c.Abort()
			return
		}

		tokenString := parts[1]

		// Парсим токен
		token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
			return jwtSecret, nil
		})

		if err != nil || !token.Valid {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid or expired token"})
			c.Abort()
			return
		}

		// Получаем claims и сохраняем user_id в контексте
		if claims, ok := token.Claims.(jwt.MapClaims); ok {
			c.Set("user_id", uint(claims["user_id"].(float64)))
			c.Set("username", claims["username"])
		}

		c.Next()
	}
}

package route

import (
	"backend/api/config"
	"backend/api/model"
	"math"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

func GetPlace(c *gin.Context) {
	var places []model.Place

	if err := config.DB.Find(&places).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch places"})
		return
	}

	if len(places) == 0 {
		c.JSON(http.StatusOK, []model.PlaceResponse{})
		return
	}

	var placeResponses []model.PlaceResponse

	for _, place := range places {
		placeResponses = append(placeResponses, model.PlaceResponse{
			ID:       place.ID,
			Name:     place.Name,
			Category: place.Category,
			Lat:      place.Lat,
			Lng:      place.Lng,
		})
	}

	c.JSON(http.StatusOK, placeResponses)
}

func GetNearbyPlaces(c *gin.Context) {
	var req model.NearbyRequest

	if err := c.ShouldBindQuery(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if req.Lat < -90 || req.Lat > 90 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Latitude must be between -90 and 90"})
		return
	}
	if req.Lng < -180 || req.Lng > 180 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Longitude must be between -180 and 180"})
		return
	}

	if req.Radius <= 0 {
		req.Radius = 5
	}
	if req.Limit <= 0 {
		req.Limit = 10
	}
	if req.Limit > 100 {
		req.Limit = 100
	}

	var places []model.Place

	// Фильтрация по категории, если указана
	query := config.DB
	if req.Category != "" {
		query = query.Where("category = ?", req.Category)
	}

	if err := query.Find(&places).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch places"})
		return
	}

	var nearbyPlaces []model.PlaceWithDistance
	for _, place := range places {
		distance := calculateDistance(req.Lat, req.Lng, place.Lat, place.Lng)

		if distance <= req.Radius {
			nearbyPlaces = append(nearbyPlaces, model.PlaceWithDistance{
				Place:    place,
				Distance: math.Round(distance*100) / 100, // округляем до 2 знаков
			})
		}
	}

	for i := 0; i < len(nearbyPlaces)-1; i++ {
		for j := i + 1; j < len(nearbyPlaces); j++ {
			if nearbyPlaces[i].Distance > nearbyPlaces[j].Distance {
				nearbyPlaces[i], nearbyPlaces[j] = nearbyPlaces[j], nearbyPlaces[i]
			}
		}
	}

	if len(nearbyPlaces) > req.Limit {
		nearbyPlaces = nearbyPlaces[:req.Limit]
	}

	c.JSON(http.StatusOK, gin.H{
		"your_location": gin.H{
			"lat": req.Lat,
			"lng": req.Lng,
		},
		"radius_km":     req.Radius,
		"category":      req.Category,
		"total_found":   len(nearbyPlaces),
		"nearby_places": nearbyPlaces,
	})
}

func calculateDistance(lat1, lon1, lat2, lon2 float64) float64 {
	const R = 6371 // радиус Земли в километрах

	lat1Rad := lat1 * math.Pi / 180
	lon1Rad := lon1 * math.Pi / 180
	lat2Rad := lat2 * math.Pi / 180
	lon2Rad := lon2 * math.Pi / 180

	dlat := lat2Rad - lat1Rad
	dlon := lon2Rad - lon1Rad

	a := math.Sin(dlat/2)*math.Sin(dlat/2) +
		math.Cos(lat1Rad)*math.Cos(lat2Rad)*
			math.Sin(dlon/2)*math.Sin(dlon/2)

	c := 2 * math.Atan2(math.Sqrt(a), math.Sqrt(1-a))

	return R * c
}
func GetPlaceType(c *gin.Context) {
	var has bool
	var places []model.Place
	if err := config.DB.Find(&places).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch places"})
		return
	}
	var types []string
	for _, place := range places {
		has = false
		for _, Type := range types {
			if Type == place.Category {
				has = true
				break
			}
		}
		if has == false {
			types = append(types, place.Category)
		}
	}
	c.JSON(http.StatusOK, types)
}

// Helper functions for visit handlers

// getUserID retrieves user ID from JWT context
func getUserID(c *gin.Context) uint {
	userID, exists := c.Get("user_id")
	if !exists {
		return 0
	}
	return userID.(uint)
}

// parseUint parses string to uint
func parseUint(s string) uint {
	id, err := strconv.ParseUint(s, 10, 32)
	if err != nil {
		return 0
	}
	return uint(id)
}

// MarkVisited отмечает место как посещённое
func MarkVisited(c *gin.Context) {
	userID := getUserID(c)
	if userID == 0 {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	placeID := parseUint(c.Param("id"))
	if placeID == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid place ID"})
		return
	}

	// Check if place exists
	var place model.Place
	if err := config.DB.First(&place, placeID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Place not found"})
		return
	}

	// Check if already visited
	var existingVisit model.VisitedPlace
	if err := config.DB.Where("user_id = ? AND place_id = ?", userID, placeID).First(&existingVisit).Error; err == nil {
		c.JSON(http.StatusOK, gin.H{"message": "Already visited"})
		return
	}

	visit := model.VisitedPlace{
		UserID:  userID,
		PlaceID: placeID,
	}

	if err := config.DB.Create(&visit).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to mark place as visited"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "ok"})
}

// RemoveVisit снимает отметку о посещении
func RemoveVisit(c *gin.Context) {
	userID := getUserID(c)
	if userID == 0 {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	placeID := parseUint(c.Param("id"))
	if placeID == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid place ID"})
		return
	}

	if err := config.DB.Where("user_id = ? AND place_id = ?", userID, placeID).Delete(&model.VisitedPlace{}).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to remove visit"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "ok"})
}

// GetVisitedPlaces возвращает список посещённых мест
func GetVisitedPlaces(c *gin.Context) {
	userID := getUserID(c)
	if userID == 0 {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	var visited []model.VisitedPlace
	if err := config.DB.Where("user_id = ?", userID).Preload("Place").Find(&visited).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch visited places"})
		return
	}

	c.JSON(http.StatusOK, visited)
}

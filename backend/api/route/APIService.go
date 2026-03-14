package route

import (
	"backend/api/config"
	"backend/api/model"
	"math"
	"net/http"

	"github.com/gin-gonic/gin"
)

func GetPlace(c *gin.Context) {
	var places []model.Place

	if err := config.DB.Find(&places).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch places"})
		return
	}

	if len(places) == 0 {
		c.JSON(http.StatusOK, []string{})
	}

	var placeResponses []model.PlaceResponse

	for _, place := range places {
		placeResponses = append(placeResponses, struct {
			ID       int     `json:"id"`
			Name     string  `json:"name"`
			Category string  `json:"category"`
			Lat      float64 `json:"lat"`
			Lng      float64 `json:"lng"`
		}{
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
		req.Radius = 5 // 5 км по умолчанию
	}
	if req.Limit <= 0 {
		req.Limit = 10
	}
	if req.Limit > 100 {
		req.Limit = 100 // максимальный лимит
	}

	var places []model.Place
	if err := config.DB.Find(&places).Error; err != nil {
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

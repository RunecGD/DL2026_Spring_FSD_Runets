package model

type NearbyRequest struct {
	Lat    float64 `json:"lat" form:"lat" binding:"required"`
	Lng    float64 `json:"lng" form:"lng" binding:"required"`
	Radius float64 `json:"radius" form:"radius" default:"5"`
	Limit  int     `json:"limit" form:"limit" default:"20"`
}

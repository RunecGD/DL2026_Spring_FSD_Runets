package model

type PlaceWithDistance struct {
	Place
	Distance float64 `json:"distance_km"`
}

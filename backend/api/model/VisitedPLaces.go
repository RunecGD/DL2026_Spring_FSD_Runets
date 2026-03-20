package model

import "time"

type VisitedPlace struct {
	ID        uint      `json:"id" gorm:"primaryKey"`
	UserID    uint      `json:"user_id" gorm:"index"`
	PlaceID   uint      `json:"place_id" gorm:"index"`
	Place     Place     `json:"place" gorm:"foreignKey:PlaceID"`
	VisitedAt time.Time `json:"visited_at" gorm:"autoCreateTime"`
}

func (VisitedPlace) TableName() string {
	return "visited_places"
}

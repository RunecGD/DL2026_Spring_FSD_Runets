package model

type Place struct {
	ID       uint    `json:"id" gorm:"primaryKey;autoIncrement"`
	Name     string  `json:"name" gorm:"not null"`
	Category string  `json:"category" gorm:"not null"`
	Lat      float64 `json:"lat" gorm:"not null"`
	Lng      float64 `json:"lng" gorm:"not null"`
}

func (Place) TableName() string {
	return "places"
}

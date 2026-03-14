package model

type Place struct {
	ID       int     `json:"id" gorm:"primaryKey"`
	Name     string  `json:"name"`
	Category string  `json:"category"`
	Lat      float64 `json:"lat"`
	Lng      float64 `json:"lng"`
}

func (Place) TableName() string {
	return "places"
}

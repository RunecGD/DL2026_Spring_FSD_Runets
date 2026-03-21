# 🌍 GeoGuide

[![Go Version](https://img.shields.io/badge/Go-1.26-blue.svg)](https://golang.org/)
[![Node Version](https://img.shields.io/badge/Node.js-25.7.0-green.svg)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14+-blue.svg)](https://www.postgresql.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

**GeoGuide** is a web application that helps users discover nearby points of interest.  
Whether you're a traveler exploring a new city or a local looking to uncover hidden gems, GeoGuide shows you what's worth visiting around you.

---

## ✨ Features

- 📍 **Location-based discovery** – find attractions near your current location  
- 🗺️ **Interactive map interface** – visualize places in your area  
- 📌 **Save visited places** – track where you've been  
- 🔐 **User authentication** – secure JWT-based login  
- 🧭 **For travelers and locals alike** – discover both famous landmarks and hidden spots

---

## 🛠️ Tech Stack

| Layer        | Technology                          |
|--------------|-------------------------------------|
| **Backend**  | Go 1.26, Gin, GORM                  |
| **Frontend** | JavaScript, TypeScript              |
| **Database** | PostgreSQL                          |
| **API**      | REST (JSON)                         |

---

## 📁 Database Schema

The database consists of three tables:

| Table          | Description                              |
|----------------|------------------------------------------|
| `users`        | User accounts and authentication data    |
| `places`       | Points of interest (name, coordinates, description, etc.) |
| `visited_places` | Tracks which users have visited which places |

> **Note:** The `places` table must be populated manually with location data.  
> The `users` and `visited_places` tables will be populated automatically as users register and interact with the app.

---

## 🚀 Getting Started

### Prerequisites

- Go 1.26+
- Node.js 25.7.0+
- PostgreSQL 14+

### Environment Variables

Create a `.env` file in the project root with the following configuration:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=root
DB_NAME=geoguide
JWT_SECRET=your-secret-key-here

## 🚀 Installation & Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/geoguide.git
   cd geoguide

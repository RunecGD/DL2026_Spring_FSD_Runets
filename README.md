# 🧭 GeoGuide

<div align="center">

![Go](https://img.shields.io/badge/Go-1.26-00ADD8?style=for-the-badge&logo=go&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-25.7.0-339933?style=for-the-badge&logo=node.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![Gin](https://img.shields.io/badge/Gin-008ECF?style=for-the-badge&logo=gin&logoColor=white)

**Discover nearby attractions and hidden gems in your city**

[Features](#-features) • [Installation](#-installation) • [API](#-api-endpoints) • [Database](#-database-setup)

</div>

---

## 📖 About

GeoGuide is a pet project designed to help users discover nearby attractions and points of interest. Whether you're a tourist exploring a new city or a local looking to uncover hidden gems in your hometown, GeoGuide makes it easy to find interesting places around you.

### Target Audience

- 🧳 **Tourists & Visitors** — Explore unfamiliar cities and find popular attractions nearby
- 🏠 **Local Residents** — Discover new places and hidden spots in your own city

## ✨ Features

- 📍 Geolocation-based attraction discovery
- 🗺️ Find places sorted by distance from your location
- ✅ Track visited places
- 🔐 User authentication with JWT
- 📱 Cross-platform support

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Backend** | Go 1.26, Gin Framework |
| **Frontend** | Node.js 25.7.0, TypeScript |
| **Database** | PostgreSQL |
| **ORM** | GORM |

## 📋 Prerequisites

- Go 1.26+
- Node.js v25.7.0+
- PostgreSQL

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/geoguide.git
cd geoguide
```

### 2. Database Setup

Create the PostgreSQL database:

```bash
psql -U postgres
```

```sql
CREATE DATABASE geoguide;
```

### 3. Environment Variables

Create a `.env` file in the backend directory:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=root
DB_NAME=geoguide
JWT_SECRET=your_secret_key_here
```

### 4. Backend Setup

```bash
cd backend
go mod download
go run main.go
```

The API server will start on **port 8080**.

### 5. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The frontend will start on **port 5173**.

## 💾 Database Setup

The application requires 3 tables: `users`, `places`, and `visited_places`.

### Database Schema

```sql
-- Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Places table
CREATE TABLE places (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    category VARCHAR(100),
    address VARCHAR(500),
    image_url VARCHAR(500),
    rating DECIMAL(2, 1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Visited places table
CREATE TABLE visited_places (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    place_id INTEGER NOT NULL REFERENCES places(id) ON DELETE CASCADE,
    visited_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, place_id)
);

-- Indexes for better performance
CREATE INDEX idx_places_location ON places(latitude, longitude);
CREATE INDEX idx_visited_places_user ON visited_places(user_id);
CREATE INDEX idx_visited_places_place ON visited_places(place_id);
```

### Seed Data (Places)

Populate the `places` table with sample data:

```sql
INSERT INTO places (name, description, latitude, longitude, category, address, rating) VALUES
('Central Park', 'A large public park in the city center', 40.785091, -73.968285, 'Park', '123 Park Avenue', 4.8),
('History Museum', 'Museum featuring local history exhibits', 40.779437, -73.963244, 'Museum', '456 Museum Street', 4.5),
('Old Town Square', 'Historic square with beautiful architecture', 40.758896, -73.985130, 'Square', '789 Old Town Road', 4.7),
('Cathedral of St. Mary', 'Gothic cathedral built in the 15th century', 40.748817, -73.985428, 'Temple', '321 Cathedral Lane', 4.9),
('Art Gallery', 'Contemporary art exhibitions', 40.761432, -73.977621, 'Gallery', '555 Art Boulevard', 4.3),
('Botanical Garden', 'Beautiful garden with rare plant species', 40.783060, -73.958908, 'Park', '888 Garden Way', 4.6),
('Science Center', 'Interactive science museum for all ages', 40.706086, -74.008869, 'Museum', '100 Science Drive', 4.4),
('Historic Bridge', '19th century stone bridge over the river', 40.712776, -74.005974, 'Monument', '200 Bridge Street', 4.2),
('City Theater', 'Performing arts venue with daily shows', 40.759011, -73.984472, 'Theater', '300 Theater Plaza', 4.7),
('Memorial Park', 'Park dedicated to local heroes', 40.741895, -73.989308, 'Park', '400 Memorial Drive', 4.5);
```

## 🔌 API Endpoints

The API runs on `http://localhost:8080`

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | User login |

### Places

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/places` | Get all places |
| GET | `/api/places/:id` | Get place by ID |
| GET | `/api/places/nearby?lat=&lng=&radius=` | Get places near location |

### Visited Places

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/visited` | Get user's visited places |
| POST | `/api/visited/:place_id` | Mark place as visited |
| DELETE | `/api/visited/:place_id` | Remove from visited |

## 🐧 Linux Configuration

For proper geolocation functionality in browsers on Linux, ensure the following:

1. **HTTPS Required**: Browsers require HTTPS for Geolocation API. For local development, you may need to:
   - Use `localhost` (usually allowed over HTTP)
   - Configure a local SSL certificate
   - Use browser flags to allow insecure origins

2. **Location Services**: Make sure system location services are enabled:
   ```bash
   # For GNOME-based systems
   sudo apt install geoclue-2.0
   ```

3. **Browser Permissions**: Allow location access when prompted by the browser.

## 📁 Project Structure

```
geoguide/
├── backend/
│   ├── main.go
│   ├── config/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   └── go.mod
├── frontend/
│   ├── src/
│   ├── package.json
│   └── tsconfig.json
├── .env
└── README.md
```

## 🌐 Ports

| Service | Port |
|---------|------|
| Backend API | 8080 |
| Frontend | 5173 |

## 🤝 Contributing

Contributions are welcome! Feel free to:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

<div align="center">

Made with ❤️ for explorers everywhere

</div>

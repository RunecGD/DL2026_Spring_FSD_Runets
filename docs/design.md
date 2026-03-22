# 📍 GeoGuide — Design Document

## Part 1. Design and Analysis

---

## 1.1. User Stories

### 🌍 User Story 1: Discovering Nearby Attractions

> **As a tourist** visiting a new city,  
> **I want to** see a list of nearby attractions sorted by distance from my current location,  
> **so that I can** easily find interesting places to visit without extensive research.

**Acceptance Criteria:**
- [ ] The app requests geolocation permission from the browser
- [ ] Attractions are displayed with distance in kilometers/meters
- [ ] User can sort by distance, rating, or name
- [ ] Each attraction shows basic info (name, category, rating, photo)

---

### 🏠 User Story 2: Filtering by Category

> **As a local resident** exploring my city,  
> **I want to** filter attractions by category (museums, parks, monuments, etc.),  
> **so that I can** discover new places that match my interests.

**Acceptance Criteria:**
- [ ] Category filter buttons are clearly visible
- [ ] Multiple categories can be selected
- [ ] Results update immediately when filters change
- [ ] "All" option resets filters

---

### ✅ User Story 3: Tracking Visited Places

> **As a registered user**,  
> **I want to** mark places I've already visited and see my exploration progress,  
> **so that I can** track my journey and discover places I haven't been to yet.

**Acceptance Criteria:**
- [ ] User can mark/unmark places as visited
- [ ] Visited places are saved to user's account
- [ ] Progress statistics are shown (percentage, count by category)
- [ ] Visited places have visual indicator on the map/list

---

## 1.2. Functional Requirements

### Backend (Go + Gin)

| Priority | Requirement | Description |
|:--------:|-------------|-------------|
| ✅ Required | User Registration | Register new users with email and password |
| ✅ Required | User Authentication | JWT-based login/logout |
| ✅ Required | Get All Places | Return list of all attractions from database |
| ✅ Required | Get Place by ID | Return detailed information about specific place |
| ✅ Required | Get Places by Category | Filter places by category |
| ✅ Required | Mark Place as Visited | Save visited place for authenticated user |
| ✅ Required | Get User's Visited Places | Return list of places visited by user |
| ✅ Required | Remove Visited Place | Unmark place as visited |
| ⭕ Optional | Search Places | Full-text search by name/description |
| ⭕ Optional | Get Places in Radius | Filter places within N km from coordinates |
| ⭕ Optional | User Profile Update | Update user information |
| ⭕ Optional | Place Ratings | Allow users to rate places |

### Frontend (TypeScript + React)

| Priority | Requirement | Description |
|:--------:|-------------|-------------|
| ✅ Required | Geolocation Detection | Get user's current coordinates via Browser API |
| ✅ Required | Places List | Display attractions as cards with info |
| ✅ Required | Distance Calculation | Calculate and show distance to each place |
| ✅ Required | Category Filtering | Filter places by selected categories |
| ✅ Required | Sorting | Sort by distance, rating, or name |
| ✅ Required | User Registration/Login | Auth forms with validation |
| ✅ Required | Visited Places Page | Show user's visited places with stats |
| ✅ Required | Responsive Design | Mobile-friendly layout |
| ⭕ Optional | Search Bar | Search places by name |
| ⭕ Optional | Map View | Show places on interactive map |
| ⭕ Optional | Place Details Modal | Detailed view with full description |
| ⭕ Optional | Achievements System | Gamification for exploration |

---

## 1.3. API Design

### Base URL

```
http://localhost:8080/api/v1
```

### Authentication

All protected endpoints require JWT token in header:

```http
Authorization: Bearer <token>
```

---

### 🔐 Auth Endpoints

#### `POST /auth/register`

Register a new user.

**Request Body:**

```json
{
  "username": "string",
  "email": "string",
  "password": "string"
}
```

**Response `201 Created`:**

```json
{
  "id": 1,
  "username": "john_doe",
  "email": "john@example.com",
  "created_at": "2024-01-15T10:30:00Z"
}
```

**Errors:**
| Code | Description |
|------|-------------|
| `400` | Validation error |
| `409` | Email already exists |

---

#### `POST /auth/login`

Authenticate user and receive JWT token.

**Request Body:**

```json
{
  "email": "string",
  "password": "string"
}
```

**Response `200 OK`:**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com"
  }
}
```

**Errors:**
| Code | Description |
|------|-------------|
| `401` | Invalid credentials |

---

### 📍 Places Endpoints

#### `GET /places`

Get all places with optional filtering.

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|:--------:|-------------|
| `category` | string | No | Filter by category |
| `search` | string | No | Search by name |
| `lat` | float | No | User latitude |
| `lng` | float | No | User longitude |
| `radius` | float | No | Radius in km |

**Response `200 OK`:**

```json
{
  "places": [
    {
      "id": 1,
      "name": "Red Square",
      "description": "Historic central square...",
      "category": "square",
      "latitude": 55.7539,
      "longitude": 37.6208,
      "rating": 4.9,
      "image_url": "/images/red-square.jpg",
      "address": "Red Square, Moscow"
    }
  ],
  "total": 25
}
```

---

#### `GET /places/:id`

Get detailed information about a specific place.

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | integer | Place ID |

**Response `200 OK`:**

```json
{
  "id": 1,
  "name": "Red Square",
  "description": "Historic central square of Moscow, surrounded by significant buildings including the Kremlin, Saint Basil's Cathedral, and GUM shopping center.",
  "category": "square",
  "latitude": 55.7539,
  "longitude": 37.6208,
  "rating": 4.9,
  "image_url": "/images/red-square.jpg",
  "address": "Red Square, Moscow, Russia",
  "created_at": "2024-01-01T00:00:00Z"
}
```

**Errors:**
| Code | Description |
|------|-------------|
| `404` | Place not found |

---

#### `GET /places/categories`

Get list of all available categories.

**Response `200 OK`:**

```json
{
  "categories": [
    "museum",
    "monument",
    "park",
    "temple",
    "theater",
    "architecture",
    "gallery",
    "square",
    "bridge"
  ]
}
```

---

### ✅ Visited Places Endpoints

> 🔒 **All endpoints require authentication**

#### `GET /users/me/visited`

Get list of places visited by current user.

**Response `200 OK`:**

```json
{
  "visited_places": [
    {
      "id": 1,
      "place_id": 5,
      "place": {
        "id": 5,
        "name": "Bolshoi Theatre",
        "category": "theater"
      },
      "visited_at": "2024-01-10T14:30:00Z"
    }
  ],
  "total": 8
}
```

---

#### `POST /users/me/visited`

Mark a place as visited.

**Request Body:**

```json
{
  "place_id": 5
}
```

**Response `201 Created`:**

```json
{
  "id": 1,
  "place_id": 5,
  "user_id": 1,
  "visited_at": "2024-01-15T10:30:00Z"
}
```

**Errors:**
| Code | Description |
|------|-------------|
| `400` | Invalid place_id |
| `404` | Place not found |
| `409` | Already marked as visited |

---

#### `DELETE /users/me/visited/:place_id`

Remove place from visited list.

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `place_id` | integer | Place ID |

**Response `204 No Content`**

**Errors:**
| Code | Description |
|------|-------------|
| `404` | Place not in visited list |

---

## 1.4. Data Model

### Entity Relationship Diagram

```
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│     users       │       │ visited_places  │       │     places      │
├─────────────────┤       ├─────────────────┤       ├─────────────────┤
│ id (PK)         │──┐    │ id (PK)         │    ┌──│ id (PK)         │
│ username        │  └───>│ user_id (FK)    │    │  │ name            │
│ email           │       │ place_id (FK)   │<───┘  │ description     │
│ password_hash   │       │ visited_at      │       │ category        │
│ created_at      │       └─────────────────┘       │ latitude        │
│ updated_at      │                                 │ longitude       │
└─────────────────┘                                 │ rating          │
                                                    │ image_url       │
                                                    │ address         │
                                                    │ created_at      │
                                                    │ updated_at      │
                                                    └─────────────────┘
```

---

### Table: `users`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | SERIAL | PRIMARY KEY | Unique user identifier |
| `username` | VARCHAR(50) | NOT NULL | Display name |
| `email` | VARCHAR(100) | NOT NULL, UNIQUE | User email (login) |
| `password_hash` | VARCHAR(255) | NOT NULL | Bcrypt hashed password |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Registration date |
| `updated_at` | TIMESTAMP | DEFAULT NOW() | Last update date |

---

### Table: `places`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | SERIAL | PRIMARY KEY | Unique place identifier |
| `name` | VARCHAR(200) | NOT NULL | Place name |
| `description` | TEXT | | Full description |
| `category` | VARCHAR(50) | NOT NULL | Category type |
| `latitude` | DECIMAL(10,8) | NOT NULL | GPS latitude |
| `longitude` | DECIMAL(11,8) | NOT NULL | GPS longitude |
| `rating` | DECIMAL(2,1) | DEFAULT 0 | Average rating (0-5) |
| `image_url` | VARCHAR(500) | | Image URL |
| `address` | VARCHAR(300) | | Physical address |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Creation date |
| `updated_at` | TIMESTAMP | DEFAULT NOW() | Last update date |

---

### Table: `visited_places`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | SERIAL | PRIMARY KEY | Unique record identifier |
| `user_id` | INTEGER | NOT NULL, FK → users.id | Reference to user |
| `place_id` | INTEGER | NOT NULL, FK → places.id | Reference to place |
| `visited_at` | TIMESTAMP | DEFAULT NOW() | When marked as visited |

**Constraints:**
- `UNIQUE(user_id, place_id)` — User can mark place only once

---

### GORM Models (Go)

```go
// models/user.go
type User struct {
    ID           uint           `gorm:"primaryKey" json:"id"`
    Username     string         `gorm:"size:50;not null" json:"username"`
    Email        string         `gorm:"size:100;not null;unique" json:"email"`
    PasswordHash string         `gorm:"size:255;not null" json:"-"`
    CreatedAt    time.Time      `json:"created_at"`
    UpdatedAt    time.Time      `json:"updated_at"`
    VisitedPlaces []VisitedPlace `gorm:"foreignKey:UserID" json:"visited_places,omitempty"`
}

// models/place.go
type Place struct {
    ID          uint      `gorm:"primaryKey" json:"id"`
    Name        string    `gorm:"size:200;not null" json:"name"`
    Description string    `gorm:"type:text" json:"description"`
    Category    string    `gorm:"size:50;not null" json:"category"`
    Latitude    float64   `gorm:"type:decimal(10,8);not null" json:"latitude"`
    Longitude   float64   `gorm:"type:decimal(11,8);not null" json:"longitude"`
    Rating      float64   `gorm:"type:decimal(2,1);default:0" json:"rating"`
    ImageURL    string    `gorm:"size:500" json:"image_url"`
    Address     string    `gorm:"size:300" json:"address"`
    CreatedAt   time.Time `json:"created_at"`
    UpdatedAt   time.Time `json:"updated_at"`
}

// models/visited_place.go
type VisitedPlace struct {
    ID        uint      `gorm:"primaryKey" json:"id"`
    UserID    uint      `gorm:"not null" json:"user_id"`
    PlaceID   uint      `gorm:"not null" json:"place_id"`
    VisitedAt time.Time `gorm:"default:CURRENT_TIMESTAMP" json:"visited_at"`
    User      User      `gorm:"foreignKey:UserID" json:"-"`
    Place     Place     `gorm:"foreignKey:PlaceID" json:"place,omitempty"`
}
```

---

## 1.5. Key Technical Decisions

### Technology Stack

| Layer | Technology | Version | Justification |
|-------|------------|---------|---------------|
| **Backend** | Go | 1.26 | High performance, strong typing, excellent concurrency |
| **Web Framework** | Gin | latest | Fast, lightweight, great middleware support |
| **ORM** | GORM | latest | Feature-rich ORM, auto-migration, PostgreSQL support |
| **Database** | PostgreSQL | latest | Reliable, supports geospatial queries, ACID compliant |
| **Frontend** | TypeScript | latest | Type safety, better IDE support, fewer runtime errors |
| **UI Framework** | React | 18+ | Component-based, large ecosystem, hooks support |
| **Build Tool** | Vite | latest | Fast HMR, modern bundling |
| **Styling** | Tailwind CSS | latest | Utility-first, rapid prototyping |

---

### Architecture Decisions

| Decision | Choice | Reasoning |
|----------|--------|-----------|
| **Authentication** | JWT (JSON Web Tokens) | Stateless, scalable, works well with SPA |
| **Password Hashing** | bcrypt | Industry standard, built-in salt, configurable cost |
| **Distance Calculation** | Haversine formula | Accurate for geographic distances on Earth |
| **API Architecture** | REST | Simple, well-understood, good tooling |
| **State Management** | React Context | Sufficient for app size, no Redux overhead |
| **Geolocation** | Browser Geolocation API | Native, no external dependencies |

---

### Security Measures

| Measure | Implementation |
|---------|----------------|
| Password Storage | bcrypt with cost factor 10 |
| Authentication | JWT with expiration (24h) |
| CORS | Configured for frontend origin only |
| Input Validation | Server-side validation on all inputs |
| SQL Injection | GORM parameterized queries |
| XSS Prevention | React auto-escaping |

---

### External APIs

| API | Purpose | Required |
|-----|---------|:--------:|
| Browser Geolocation API | Get user coordinates | ✅ Yes |
| Google Maps (optional) | Display map, directions | ⭕ No |
| OpenStreetMap (optional) | Alternative map provider | ⭕ No |

---

### Linux Geolocation Note

> ⚠️ On Linux systems, browser geolocation may require additional configuration. The Geolocation API needs:
> - HTTPS connection (or localhost for development)
> - Location services enabled in system settings
> - Browser permissions granted
> 
> For Firefox on Linux, you may need to configure `geo.provider.network.url` in `about:config` to use Mozilla or Google location services.

---

## Summary

GeoGuide is a pet project designed for:
- 🌍 **Tourists** — discover nearby attractions quickly
- 🏠 **Locals** — explore hidden gems in their city

**Core Features:**
- Real-time geolocation with distance calculation
- Category-based filtering and sorting
- User accounts with visited places tracking
- Clean, responsive UI

**Ports:**
- Backend API: `http://localhost:8080`
- Frontend: `http://localhost:5173`

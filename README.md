# Complaint Redressal System

A full-stack web application for citizens to lodge complaints with geolocation data and for authorities to manage them.

## Tech Stack
- **Frontend:** React.js + Vite + Tailwind CSS
- **Backend:** Java Spring Boot + Spring Security (JWT)
- **Database:** MySQL
- **Maps:** Leaflet + OpenStreetMap

## Project Structure
- `backend/`: Spring Boot Application
- `frontend/`: React Vite Application

## Prerequisites
- Java 17+
- Maven
- Node.js & npm
- MySQL Server

## Setup Instructions

### 1. Database Setup
1. Create a MySQL database named `complaint_redressal`.
2. Update database credentials in `backend/src/main/resources/application.properties` if they differ from `root`/`password`.

```sql
CREATE DATABASE complaint_redressal;
```

### 2. Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies and run the application:
   ```bash
   mvn spring-boot:run
   ```
   The backend server will start on `http://localhost:8080`.

### 3. Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
   The frontend will be available at `http://localhost:5173`.

## Features
- **Citizens:** Register, Login, Lodge Complaint (Photo with GPS Watermark + Map Location), Track Status.
- **Admins:** Login, Dashboard (List/Map View), Update Status, Add Remarks.

## API Endpoints
- `POST /api/auth/register` - User Registration
- `POST /api/auth/login` - User Login
- `POST /api/auth/admin/login` - Admin Login
- `POST /api/complaints` - Create Complaint
- `GET /api/complaints/my` - Get User Complaints
- `GET /api/admin/complaints` - Get All Complaints (Admin)
- `PUT /api/admin/complaints/{id}/status` - Update Status (Admin)

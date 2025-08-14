# Flight Tracker Challenge

A full-stack flight tracking application built with React, TypeScript, and Express.js. The application allows users to track flight statuses with real-time updates from mock flight data providers.

## 🚀 Quick Start with Docker Compose

The easiest way to run the entire application is using Docker Compose:

```bash
# Clone the repository
git clone <repository-url>
cd flight-tracker-challenge

# Start the application
docker-compose up --build

# The application will be available at:
# Frontend: http://localhost:8080
# Backend API: http://localhost:5001
```

To stop the application:
```bash
docker-compose down
```

## 📋 Prerequisites

- Docker and Docker Compose
- OR Node.js (v18 or higher) and npm/yarn for local development

## 🏗️ Architecture Overview

This application consists of two main components:

### Backend API (Express.js + TypeScript)
- **Port**: 5001
- **Technology Stack**: Express.js, TypeScript, Jest
- **Features**:
  - RESTful API for flight tracking
  - Mock integration with FlightAware and FlightStats services
  - JWT-based authentication system
  - Comprehensive test coverage
  - Request validation and error handling

### Frontend (React + TypeScript)
- **Port**: 8080
- **Technology Stack**: React, TypeScript, Vite, Tailwind CSS, Shadcn UI
- **Features**:
  - Modern React application with TypeScript
  - Authentication with JWT tokens and HTTP-only cookies
  - Real-time flight status tracking
  - Responsive design with Tailwind CSS
  - Protected routes and automatic token refresh

## 🛠️ Local Development Setup

### Backend Development

```bash
cd backend

# Install dependencies
npm install

# Start development server
npm run dev
# Server runs on http://localhost:5000

# Run tests
npm test

# Build for production
npm run build
npm start
```

### Frontend Development

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
# Application runs on http://localhost:5173

# Build for production
npm run build
```

## 🔐 Authentication

The application includes a complete authentication system:

**Demo Credentials:**
- Username: `admin`
- Password: `admin`

**Features:**
- JWT tokens stored in HTTP-only cookies
- Automatic token refresh
- Protected routes
- Global authentication state management

## 📡 API Endpoints

### Authentication
- `POST /api/auth/login` - User authentication
- `POST /api/auth/logout` - Clear authentication
- `GET /api/auth/me` - Get current user
- `POST /api/auth/refresh` - Refresh access token

### Flight Tracking
- `GET /api/flights` - Get all tracked flights
- `POST /api/flights` - Add new flight to track
- `DELETE /api/flights/:id` - Remove flight tracking
- `PUT /api/flights/refresh` - Update all flight statuses

### Health Check
- `GET /health` - API health status

## 🧪 Testing

### Backend Tests
```bash
cd backend
npm test                    # Run all tests
npm run test:unit          # Unit tests only
npm run test:e2e           # End-to-end tests only
npm run test:coverage      # Test coverage report
```

### Test Coverage
- Unit tests for all services and controllers
- End-to-end API tests
- Mock service implementations
- Request validation testing

## 📊 Flight Data Model

```typescript
interface Flight {
  id: string;
  flightNumber: string;
  status: 'AWAITING' | 'DEPARTED' | 'ARRIVED';
  actualDepartureTime: string | null;
  actualArrivalTime: string | null;
}
```

## 🎯 Mock Services

The application includes two mock flight data providers:

- **FlightAwareService**: Simulates FlightAware API responses
- **FlightStatsService**: Simulates FlightStats API responses

Both services provide realistic mock data with:
- Random response delays
- Occasional error simulation
- Realistic flight status progression

## 🐳 Docker Configuration

### Backend Dockerfile
- Multi-stage build for optimized production image
- Node.js Alpine base image
- Health check endpoint
- Non-root user for security

### Frontend Dockerfile
- Multi-stage build with Nginx for serving
- Optimized static asset serving
- Environment variable support for API configuration

### Docker Compose
- Automatic service orchestration
- Network isolation with custom bridge network
- Environment variable configuration
- Service dependencies management

## 📁 Project Structure

```
flight-tracker-challenge/
├── backend/                 # Express.js API
│   ├── src/
│   │   ├── controllers/     # Request handlers
│   │   ├── middleware/      # Auth & validation
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic & mock services
│   │   ├── schemas/         # Request validation schemas
│   │   └── types/           # TypeScript definitions
│   ├── tests/               # Test suites
│   └── Dockerfile
├── frontend/                # React application
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── contexts/        # React Context providers
│   │   ├── hooks/           # Custom React hooks
│   │   ├── pages/           # Page components
│   │   ├── services/        # API services
│   │   └── types/           # TypeScript definitions
│   └── Dockerfile
└── docker-compose.yml       # Container orchestration
```

## 🔧 Environment Configuration

### Backend Environment Variables
- `PORT`: Server port (default: 5001)
- `NODE_ENV`: Environment mode
- `JWT_SECRET`: JWT signing secret
- `JWT_REFRESH_SECRET`: JWT refresh token secret

### Frontend Environment Variables
- `VITE_API_BASE_URL`: Backend API URL (default: http://localhost:5001)

## 🚀 Production Deployment Considerations

While this is a development setup, here are considerations for production:

### Security
- Use proper SSL/TLS certificates
- Implement rate limiting
- Add CORS configuration
- Use secure JWT secrets
- Implement proper logging and monitoring

### Database
- Replace in-memory storage with persistent database (PostgreSQL/MongoDB)
- Implement proper data migrations
- Add database connection pooling

### Infrastructure
- Use container orchestration (Kubernetes)
- Implement load balancing
- Add monitoring and alerting
- Set up CI/CD pipelines
- Configure proper logging aggregation

### Performance
- Implement caching (Redis)
- Add CDN for static assets
- Optimize bundle sizes
- Implement proper error boundaries

## 📝 Development Notes

This project was built as part of a coding challenge with the following requirements:
- Full-stack flight tracking application
- Mock integration with flight data providers
- React frontend with TypeScript
- Express.js backend with TypeScript
- Local storage for frontend state persistence
- No database, authentication, or cloud deployment required

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## 📄 License

This project is part of a coding challenge and is for demonstration purposes.
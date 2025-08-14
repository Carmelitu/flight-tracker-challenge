# Flight Tracker Backend API

A TypeScript Express.js backend for tracking flight statuses with mock data providers.

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation
```bash
npm install
```

### Development
```bash
npm run dev
```
Server will start on http://localhost:5000

### Build & Production
```bash
npm run build
npm start
```

## API Endpoints

### Base URL
`http://localhost:5000/api`

### Endpoints

#### GET /flights
Get all tracked flights
```bash
curl http://localhost:5000/api/flights
```

#### POST /flights
Add a new flight to track
```bash
curl -X POST http://localhost:5000/api/flights \
  -H "Content-Type: application/json" \
  -d '{"flightNumber": "AA123"}'
```

#### DELETE /flights/:id
Remove a flight by ID
```bash
curl -X DELETE http://localhost:5000/api/flights/[flight-id]
```

#### PUT /flights/refresh
Update status of all flights by calling mock services
```bash
curl -X PUT http://localhost:5000/api/flights/refresh
```

### Health Check
```bash
curl http://localhost:5000/health
```

## Project Structure

```
src/
├── app.ts              # Express app setup
├── server.ts           # Entry point
├── routes/             # API routes
│   ├── index.ts
│   └── flightRoutes.ts
├── controllers/        # Controller functions
│   └── flightController.ts
├── services/           # Business logic & mock services
│   ├── flightService.ts
│   ├── flightAwareService.ts
│   └── flightStatsService.ts
└── types/              # TypeScript type definitions
    └── flight.ts
```

## Flight Data Model

```typescript
interface Flight {
  id: string;
  flightNumber: string;
  status: 'AWAITING' | 'DEPARTED' | 'ARRIVED';
  actualDepartureTime: string | null;
  actualArrivalTime: string | null;
}
```

## Mock Services

The API includes two mock flight data providers:
- **FlightAwareService**: Simulates FlightAware API calls
- **FlightStatsService**: Simulates FlightStats API calls

Both services return mock data with random delays and occasional errors to simulate real-world conditions.
// Shared types between frontend and backend
export interface Flight {
  id: string;
  flightNumber: string;
  status: 'AWAITING' | 'DEPARTED' | 'ARRIVED';
  actualDepartureTime: string | null;
  actualArrivalTime: string | null;
}

export interface CreateFlightRequest {
  flightNumber: string;
}

export interface FlightServiceResponse {
  actualDepartureTime: string | null;
  actualArrivalTime: string | null;
}

export interface FlightServiceError {
  error: string;
}

export type FlightStatus = 'AWAITING' | 'DEPARTED' | 'ARRIVED';
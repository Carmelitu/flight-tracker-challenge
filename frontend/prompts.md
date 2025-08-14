# 1
Create a React + TypeScript frontend for a simple flight tracker inspired by FlightRadar’s style (dark mode, clean sans-serif font, yellow highlights, no map). The UI should include:  

1. Header with the app name "Flight Tracker" and a short description.  
2. Form at the top to add a flight by entering its flight number (text input) and pressing an "Add" button.  
3. Flight list table showing:  
   - Flight number  
   - Status (AWAITING, DEPARTED, ARRIVED)  
   - Departure time (or “—” if null)  
   - Arrival time (or “—” if null)  
   - Delete button (trash icon)  
4. "Refresh All" button above the table to simulate updating all statuses.  
5. Use dummy flight data stored in a local state array for now.  
6. Persist flight list in localStorage so refreshing the page keeps the list.  
7. Use simple styling with CSS modules or styled-components (your choice), with a dark background (#1d1d1d), white text, yellow accent (#ffcc00), and a responsive layout.  
8. Include some hover effects for buttons.  

The UI should be clean, minimal, and responsive. No need to fetch data yet — use mock data and console logs for add/delete/refresh actions.  

Deliver: a single React component file (or small component structure) ready to run in a create-react-app TypeScript project.

# 2
Connect the existing React + TypeScript frontend to the Express.js backend using react-hook-query.

Requirements:
1. Install and configure react-query (react-hook-query) in the frontend project.
2. Create a centralized API client using axios with a configurable base URL (pointing to the backend API).
3. Implement hooks for:
   - getFlights: Fetch all flights from GET /flights.
   - createFlight: POST a new flight.
   - deleteFlight: DELETE a flight by ID.
   - refreshFlights: Trigger the backend refresh route and update the cached flight list.
4. Ensure hooks use proper react-query features:
   - Automatic cache invalidation after mutations.
   - Loading and error state handling.
   - Retry on network errors (max 3 times).
5. Integrate these hooks into the existing UI components:
   - Flight list should use `useQuery` with getFlights.
   - Add flight form should use `useMutation` with createFlight.
   - Delete and refresh actions should also use `useMutation` with automatic refetch.
6. Ensure TypeScript types from the backend (Flight interface) are shared with the frontend to avoid duplication.
7. Keep the code modular: hooks in a `/hooks` directory, API calls in a `/services` directory.

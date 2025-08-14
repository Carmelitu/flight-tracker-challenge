#1
Add Docker support to the project so the frontend and backend run in separate containers but share the same network.

Requirements:
1. Create a Dockerfile for the backend:
   - Base image: node:20-alpine
   - Set working directory `/app`
   - Copy package.json + package-lock.json
   - Run npm install
   - Copy the rest of the backend code
   - Expose port 5001
   - Command: `npm run start` (or `npm run dev` if using nodemon)

2. Create a Dockerfile for the frontend:
   - Base image: node:20-alpine
   - Set working directory `/app`
   - Copy package.json + package-lock.json
   - Run npm install
   - Copy the rest of the frontend code
   - Expose port 8080
   - Command: `npm run dev -- --host 0.0.0.0 --port 8080` (for Vite) or equivalent for your build tool

3. Create a `docker-compose.yml` at the root:
   - version: "3.9"
   - services:
       backend:
         build: ./backend
         container_name: backend
         ports:
           - "5001:5001"
         networks:
           - app-network
       frontend:
         build: ./frontend
         container_name: frontend
         ports:
           - "8080:8080"
         environment:
           - VITE_API_URL=http://backend:5001
         depends_on:
           - backend
         networks:
           - app-network
   - networks:
       app-network:
         driver: bridge

4. Ensure the frontend uses `VITE_API_URL` (or similar env var) to call the backend so requests inside Docker go to `http://backend:5001`.

5. Add `.dockerignore` files to both frontend and backend to skip `node_modules`, `dist`, `.git`, etc.

6. Run the containers:
   - `docker-compose build`
   - `docker-compose up`

7. Verify:
   - On the host machine, visiting `http://localhost:8080` should serve the frontend.
   - The frontend should be able to call the backend via the internal hostname `backend:5001` from inside the Docker network.

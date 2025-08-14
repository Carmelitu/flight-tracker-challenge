# Authentication Implementation

This document describes the authentication system implemented for the Flight Tracker frontend.

## Overview

The authentication system uses JWT tokens stored in HTTP-only cookies with automatic token refresh and route protection.

## Features

- **Login Page**: Simple username/password form at `/login`
- **Protected Routes**: All routes except `/login` require authentication
- **Automatic Token Refresh**: Axios interceptors handle 401 errors and attempt token refresh
- **Global State Management**: React Context provides authentication state across the app
- **Logout Functionality**: Clear tokens and redirect to login

## Demo Credentials

- **Username**: `admin`
- **Password**: `admin`

## Components

### AuthContext (`src/contexts/AuthContext.tsx`)
- Manages global authentication state
- Provides login, logout, and authentication checking functions
- Uses React Query for API calls
- Handles automatic redirects

### Login Page (`src/pages/Login.tsx`)
- Clean form with username/password inputs
- Error handling and loading states
- Automatic redirect after successful login
- Built with Shadcn UI components

### ProtectedRoute (`src/components/ProtectedRoute.tsx`)
- Wrapper component that protects routes
- Shows loading spinner while checking auth
- Redirects to login if not authenticated

### LogoutButton (`src/components/LogoutButton.tsx`)
- Reusable logout button component
- Shows current user and logout functionality
- Integrated into the main FlightTracker header

### API Configuration (`src/lib/api.ts`)
- Axios instance with interceptors
- Automatic token refresh on 401 errors
- Always sends cookies with `withCredentials: true`
- Custom event dispatching for logout

## API Endpoints

The frontend communicates with these backend endpoints:

- `POST /auth/login` - Authenticate user
- `POST /auth/logout` - Clear authentication cookies
- `GET /auth/me` - Get current user info
- `POST /auth/refresh` - Refresh access token

## Flow

1. **App Load**: Check authentication with `GET /auth/me`
2. **Unauthenticated**: Redirect to `/login`
3. **Login**: Submit credentials to `POST /auth/login`
4. **Success**: Redirect to main app
5. **API Calls**: Include cookies automatically
6. **Token Expired**: Axios interceptor attempts refresh
7. **Refresh Success**: Retry original request
8. **Refresh Failed**: Logout and redirect to login

## Security Features

- HTTP-only cookies prevent XSS attacks
- Automatic token refresh reduces exposure window
- Protected routes ensure authenticated access
- Proper error handling and user feedback

## Usage

The authentication system is automatically integrated into the app. Users will be redirected to login if not authenticated, and can logout using the button in the header.
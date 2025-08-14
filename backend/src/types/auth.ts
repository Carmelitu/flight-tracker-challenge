export interface User {
  username: string;
  password: string;
}

export interface AuthResponse {
  user: {
    username: string;
  };
  message: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface TokenPayload {
  username: string;
  type: 'access' | 'refresh';
}

export interface AuthenticatedRequest extends Request {
  user?: {
    username: string;
  };
}
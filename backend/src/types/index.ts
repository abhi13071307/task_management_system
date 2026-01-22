import { Request } from 'express';

export interface RegisterBody {
  email: string;
  password: string;
  name?: string;
}

export interface LoginBody {
  email: string;
  password: string;
}

export interface JwtPayload {
  userId: string;
  email: string;
}

export interface AuthRequest extends Request {
  user?: JwtPayload;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
}

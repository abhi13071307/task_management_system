import { Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { verifyAccessToken } from '../utils/jwt.utils';
import { AuthRequest } from '../types';

export const authenticateToken = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): void => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      res.status(StatusCodes.UNAUTHORIZED).json({
        success: false,
        message: 'Access token required',
      });
      return;
    }

    const decoded = verifyAccessToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(StatusCodes.FORBIDDEN).json({
      success: false,
      message: 'Invalid or expired token',
    });
  }
};

import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';

export const validateRegister = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      message: 'Email and password are required',
    });
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      message: 'Invalid email format',
    });
    return;
  }

  if (password.length < 6) {
    res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      message: 'Password must be at least 6 characters long',
    });
    return;
  }

  next();
};

export const validateLogin = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      message: 'Email and password are required',
    });
    return;
  }

  next();
};

import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import prisma from '../config/prisma';
import { hashPassword, comparePassword } from '../utils/password.utils';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from '../utils/jwt.utils';
import { RegisterBody, LoginBody, AuthRequest } from '../types';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, name }: RegisterBody = req.body;

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      res.status(StatusCodes.CONFLICT).json({
        success: false,
        message: 'User already exists',
      });
      return;
    }

    const hashedPassword = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
      },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      },
    });

    res.status(StatusCodes.CREATED).json({
      success: true,
      message: 'User registered successfully',
      data: user,
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password }: LoginBody = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      res.status(StatusCodes.UNAUTHORIZED).json({
        success: false,
        message: 'Invalid credentials',
      });
      return;
    }

    const isPasswordValid = await comparePassword(password, user.password);

    if (!isPasswordValid) {
      res.status(StatusCodes.UNAUTHORIZED).json({
        success: false,
        message: 'Invalid credentials',
      });
      return;
    }

    const payload = { userId: user.id, email: user.email };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken },
    });

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Login successful',
      data: {
        accessToken,
        refreshToken,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

export const refresh = async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'Refresh token required',
      });
      return;
    }

    const decoded = verifyRefreshToken(refreshToken);

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user || user.refreshToken !== refreshToken) {
      res.status(StatusCodes.FORBIDDEN).json({
        success: false,
        message: 'Invalid refresh token',
      });
      return;
    }

    const payload = { userId: user.id, email: user.email };
    const newAccessToken = generateAccessToken(payload);
    const newRefreshToken = generateRefreshToken(payload);

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: newRefreshToken },
    });

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Tokens refreshed successfully',
      data: {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      },
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(StatusCodes.FORBIDDEN).json({
      success: false,
      message: 'Invalid or expired refresh token',
    });
  }
};

export const logout = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(StatusCodes.UNAUTHORIZED).json({
        success: false,
        message: 'User not authenticated',
      });
      return;
    }

    await prisma.user.update({
      where: { id: userId },
      data: { refreshToken: null },
    });

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Logout successful',
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

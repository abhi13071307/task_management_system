import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { TaskStatus } from '../types/task.types';

export const validateCreateTask = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const { title } = req.body;

  if (!title || title.trim().length === 0) {
    res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      message: 'Title is required',
    });
    return;
  }

  if (title.length > 255) {
    res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      message: 'Title must not exceed 255 characters',
    });
    return;
  }

  next();
};

export const validateUpdateTask = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const { title, status } = req.body;

  if (title !== undefined) {
    if (title.trim().length === 0) {
      res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'Title cannot be empty',
      });
      return;
    }

    if (title.length > 255) {
      res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'Title must not exceed 255 characters',
      });
      return;
    }
  }

  if (status !== undefined && !Object.values(TaskStatus).includes(status)) {
    res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      message: 'Invalid status value',
    });
    return;
  }

  next();
};

export const validateQueryParams = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const { page, limit, status } = req.query;

  if (page !== undefined) {
    const pageNum = parseInt(page as string);
    if (isNaN(pageNum) || pageNum < 1) {
      res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'Page must be a positive number',
      });
      return;
    }
  }

  if (limit !== undefined) {
    const limitNum = parseInt(limit as string);
    if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
      res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'Limit must be between 1 and 100',
      });
      return;
    }
  }

  if (
    status !== undefined &&
    !Object.values(TaskStatus).includes(status as TaskStatus)
  ) {
    res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      message: 'Invalid status filter',
    });
    return;
  }

  next();
};

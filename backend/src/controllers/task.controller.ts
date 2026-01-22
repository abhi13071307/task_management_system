import { Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import prisma from '../config/prisma';
import { AuthRequest } from '../types';
import {
  CreateTaskBody,
  UpdateTaskBody,
  TaskQueryParams,
  TaskStatus,
} from '../types/task.types';

export const getTasks = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const {
      page = '1',
      limit = '10',
      status,
      search,
    }: TaskQueryParams = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const where: any = { userId };

    if (status) {
      where.status = status;
    }

    if (search) {
      where.title = {
        contains: search,
      };
    }

    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          title: true,
          description: true,
          status: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.task.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limitNum);

    res.status(StatusCodes.OK).json({
      success: true,
      data: {
        tasks,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages,
          hasMore: pageNum < totalPages,
        },
      },
    });
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

export const getTaskById = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;

    const task = await prisma.task.findFirst({
      where: { id, userId },
      select: {
        id: true,
        title: true,
        description: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!task) {
      res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: 'Task not found',
      });
      return;
    }

    res.status(StatusCodes.OK).json({
      success: true,
      data: task,
    });
  } catch (error) {
    console.error('Get task error:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

export const createTask = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { title, description, status }: CreateTaskBody = req.body;

    if (!userId) {
      res.status(StatusCodes.UNAUTHORIZED).json({
        success: false,
        message: 'User not authenticated',
      });
      return;
    }

    const task = await prisma.task.create({
      data: {
        title: title.trim(),
        description: description?.trim(),
        status: status || TaskStatus.PENDING,
        userId,
      },
      select: {
        id: true,
        title: true,
        description: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.status(StatusCodes.CREATED).json({
      success: true,
      message: 'Task created successfully',
      data: task,
    });
  } catch (error) {
    console.error('Create task error:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

export const updateTask = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;
    const { title, description, status }: UpdateTaskBody = req.body;

    const existingTask = await prisma.task.findFirst({
      where: { id, userId },
    });

    if (!existingTask) {
      res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: 'Task not found',
      });
      return;
    }

    const updateData: any = {};
    if (title !== undefined) updateData.title = title.trim();
    if (description !== undefined) updateData.description = description.trim();
    if (status !== undefined) updateData.status = status;

    const task = await prisma.task.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        title: true,
        description: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Task updated successfully',
      data: task,
    });
  } catch (error) {
    console.error('Update task error:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

export const deleteTask = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;

    const task = await prisma.task.findFirst({
      where: { id, userId },
    });

    if (!task) {
      res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: 'Task not found',
      });
      return;
    }

    await prisma.task.delete({
      where: { id },
    });

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Task deleted successfully',
    });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

export const toggleTaskStatus = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;

    const task = await prisma.task.findFirst({
      where: { id, userId },
    });

    if (!task) {
      res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: 'Task not found',
      });
      return;
    }

    const newStatus =
      task.status === TaskStatus.COMPLETED
        ? TaskStatus.PENDING
        : TaskStatus.COMPLETED;

    const updatedTask = await prisma.task.update({
      where: { id },
      data: { status: newStatus },
      select: {
        id: true,
        title: true,
        description: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Task status toggled successfully',
      data: updatedTask,
    });
  } catch (error) {
    console.error('Toggle task error:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

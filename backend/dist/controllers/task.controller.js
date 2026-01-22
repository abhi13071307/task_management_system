"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.toggleTaskStatus = exports.deleteTask = exports.updateTask = exports.createTask = exports.getTaskById = exports.getTasks = void 0;
const http_status_codes_1 = require("http-status-codes");
const prisma_1 = __importDefault(require("../config/prisma"));
const task_types_1 = require("../types/task.types");
const getTasks = async (req, res) => {
    try {
        const userId = req.user?.userId;
        const { page = '1', limit = '10', status, search, } = req.query;
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;
        const where = { userId };
        if (status) {
            where.status = status;
        }
        if (search) {
            where.title = {
                contains: search,
            };
        }
        const [tasks, total] = await Promise.all([
            prisma_1.default.task.findMany({
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
            prisma_1.default.task.count({ where }),
        ]);
        const totalPages = Math.ceil(total / limitNum);
        res.status(http_status_codes_1.StatusCodes.OK).json({
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
    }
    catch (error) {
        console.error('Get tasks error:', error);
        res.status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: 'Internal server error',
        });
    }
};
exports.getTasks = getTasks;
const getTaskById = async (req, res) => {
    try {
        const userId = req.user?.userId;
        const { id } = req.params;
        const task = await prisma_1.default.task.findFirst({
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
            res.status(http_status_codes_1.StatusCodes.NOT_FOUND).json({
                success: false,
                message: 'Task not found',
            });
            return;
        }
        res.status(http_status_codes_1.StatusCodes.OK).json({
            success: true,
            data: task,
        });
    }
    catch (error) {
        console.error('Get task error:', error);
        res.status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: 'Internal server error',
        });
    }
};
exports.getTaskById = getTaskById;
const createTask = async (req, res) => {
    try {
        const userId = req.user?.userId;
        const { title, description, status } = req.body;
        if (!userId) {
            res.status(http_status_codes_1.StatusCodes.UNAUTHORIZED).json({
                success: false,
                message: 'User not authenticated',
            });
            return;
        }
        const task = await prisma_1.default.task.create({
            data: {
                title: title.trim(),
                description: description?.trim(),
                status: status || task_types_1.TaskStatus.PENDING,
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
        res.status(http_status_codes_1.StatusCodes.CREATED).json({
            success: true,
            message: 'Task created successfully',
            data: task,
        });
    }
    catch (error) {
        console.error('Create task error:', error);
        res.status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: 'Internal server error',
        });
    }
};
exports.createTask = createTask;
const updateTask = async (req, res) => {
    try {
        const userId = req.user?.userId;
        const { id } = req.params;
        const { title, description, status } = req.body;
        const existingTask = await prisma_1.default.task.findFirst({
            where: { id, userId },
        });
        if (!existingTask) {
            res.status(http_status_codes_1.StatusCodes.NOT_FOUND).json({
                success: false,
                message: 'Task not found',
            });
            return;
        }
        const updateData = {};
        if (title !== undefined)
            updateData.title = title.trim();
        if (description !== undefined)
            updateData.description = description.trim();
        if (status !== undefined)
            updateData.status = status;
        const task = await prisma_1.default.task.update({
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
        res.status(http_status_codes_1.StatusCodes.OK).json({
            success: true,
            message: 'Task updated successfully',
            data: task,
        });
    }
    catch (error) {
        console.error('Update task error:', error);
        res.status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: 'Internal server error',
        });
    }
};
exports.updateTask = updateTask;
const deleteTask = async (req, res) => {
    try {
        const userId = req.user?.userId;
        const { id } = req.params;
        const task = await prisma_1.default.task.findFirst({
            where: { id, userId },
        });
        if (!task) {
            res.status(http_status_codes_1.StatusCodes.NOT_FOUND).json({
                success: false,
                message: 'Task not found',
            });
            return;
        }
        await prisma_1.default.task.delete({
            where: { id },
        });
        res.status(http_status_codes_1.StatusCodes.OK).json({
            success: true,
            message: 'Task deleted successfully',
        });
    }
    catch (error) {
        console.error('Delete task error:', error);
        res.status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: 'Internal server error',
        });
    }
};
exports.deleteTask = deleteTask;
const toggleTaskStatus = async (req, res) => {
    try {
        const userId = req.user?.userId;
        const { id } = req.params;
        const task = await prisma_1.default.task.findFirst({
            where: { id, userId },
        });
        if (!task) {
            res.status(http_status_codes_1.StatusCodes.NOT_FOUND).json({
                success: false,
                message: 'Task not found',
            });
            return;
        }
        const newStatus = task.status === task_types_1.TaskStatus.COMPLETED
            ? task_types_1.TaskStatus.PENDING
            : task_types_1.TaskStatus.COMPLETED;
        const updatedTask = await prisma_1.default.task.update({
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
        res.status(http_status_codes_1.StatusCodes.OK).json({
            success: true,
            message: 'Task status toggled successfully',
            data: updatedTask,
        });
    }
    catch (error) {
        console.error('Toggle task error:', error);
        res.status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: 'Internal server error',
        });
    }
};
exports.toggleTaskStatus = toggleTaskStatus;

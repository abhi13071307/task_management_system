"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateQueryParams = exports.validateUpdateTask = exports.validateCreateTask = void 0;
const http_status_codes_1 = require("http-status-codes");
const task_types_1 = require("../types/task.types");
const validateCreateTask = (req, res, next) => {
    const { title } = req.body;
    if (!title || title.trim().length === 0) {
        res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json({
            success: false,
            message: 'Title is required',
        });
        return;
    }
    if (title.length > 255) {
        res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json({
            success: false,
            message: 'Title must not exceed 255 characters',
        });
        return;
    }
    next();
};
exports.validateCreateTask = validateCreateTask;
const validateUpdateTask = (req, res, next) => {
    const { title, status } = req.body;
    if (title !== undefined) {
        if (title.trim().length === 0) {
            res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json({
                success: false,
                message: 'Title cannot be empty',
            });
            return;
        }
        if (title.length > 255) {
            res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json({
                success: false,
                message: 'Title must not exceed 255 characters',
            });
            return;
        }
    }
    if (status !== undefined && !Object.values(task_types_1.TaskStatus).includes(status)) {
        res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json({
            success: false,
            message: 'Invalid status value',
        });
        return;
    }
    next();
};
exports.validateUpdateTask = validateUpdateTask;
const validateQueryParams = (req, res, next) => {
    const { page, limit, status } = req.query;
    if (page !== undefined) {
        const pageNum = parseInt(page);
        if (isNaN(pageNum) || pageNum < 1) {
            res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json({
                success: false,
                message: 'Page must be a positive number',
            });
            return;
        }
    }
    if (limit !== undefined) {
        const limitNum = parseInt(limit);
        if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
            res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json({
                success: false,
                message: 'Limit must be between 1 and 100',
            });
            return;
        }
    }
    if (status !== undefined &&
        !Object.values(task_types_1.TaskStatus).includes(status)) {
        res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json({
            success: false,
            message: 'Invalid status filter',
        });
        return;
    }
    next();
};
exports.validateQueryParams = validateQueryParams;

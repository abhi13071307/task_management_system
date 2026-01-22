"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logout = exports.refresh = exports.login = exports.register = void 0;
const http_status_codes_1 = require("http-status-codes");
const prisma_1 = __importDefault(require("../config/prisma"));
const password_utils_1 = require("../utils/password.utils");
const jwt_utils_1 = require("../utils/jwt.utils");
const register = async (req, res) => {
    try {
        const { email, password, name } = req.body;
        const existingUser = await prisma_1.default.user.findUnique({
            where: { email },
        });
        if (existingUser) {
            res.status(http_status_codes_1.StatusCodes.CONFLICT).json({
                success: false,
                message: 'User already exists',
            });
            return;
        }
        const hashedPassword = await (0, password_utils_1.hashPassword)(password);
        const user = await prisma_1.default.user.create({
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
        res.status(http_status_codes_1.StatusCodes.CREATED).json({
            success: true,
            message: 'User registered successfully',
            data: user,
        });
    }
    catch (error) {
        console.error('Registration error:', error);
        res.status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: 'Internal server error',
        });
    }
};
exports.register = register;
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await prisma_1.default.user.findUnique({
            where: { email },
        });
        if (!user) {
            res.status(http_status_codes_1.StatusCodes.UNAUTHORIZED).json({
                success: false,
                message: 'Invalid credentials',
            });
            return;
        }
        const isPasswordValid = await (0, password_utils_1.comparePassword)(password, user.password);
        if (!isPasswordValid) {
            res.status(http_status_codes_1.StatusCodes.UNAUTHORIZED).json({
                success: false,
                message: 'Invalid credentials',
            });
            return;
        }
        const payload = { userId: user.id, email: user.email };
        const accessToken = (0, jwt_utils_1.generateAccessToken)(payload);
        const refreshToken = (0, jwt_utils_1.generateRefreshToken)(payload);
        await prisma_1.default.user.update({
            where: { id: user.id },
            data: { refreshToken },
        });
        res.status(http_status_codes_1.StatusCodes.OK).json({
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
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: 'Internal server error',
        });
    }
};
exports.login = login;
const refresh = async (req, res) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json({
                success: false,
                message: 'Refresh token required',
            });
            return;
        }
        const decoded = (0, jwt_utils_1.verifyRefreshToken)(refreshToken);
        const user = await prisma_1.default.user.findUnique({
            where: { id: decoded.userId },
        });
        if (!user || user.refreshToken !== refreshToken) {
            res.status(http_status_codes_1.StatusCodes.FORBIDDEN).json({
                success: false,
                message: 'Invalid refresh token',
            });
            return;
        }
        const payload = { userId: user.id, email: user.email };
        const newAccessToken = (0, jwt_utils_1.generateAccessToken)(payload);
        const newRefreshToken = (0, jwt_utils_1.generateRefreshToken)(payload);
        await prisma_1.default.user.update({
            where: { id: user.id },
            data: { refreshToken: newRefreshToken },
        });
        res.status(http_status_codes_1.StatusCodes.OK).json({
            success: true,
            message: 'Tokens refreshed successfully',
            data: {
                accessToken: newAccessToken,
                refreshToken: newRefreshToken,
            },
        });
    }
    catch (error) {
        console.error('Refresh token error:', error);
        res.status(http_status_codes_1.StatusCodes.FORBIDDEN).json({
            success: false,
            message: 'Invalid or expired refresh token',
        });
    }
};
exports.refresh = refresh;
const logout = async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            res.status(http_status_codes_1.StatusCodes.UNAUTHORIZED).json({
                success: false,
                message: 'User not authenticated',
            });
            return;
        }
        await prisma_1.default.user.update({
            where: { id: userId },
            data: { refreshToken: null },
        });
        res.status(http_status_codes_1.StatusCodes.OK).json({
            success: true,
            message: 'Logout successful',
        });
    }
    catch (error) {
        console.error('Logout error:', error);
        res.status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: 'Internal server error',
        });
    }
};
exports.logout = logout;

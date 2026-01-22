"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateToken = void 0;
const http_status_codes_1 = require("http-status-codes");
const jwt_utils_1 = require("../utils/jwt.utils");
const authenticateToken = (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
        if (!token) {
            res.status(http_status_codes_1.StatusCodes.UNAUTHORIZED).json({
                success: false,
                message: 'Access token required',
            });
            return;
        }
        const decoded = (0, jwt_utils_1.verifyAccessToken)(token);
        req.user = decoded;
        next();
    }
    catch (error) {
        res.status(http_status_codes_1.StatusCodes.FORBIDDEN).json({
            success: false,
            message: 'Invalid or expired token',
        });
    }
};
exports.authenticateToken = authenticateToken;

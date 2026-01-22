"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const http_status_codes_1 = require("http-status-codes");
const env_1 = require("./config/env");
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const task_routes_1 = __importDefault(require("./routes/task.routes"));
const app = (0, express_1.default)();
// Middlewares
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cookie_parser_1.default)());
// Routes
app.use('/auth', auth_routes_1.default);
app.use('/tasks', task_routes_1.default);
// Health check
app.get('/health', (req, res) => {
    res.status(http_status_codes_1.StatusCodes.OK).json({
        success: true,
        message: 'Server is running',
    });
});
// 404 handler
app.use((req, res) => {
    res.status(http_status_codes_1.StatusCodes.NOT_FOUND).json({
        success: false,
        message: 'Route not found',
    });
});
// Start server
app.listen(env_1.config.port, () => {
    console.log(`Server is running on port ${env_1.config.port}`);
});

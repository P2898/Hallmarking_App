"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const path_1 = __importDefault(require("path"));
const db_1 = require("./db");
require("./models"); // Import models to register them with Sequelize
dotenv_1.default.config();
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: '*', // Allow connections from React Native app
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
    },
});
// Expose Socket.io instance to routes
app.set('io', io);
const port = process.env.PORT || 5000;
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const categoryRoutes_1 = __importDefault(require("./routes/categoryRoutes"));
const listingRoutes_1 = __importDefault(require("./routes/listingRoutes"));
const chatRoutes_1 = __importDefault(require("./routes/chatRoutes"));
const uploadRoutes_1 = __importDefault(require("./routes/uploadRoutes"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const reportRoutes_1 = __importDefault(require("./routes/reportRoutes"));
const analyticsRoutes_1 = __importDefault(require("./routes/analyticsRoutes"));
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Serve static uploads
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, '../public/uploads')));
// API Routes
app.use('/api/auth', authRoutes_1.default);
app.use('/api/categories', categoryRoutes_1.default);
app.use('/api/listings', listingRoutes_1.default);
app.use('/api/chats', chatRoutes_1.default);
app.use('/api/upload', uploadRoutes_1.default);
app.use('/api/users', userRoutes_1.default);
app.use('/api/reports', reportRoutes_1.default);
app.use('/api/analytics', analyticsRoutes_1.default);
// Base Route
app.get('/', (req, res) => {
    res.send('MachineXchange API is running!');
});
// Socket.io Real-time connection handler
io.on('connection', (socket) => {
    console.log(`🔌 Client connected: ${socket.id}`);
    // Join a specific chat room
    socket.on('joinChat', (chatId) => {
        socket.join(chatId);
        console.log(`👤 Client joined chat room: ${chatId}`);
    });
    // Join a user room for global events (like inbox updates)
    socket.on('joinUser', (userId) => {
        socket.join(`user-${userId}`);
        console.log(`👤 Client joined user room: user-${userId}`);
    });
    socket.on('disconnect', () => {
        console.log(`🔌 Client disconnected: ${socket.id}`);
    });
});
// Start Server & Connect to Database
server.listen(port, async () => {
    console.log(`🚀 Server is running on http://localhost:${port}`);
    await (0, db_1.connectDB)();
});

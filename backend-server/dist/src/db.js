"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = exports.sequelize = void 0;
const sequelize_1 = require("sequelize");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// Create a Sequelize instance to connect to MySQL Workbench
// The user will need to provide their password in the .env file
exports.sequelize = new sequelize_1.Sequelize(process.env.DB_NAME || 'machinexchange_db', process.env.DB_USER || 'root', process.env.DB_PASSWORD || '', // Place your MySQL Workbench password here in the .env file!
{
    host: process.env.DB_HOST || 'localhost',
    dialect: 'mysql',
    logging: false, // Set to true to see all SQL queries in the terminal
});
const connectDB = async () => {
    try {
        await exports.sequelize.authenticate();
        console.log('✅ Connection to MySQL Workbench has been established successfully.');
        // Automatically sync models to the database (creates tables if they don't exist)
        await exports.sequelize.sync({ alter: true });
        console.log('✅ All database tables synced automatically!');
    }
    catch (error) {
        console.error('❌ Unable to connect to the database:', error);
    }
};
exports.connectDB = connectDB;

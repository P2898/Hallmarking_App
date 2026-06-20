import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

// Create a Sequelize instance to connect to MySQL Workbench
// The user will need to provide their password in the .env file
export const sequelize = new Sequelize(
  process.env.DB_NAME || 'machinexchange_db',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '', // Place your MySQL Workbench password here in the .env file!
  {
    host: process.env.DB_HOST || 'localhost',
    dialect: 'mysql',
    logging: false, // Set to true to see all SQL queries in the terminal
  }
);

export const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Connection to MySQL Workbench has been established successfully.');
    
    // Automatically sync models to the database (creates tables if they don't exist)
    await sequelize.sync({ alter: true });
    console.log('✅ All database tables synced automatically!');
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error);
  }
};

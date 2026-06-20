"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Listing = void 0;
const sequelize_1 = require("sequelize");
const db_1 = require("../db");
const User_1 = require("./User");
const Category_1 = require("./Category");
class Listing extends sequelize_1.Model {
}
exports.Listing = Listing;
Listing.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
        primaryKey: true,
    },
    title: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    description: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: false,
    },
    price: {
        type: sequelize_1.DataTypes.FLOAT,
        allowNull: false,
    },
    images: {
        type: sequelize_1.DataTypes.JSON, // Stores an array of image URLs
        defaultValue: [],
    },
    status: {
        type: sequelize_1.DataTypes.ENUM('active', 'sold'),
        defaultValue: 'active',
    },
    condition: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    location: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    brand: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    model: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    yearOfPurchase: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
    },
    yearsUsed: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
    },
    warranty: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    pricingType: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
        defaultValue: 'fixed',
    },
    city: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    state: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    country: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
        defaultValue: 'India',
    },
    buyerId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: true,
    },
}, {
    sequelize: db_1.sequelize,
    modelName: 'Listing',
    tableName: 'listings',
});
// Define Relationships
User_1.User.hasMany(Listing, { foreignKey: 'sellerId', as: 'listings' });
Listing.belongsTo(User_1.User, { foreignKey: 'sellerId', as: 'seller' });
Category_1.Category.hasMany(Listing, { foreignKey: 'categoryId', as: 'listings' });
Listing.belongsTo(Category_1.Category, { foreignKey: 'categoryId', as: 'category' });
Listing.belongsTo(User_1.User, { foreignKey: 'buyerId', as: 'buyer' });

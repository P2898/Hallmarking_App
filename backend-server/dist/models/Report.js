"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Report = void 0;
const sequelize_1 = require("sequelize");
const db_1 = require("../db");
const User_1 = require("./User");
const Listing_1 = require("./Listing");
class Report extends sequelize_1.Model {
}
exports.Report = Report;
Report.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
        primaryKey: true,
    },
    reason: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: false,
    },
    status: {
        type: sequelize_1.DataTypes.ENUM('pending', 'resolved'),
        defaultValue: 'pending',
    },
    listingId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
    },
    reporterId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
    },
}, {
    sequelize: db_1.sequelize,
    modelName: 'Report',
    tableName: 'reports',
});
// Relationships
Listing_1.Listing.hasMany(Report, { foreignKey: 'listingId', as: 'reports' });
Report.belongsTo(Listing_1.Listing, { foreignKey: 'listingId', as: 'listing' });
User_1.User.hasMany(Report, { foreignKey: 'reporterId', as: 'reports' });
Report.belongsTo(User_1.User, { foreignKey: 'reporterId', as: 'reporter' });

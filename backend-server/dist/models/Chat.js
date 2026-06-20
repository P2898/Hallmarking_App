"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Offer = exports.Message = exports.Chat = void 0;
const sequelize_1 = require("sequelize");
const db_1 = require("../db");
const User_1 = require("./User");
const Listing_1 = require("./Listing");
class Chat extends sequelize_1.Model {
}
exports.Chat = Chat;
class Message extends sequelize_1.Model {
}
exports.Message = Message;
class Offer extends sequelize_1.Model {
}
exports.Offer = Offer;
Chat.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
        primaryKey: true,
    },
    lastMessage: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
    },
    unreadCount: {
        type: sequelize_1.DataTypes.INTEGER,
        defaultValue: 0,
    },
}, {
    sequelize: db_1.sequelize,
    modelName: 'Chat',
    tableName: 'chats',
});
Message.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
        primaryKey: true,
    },
    text: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: false,
    },
    read: {
        type: sequelize_1.DataTypes.BOOLEAN,
        defaultValue: false,
    },
}, {
    sequelize: db_1.sequelize,
    modelName: 'Message',
    tableName: 'messages',
});
Offer.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
        primaryKey: true,
    },
    amount: {
        type: sequelize_1.DataTypes.FLOAT,
        allowNull: false,
    },
    message: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
    },
    status: {
        type: sequelize_1.DataTypes.ENUM('pending', 'accepted', 'declined'),
        defaultValue: 'pending',
    },
}, {
    sequelize: db_1.sequelize,
    modelName: 'Offer',
    tableName: 'offers',
});
// Define Associations
Chat.belongsTo(User_1.User, { foreignKey: 'buyerId', as: 'buyer' });
Chat.belongsTo(User_1.User, { foreignKey: 'sellerId', as: 'seller' });
Chat.belongsTo(Listing_1.Listing, { foreignKey: 'listingId', as: 'listing' });
Chat.belongsTo(User_1.User, { foreignKey: 'lastSenderId', as: 'lastSender' });
Chat.hasMany(Message, { foreignKey: 'chatId', as: 'messages', onDelete: 'CASCADE' });
Message.belongsTo(Chat, { foreignKey: 'chatId', as: 'chat' });
Message.belongsTo(User_1.User, { foreignKey: 'senderId', as: 'sender' });
Chat.hasMany(Offer, { foreignKey: 'chatId', as: 'offers', onDelete: 'CASCADE' });
Offer.belongsTo(Chat, { foreignKey: 'chatId', as: 'chat' });
Offer.belongsTo(User_1.User, { foreignKey: 'senderId', as: 'sender' });

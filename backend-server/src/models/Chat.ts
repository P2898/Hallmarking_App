import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../db';
import { User } from './User';
import { Listing } from './Listing';

export class Chat extends Model {
  public id!: string;
  public buyerId!: string;
  public sellerId!: string;
  public listingId!: string;
  public lastMessage!: string | null;
  public unreadCount!: number;
  public lastSenderId!: string | null;
}

export class Message extends Model {
  public id!: string;
  public chatId!: string;
  public senderId!: string;
  public text!: string;
  public read!: boolean;
}

export class Offer extends Model {
  public id!: string;
  public chatId!: string;
  public senderId!: string;
  public amount!: number;
  public message!: string | null;
  public status!: 'pending' | 'accepted' | 'declined';
}

Chat.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    lastMessage: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    unreadCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  },
  {
    sequelize,
    modelName: 'Chat',
    tableName: 'chats',
  }
);

Message.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    text: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    read: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    sequelize,
    modelName: 'Message',
    tableName: 'messages',
  }
);

Offer.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    amount: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('pending', 'accepted', 'declined'),
      defaultValue: 'pending',
    },
  },
  {
    sequelize,
    modelName: 'Offer',
    tableName: 'offers',
  }
);

// Define Associations
Chat.belongsTo(User, { foreignKey: 'buyerId', as: 'buyer' });
Chat.belongsTo(User, { foreignKey: 'sellerId', as: 'seller' });
Chat.belongsTo(Listing, { foreignKey: 'listingId', as: 'listing' });
Chat.belongsTo(User, { foreignKey: 'lastSenderId', as: 'lastSender' });

Chat.hasMany(Message, { foreignKey: 'chatId', as: 'messages', onDelete: 'CASCADE' });
Message.belongsTo(Chat, { foreignKey: 'chatId', as: 'chat' });
Message.belongsTo(User, { foreignKey: 'senderId', as: 'sender' });

Chat.hasMany(Offer, { foreignKey: 'chatId', as: 'offers', onDelete: 'CASCADE' });
Offer.belongsTo(Chat, { foreignKey: 'chatId', as: 'chat' });
Offer.belongsTo(User, { foreignKey: 'senderId', as: 'sender' });

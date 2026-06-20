import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../db';
import { User } from './User';
import { Category } from './Category';

export class Listing extends Model {
  public id!: string;
  public title!: string;
  public description!: string;
  public price!: number;
  public images!: string; // Stored as JSON string
  public status!: 'active' | 'sold';
  public condition!: string;
  public location!: string;
  
  public brand!: string | null;
  public model!: string | null;
  public yearOfPurchase!: number | null;
  public yearsUsed!: number | null;
  public warranty!: string | null;
  public pricingType!: string;
  public city!: string | null;
  public state!: string | null;
  public country!: string | null;

  // Foreign keys
  public sellerId!: string;
  public categoryId!: string;
  public buyerId!: string | null;
}

Listing.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    price: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    images: {
      type: DataTypes.JSON, // Stores an array of image URLs
      defaultValue: [],
    },
    status: {
      type: DataTypes.ENUM('active', 'sold'),
      defaultValue: 'active',
    },
    condition: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    location: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    brand: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    model: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    yearOfPurchase: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    yearsUsed: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    warranty: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    pricingType: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: 'fixed',
    },
    city: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    state: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    country: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: 'India',
    },
    buyerId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'Listing',
    tableName: 'listings',
  }
);

// Define Relationships
User.hasMany(Listing, { foreignKey: 'sellerId', as: 'listings' });
Listing.belongsTo(User, { foreignKey: 'sellerId', as: 'seller' });

Category.hasMany(Listing, { foreignKey: 'categoryId', as: 'listings' });
Listing.belongsTo(Category, { foreignKey: 'categoryId', as: 'category' });

Listing.belongsTo(User, { foreignKey: 'buyerId', as: 'buyer' });


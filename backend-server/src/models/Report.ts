import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../db';
import { User } from './User';
import { Listing } from './Listing';

export class Report extends Model {
  public id!: string;
  public reason!: string;
  public status!: 'pending' | 'resolved';
  
  // Foreign keys
  public listingId!: string;
  public reporterId!: string;
}

Report.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    reason: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('pending', 'resolved'),
      defaultValue: 'pending',
    },
    listingId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    reporterId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'Report',
    tableName: 'reports',
  }
);

// Relationships
Listing.hasMany(Report, { foreignKey: 'listingId', as: 'reports' });
Report.belongsTo(Listing, { foreignKey: 'listingId', as: 'listing' });

User.hasMany(Report, { foreignKey: 'reporterId', as: 'reports' });
Report.belongsTo(User, { foreignKey: 'reporterId', as: 'reporter' });

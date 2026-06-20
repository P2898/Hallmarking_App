import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../db';

export class Category extends Model {
  public id!: string;
  public name!: string;
  public nameHi!: string | null;
  public nameGu!: string | null;
  public icon!: string | null;
}

Category.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    nameHi: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    nameGu: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    icon: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'Category',
    tableName: 'categories',
  }
);

const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Store = sequelize.define(
  'Store',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(60),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: { msg: 'Must be a valid email address' },
      },
    },
    address: {
      type: DataTypes.STRING(400),
      allowNull: false,
    },
    // owner of the store - a user with role 'store_owner'. Nullable so an
    // admin can register a store before assigning/creating its owner.
    ownerId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'owner_id',
      references: {
        model: 'users',
        key: 'id',
      },
    },
  },
  {
    tableName: 'stores',
    timestamps: true,
    indexes: [
      { fields: ['name'] },
      { fields: ['email'] },
      { fields: ['address'] },
    ],
  }
);

module.exports = Store;

const sequelize = require('../config/db');
const User = require('./User');
const Store = require('./Store');
const Rating = require('./Rating');

// A store has one owner (a user with role store_owner)
User.hasOne(Store, { foreignKey: 'ownerId', as: 'ownedStore' });
Store.belongsTo(User, { foreignKey: 'ownerId', as: 'owner' });

// A user can submit many ratings; a store can receive many ratings
User.hasMany(Rating, { foreignKey: 'userId', as: 'ratings' });
Rating.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Store.hasMany(Rating, { foreignKey: 'storeId', as: 'ratings' });
Rating.belongsTo(Store, { foreignKey: 'storeId', as: 'store' });

module.exports = { sequelize, User, Store, Rating };

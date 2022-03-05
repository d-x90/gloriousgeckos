const sequelize = require('../database-connection');
const Inventory = require('./inventory');
const Nft = require('./nft');
const Transaction = require('./transaction');
const User = require('./user');

User.hasOne(Inventory);
Inventory.belongsTo(User);

User.hasMany(Nft);
User.hasMany(Inventory);

Nft.belongsTo(User);
Transaction.belongsTo(User);

(async () => {
    try {
        await sequelize.sync({ force: false });
    } catch (error) {
        console.trace(error);
    }
})();

module.exports = { sequelize };

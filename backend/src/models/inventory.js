const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../database-connection');

const Inventory = sequelize.define(
    'Inventory',
    {
        id: {
            type: DataTypes.UUID,
            primaryKey: true,
            defaultValue: Sequelize.UUIDV4,
        },
        revivePotion: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
    },
    {
        freezeTableName: true,
    }
);

module.exports = Inventory;

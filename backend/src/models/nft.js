const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../database-connection');

const Nft = sequelize.define(
    'Nft',
    {
        mint: {
            primaryKey: true,
            unique: true,
            type: DataTypes.STRING,
            allowNull: false,
        },
        isDead: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        score: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
        dailyLimit: {
            type: DataTypes.INTEGER,
            defaultValue: 500,
        },
        cooldownStartedAt: {
            type: DataTypes.INTEGER,
            defaultValue: null,
        },
        metaDataUri: {
            type: DataTypes.STRING,
            defaultValue: null,
        },
        symbol: {
            type: DataTypes.STRING,
            defaultValue: null,
        },
    },
    {
        freezeTableName: true,
    }
);

module.exports = Nft;

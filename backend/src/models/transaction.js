const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../database-connection');

const Transaction = sequelize.define(
    'Transaction',
    {
        signature: {
            primaryKey: true,
            unique: true,
            type: DataTypes.STRING,
            allowNull: false,
        },
        amount: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
        tokenMint: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        isDeposit: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
        },
    },
    {
        freezeTableName: true,
    }
);

module.exports = Transaction;

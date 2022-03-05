const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../database-connection');
const { USER_ROLES } = require('../enums');

const User = sequelize.define(
    'User',
    {
        wallet: {
            primaryKey: true,
            unique: true,
            type: DataTypes.STRING,
            allowNull: false,
        },
        username: {
            unique: true,
            type: DataTypes.STRING,
            allowNull: false,
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        role: {
            type: DataTypes.ENUM(Object.keys(USER_ROLES)),
            allowNull: false,
            defaultValue: USER_ROLES.USER,
        },
        refreshToken: {
            type: DataTypes.UUID,
            allowNull: true,
        },
        jwtValidAfter: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
        balance: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
        currentGameConfig: {
            type: DataTypes.JSON,
            defaultValue: null,
        },
        redFlagCount: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
    },
    {
        freezeTableName: true,
    }
);

module.exports = User;

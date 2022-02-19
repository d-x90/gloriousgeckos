const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../database-connection');
const { USER_ROLES } = require('../enums');

const User = sequelize.define(
    'User',
    {
        username: {
            primaryKey: true,
            unique: true,
            type: DataTypes.STRING,
            allowNull: false,
        },
        wallet: {
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
    },
    {
        freezeTableName: true,
    }
);

(async () => {
    try {
        await User.sync({ force: false });
    } catch (error) {
        console.trace(error);
    }
})();

module.exports = User;

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
        isOnCooldown: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        metaDataUri: {
            type: DataTypes.STRING,
            defaultValue: null,
        },
        symbol: {
            type: DataTypes.STRING,
            defaultValue: null,
        },
        isStaked: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        stakingDaysLeft: {
            type: DataTypes.INTEGER,
            defaultValue: 50,
        },
        claimableStakingRewards: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
        claimedStakingRewards: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
    },
    {
        freezeTableName: true,
    }
);

module.exports = Nft;

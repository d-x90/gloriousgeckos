const User = require('../models/user');
const { Op } = require('sequelize');
const uuid = require('uuid');
const Nft = require('../models/nft');
const Inventory = require('../models/inventory');
const solanaService = require('./solana-service');
const logger = require('../logger-factory').get('./inventory-service.js');

const inventoryService = {};

inventoryService.createInventory = async (userWallet) => {
    return Inventory.create({
        UserWallet: userWallet,
    });
};

inventoryService.getNft = (mint) => {
    return Nft.findOne({ where: { mint } });
};

inventoryService.getNftsByWallet = (wallet) => {
    return Nft.findAll({ where: { UserWallet: wallet } });
};

inventoryService.updateNft = (nft) => {
    return Nft.update(nft, {
        where: {
            mint: nft.mint,
        },
    });
};

inventoryService.deleteNft = (mint) => {
    return Nft.destroy({
        where: {
            mint,
        },
    });
};

module.exports = inventoryService;

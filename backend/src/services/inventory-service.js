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
        revivePotion: 3,
    });
};

inventoryService.getInventoryByWallet = (wallet) => {
    return Inventory.findOne({ where: { UserWallet: wallet } });
};

inventoryService.getInventory = (id) => {
    return Inventory.findOne({ where: { id } });
};

inventoryService.updateInventory = async (inventory, id) => {
    const [_, updatedRows] = await Inventory.update(inventory, {
        where: {
            id,
        },
        returning: true,
    });

    return updatedRows[0];
};

inventoryService.deleteNft = (mint) => {
    return Nft.destroy({
        where: {
            mint,
        },
    });
};

module.exports = inventoryService;

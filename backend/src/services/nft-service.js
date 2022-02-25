const User = require('../models/user');
const { Op } = require('sequelize');
const uuid = require('uuid');
const Nft = require('../models/nft');
const Inventory = require('../models/inventory');
const solanaService = require('./solana-service');
const logger = require('../logger-factory').get('./nft-service.js');

const nftService = {};

nftService.createNft = async (nft) => {
    const createdNft = await Nft.create(nft);
    return createdNft;
};

nftService.createManyNft = async (nfts) => {
    const createdNft = await Nft.bulkCreate(nfts);
    return createdNft;
};

nftService.getNft = (mint) => {
    return Nft.findOne({ where: { mint } });
};

nftService.getNftsByWallet = (wallet) => {
    return Nft.findAll({ where: { UserWallet: wallet } });
};

nftService.updateNft = async (nft, mint) => {
    const [_, updatedRows] = await Nft.update(nft, {
        where: {
            mint,
        },
        returning: true,
    });

    return updatedRows[0];
};

nftService.deleteNft = (mint) => {
    return Nft.destroy({
        where: {
            mint,
        },
    });
};

module.exports = nftService;

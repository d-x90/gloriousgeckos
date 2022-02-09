
const logger = require('../logger-factory').get('./sol-service.js');
const web3 = require("@solana/web3.js");
const splToken = require("@solana/spl-token");
const { SOLANA_NETWORK } = require('../config');

// Connect to cluster
const connection = new web3.Connection(
    web3.clusterApiUrl(SOLANA_NETWORK),
    "confirmed"
);

const solService = {};

solService.checkIfWalletExists = async (wallet) => {
    try {
        const balance = await connection.getBalance(new web3.PublicKey(wallet));
        return balance > 0;
    } catch (e) {
        logger.error(e);
        return false;
    }
};

module.exports = solService;

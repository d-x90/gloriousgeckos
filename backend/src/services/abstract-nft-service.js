const degodsService = require('./degods-service');
const solanaService = require('./solana-service');

const abstractNftService = {};

abstractNftService.verifyNftOwnership = async (nftMint, wallet) => {
    const isNftOwnedOnchain = await solanaService.verifyNftOwnership(
        nftMint,
        wallet
    );

    const isStakedDegodOwned = await degodsService.verifyNftOwnership(
        nftMint,
        wallet
    );

    const isNftOwned = isNftOwnedOnchain || isStakedDegodOwned;

    return isNftOwned;
};

module.exports = abstractNftService;

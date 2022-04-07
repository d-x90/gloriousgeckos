const degodsApi = require('./degods-api');
const logger = require('../logger-factory').get('./degods-service.js');

const degodsService = {};

degodsService.getStakedNfts = async (wallet) => {
    const degodsStakingInfo = await degodsApi.fetchStakingInfo(wallet);

    if (!degodsStakingInfo || !degodsStakingInfo.gems) {
        return [];
    }

    return degodsStakingInfo.gems.map((gem) => ({
        mint: gem.mint,
        metaDataUri: 'degods..',
        symbol: gem.externalMetadata.symbol,
        UserWallet: wallet,
    }));
};

degodsService.verifyNftOwnership = async (mint, wallet) => {
    const stakedDegods = await degodsService.getStakedNfts(wallet);

    return stakedDegods.some((nft) => nft.mint === mint);
};

module.exports = degodsService;

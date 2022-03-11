require('./utils').init();
const solanaService = require('./services/solana-service');

(async () => {
    let onChainNfts = await solanaService.getNfts(
        'Dj43kCxe5kVEdJRSCJkUx2tpqceHGdveeCLsLHuZrQzh'
    );

    console.log({ onChainNfts });
})();

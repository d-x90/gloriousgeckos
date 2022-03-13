require('./utils').init();
require('./models/associations');

const solanaService = require('./services/solana-service');
const userService = require('./services/user-service');
const nftService = require('./services/nft-service');

// Resurrect nfts daily if at least one gecko is held
(async () => {
    let userWallets = await userService.getAllUserWallet();
    userWallets.forEach(async ({ wallet }) => {
        console.log({ wallet });
        const nftsOfUser = await nftService.getNftsByWallet(wallet);
        const geckoNft = nftsOfUser.find((nft) => nft.symbol === 'GG');
        if (geckoNft) {
            const isVerified = await solanaService.verifyNft(
                geckoNft.mint,
                wallet
            );

            if (isVerified) {
                await nftService.updateAllNftForUser(
                    {
                        isDead: false,
                        score: 0,
                        isOnCooldown: false,
                    },
                    wallet
                );
                console.log(`Nfts resurrected for "${wallet}"`);
            }
        }
    });
})();

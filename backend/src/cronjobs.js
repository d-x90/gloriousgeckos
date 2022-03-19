require('./utils').init();
require('./models/associations');

const solanaService = require('./services/solana-service');
const userService = require('./services/user-service');
const nftService = require('./services/nft-service');

if (process.argv[2] === 'weekly') {
    // Resurrect all
    (async () => {
        await nftService.updateAllNft({
            isDead: false,
        });

        console.log('Nfts resurrected');
    })();
} else if (process.argv[2] === 'daily') {
    // Resurrect nfts daily if at least one gecko is held
    (async () => {
        let userWallets = await userService.getAllUserWallet();

        for (let i = 0; i < userWallets.length; i++) {
            const wallet = userWallets[i].wallet;
            console.log({ wallet });

            const nftsOfUser = await nftService.getNftsByWallet(wallet);
            const geckoNft = nftsOfUser.find((nft) => nft.symbol === 'GG');
            if (geckoNft) {
                const isVerified = await solanaService.verifyNft(
                    geckoNft.mint,
                    wallet
                );

                Promise.waitFor(1000);

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
        }
    })();

    // Reset cooldown daily
    (async () => {
        await nftService.updateAllNft({
            score: 0,
            isOnCooldown: false,
        });

        console.log('Nfts cooldown reset completed');
    })();
}

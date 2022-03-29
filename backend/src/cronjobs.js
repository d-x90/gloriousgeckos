const sequelize = require('./database-connection');
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

    (async () => {
        let users = await userService.getAllUser();

        for (let i = 0; i < users.length; i++) {
            const user = users[i];
            const wallet = users[i].wallet;
            console.log({ wallet });

            const nftsOfUser = await nftService.getNftsByWallet(wallet);
            const stakedGeckos = nftsOfUser.filter((nft) => nft.isStaked);

            for (let j = 0; j < stakedGeckos.length; j++) {
                try {
                    const stakedGecko = stakedGeckos[j];
                    const isVerified = await solanaService.verifyNft(
                        stakedGecko.mint,
                        wallet
                    );
                    Promise.waitFor(1000);

                    if (isVerified) {
                        const modifiedFields = {
                            stakingDaysLeft: stakedGecko.stakingDaysLeft - 1,
                        };

                        if (stakedGecko.stakingDaysLeft === 0) {
                            modifiedFields.stakingDaysLeft = 50;
                            modifiedFields.claimableStakingRewards =
                                stakedGecko.claimableStakingRewards + 1;
                        }

                        await nftService.updateNft(
                            modifiedFields,
                            stakedGecko.mint
                        );
                        console.log(
                            `Nft stake decremented for "${stakedGecko.mint}"`
                        );
                    } else {
                        await nftService.updateNft(
                            {
                                stakingDaysLeft: 50,
                                isStaked: false,
                                UserWallet: null,
                            },
                            stakedGecko.mint
                        );
                        await userService.updateUser(
                            { balance: user.balance + 100 },
                            wallet
                        );
                        console.log(
                            `Nft "${stakedGecko.mint}" has been taken from "${wallet}" `
                        );
                    }
                } catch (e) {
                    console.error('Error happened in staking cronjob:', e);
                }
            }
        }
    })();

    // Reset cooldown daily
    (async () => {
        const [results, metadata] = await sequelize.query(
            'UPDATE "Nft" SET "isOnCooldown" = false, "score" = 0;'
        );

        console.log('Nfts cooldown reset completed');
    })();
}

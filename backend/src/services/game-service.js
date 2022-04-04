const uuid = require('uuid');
const nftService = require('./nft-service');
const userService = require('./user-service');
const shittyEncryptor = require('./shitty-encyptor');
const abstractNftService = require('./abstract-nft-service');
const logger = require('../logger-factory').get('./game-service.js');

const gameService = {};

gameService.startGame = async ({ nftMint, secondaries, wallet, config }) => {
    const nftMints = [nftMint, ...secondaries.filter((x) => x !== nftMint)];
    for (let i = 0; i < nftMints.length; i++) {
        let nft = await nftService.getNft(nftMints[i]);

        if (!nft) {
            throw new Error(`NFT not found`);
        }

        if (nft.UserWallet !== wallet) {
            throw new Error('NFT does not belong to the user');
        }

        if (nft.isOnCooldown) {
            throw new Error(`NFT is on cooldown`);
        }

        if (nft.isDead) {
            throw new Error('Dead NFTs cannot play');
        }

        const isNftOwned = await abstractNftService.verifyNftOwnership(
            nft.mint,
            wallet
        );

        if (!isNftOwned) {
            await nftService.updateNft(
                {
                    UserWallet: null,
                    isStaked: false,
                    claimableStakingRewards: 0,
                },
                nft.mint
            );
            throw new Error(`NFT is not valid (${nft.mint})`);
        }

        Promise.waitFor(250);
    }

    const hash = uuid.v4();

    const user = await userService.getUserByWallet(wallet);
    user.currentGameConfig = {
        ...config,
        nftMint,
        secondaries,
        expectedHash: hash,
    };

    await userService.updateGameConfig(user.currentGameConfig, user.wallet);

    return { hash };
};

gameService.finishGame = async ({ payload, wallet }) => {
    const user = await userService.getUserByWallet(wallet);
    if (!user) {
        throw new Error('User not found');
    }

    const decodedPayload = shittyEncryptor.decode(payload);

    if (!decodedPayload) {
        throw new Error('Invalid payload');
    }

    let providedScore, providedDidDie, providedHash, providedTime;
    try {
        const { score, didDie, hash, time } = decodedPayload;
        providedScore = score;
        providedDidDie = didDie;
        providedHash = hash;
        providedTime = time;
    } catch (err) {
        throw new Error('Incorrect payload structure');
    }

    const currentGameConfig = user.currentGameConfig;
    if (!currentGameConfig) {
        throw new Error('No game is running currently');
    }

    if (currentGameConfig.expectedHash !== providedHash) {
        throw new Error('Invalid hash');
    }

    let allGloryEarned = 0;

    const nftMints = [
        currentGameConfig.nftMint,
        ...currentGameConfig.secondaries,
    ];

    for (let i = 0; i < nftMints.length; i++) {
        const nft = await nftService.getNft(nftMints[i]);
        if (!nft) {
            throw new Error('One of the Nfts is not found');
        }

        const isOwner = await abstractNftService.verifyNftOwnership(
            nft.mint,
            wallet
        );
        if (!isOwner) {
            await userService.updateUser(
                { redFlagCount: user.redFlagCount + 1 },
                wallet
            );
            if (nft.UserWallet === wallet) {
                await nftService.updateNft(
                    {
                        UserWallet: null,
                        isStaked: false,
                        claimableStakingRewards: 0,
                    },
                    nft.mint
                );
            }
            throw new Error(
                'One of the nfts is not owned at the end of the game'
            );
        }

        const nftPatch = {};
        let actualScore = providedScore;
        if (providedScore + nft.score >= nft.dailyLimit) {
            actualScore = nft.dailyLimit - nft.score;

            nftPatch.isOnCooldown = true;
        }
        allGloryEarned += actualScore;

        nftPatch.score = nft.score + actualScore;
        const didPlayAsSecondary = nft.mint !== currentGameConfig.nftMint;
        const isGloriousGecko = nft.symbol === 'GG';

        if (didPlayAsSecondary) {
            nftPatch.isDead = providedDidDie && !isGloriousGecko;
        } else {
            nftPatch.isDead = providedDidDie;
        }

        await nftService.updateNft(nftPatch, nft.mint);
        await Promise.waitFor(250);
    }

    let userUpdate = {
        balance: user.balance + allGloryEarned,
        currentGameConfig: null,
    };

    if (user.isSignedUp) {
        try {
            let currentTime = Number(providedTime.split('.')[0]);

            if (user.bestScore === null || user.bestScore === 0) {
                userUpdate.bestScore = currentTime;
            } else if (currentTime < user.bestScore) {
                userUpdate.bestScore = currentTime;
            }
        } catch (e) {}
    }

    // TODO: remove items used or remove them at start? iteration 2
    await userService.updateUser(userUpdate, user.wallet);

    return { isSuccess: true, gloryEarned: allGloryEarned, time: providedTime };
};

module.exports = gameService;

const User = require('../models/user');
const { Op } = require('sequelize');
const uuid = require('uuid');
const Nft = require('../models/nft');
const Inventory = require('../models/inventory');
const nftService = require('./nft-service');
const solanaService = require('./solana-service');
const userService = require('./user-service');
const logger = require('../logger-factory').get('./game-service.js');

const gameService = {};

gameService.startGame = async ({ nftMint, wallet, config }) => {
    let nft = await nftService.getNft(nftMint);

    if (nft) {
        if (nft.UserWallet !== wallet) {
            if (!solanaService.verifyNft(nftMint, wallet)) {
                throw new Error('NFT is not valid');
            }
            nftService.updateNft({ UserWallet: wallet }, nftMint);
        }
    } else {
        if (!solanaService.verifyNft(nftMint, wallet)) {
            throw new Error('NFT is not valid');
        }
        nft = await nftService.createNft(nftMint, wallet);
    }

    if (nft.cooldownStartedAt !== null) {
        const now = new Date();
        const nowInUTC = now.getTime() + now.getTimezoneOffset() * 60 * 1000;

        const cooldownExpiresInMs = nft.cooldownStartedAt + 86400000 - nowInUTC;
        if (cooldownExpiresInMs > 0) {
            throw new Error(`NFT is on cooldown for ${cooldownExpiresInMs}ms`);
        }
    }

    if (nft.isDead) {
        throw new Error('Dead NFTs cannot play');
    }

    const hash = uuid.v4();

    const user = await userService.getUserByWallet(wallet);
    user.currentGameConfig = {
        ...config,
        nftMint: nft.mint,
        //TODO: transform the hash
        expectedHash: hash,
    };

    await userService.updateGameConfig(user.currentGameConfig, user.wallet);

    return { hash, nft };
};

gameService.finishGame = async ({ score, didDie, hash, wallet }) => {
    const user = await userService.getUserByWallet(wallet);
    if (!user) {
        throw new Error('User not found');
    }

    const currentGameConfig = user.currentGameConfig;
    if (!currentGameConfig) {
        throw new Error('No game is running currently');
    }

    if (currentGameConfig.expectedHash !== hash) {
        throw new Error('Invalid hash');
    }

    const nft = await nftService.getNft(currentGameConfig.nftMint);
    const nftPatch = {};
    if (score + nft.score > nft.dailyLimit) {
        score = nft.dailyLimit - nft.score;

        const now = new Date();
        const nowInUTC = now.getTime() + now.getTimezoneOffset() * 60 * 1000;
        nftPatch.cooldownStartedAt = nowInUTC;
    }
    newNftScore = nft.score + score;
    newBalance = user.balance + score;

    nftPatch.score = newNftScore;
    nftPatch.isDead = didDie;
    // TODO: remove items used or remove them at start? iteration 2

    nftService.updateNft(nftPatch, nft.mint);
    userService.updateUser(
        { balance: newBalance, currentGameConfig: null },
        user.wallet
    );

    return true;
};

module.exports = gameService;

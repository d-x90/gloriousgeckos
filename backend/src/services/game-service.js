const User = require('../models/user');
const { Op } = require('sequelize');
const uuid = require('uuid');
const Nft = require('../models/nft');
const Inventory = require('../models/inventory');
const nftService = require('./nft-service');
const solanaService = require('./solana-service');
const userService = require('./user-service');
const shittyEncryptor = require('./shitty-encyptor');
const logger = require('../logger-factory').get('./game-service.js');

const gameService = {};

gameService.startGame = async ({ nftMint, wallet, config }) => {
    let nft = await nftService.getNft(nftMint);

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

    if (!solanaService.verifyNftOwnership(nftMint, wallet)) {
        await nftService.updateNft({ UserWallet: null }, nft.mint);
        throw new Error('NFT is not valid');
    }

    const hash = uuid.v4();

    const user = await userService.getUserByWallet(wallet);
    user.currentGameConfig = {
        ...config,
        nftMint: nft.mint,
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

    let providedScore, providedDidDie, providedHash;
    try {
        const { score, didDie, hash } = decodedPayload;
        providedScore = score;
        providedDidDie = didDie;
        providedHash = hash;
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

    const nft = await nftService.getNft(currentGameConfig.nftMint);
    if (!nft) {
        throw new Error('Nft not found');
    }

    const isOwner = await solanaService.verifyNftOwnership(nft.mint, wallet);
    if (!isOwner) {
        await userService.updateUser(
            { redFlagCount: user.redFlagCount + 1 },
            wallet
        );
        if (nft.UserWallet === wallet) {
            await nftService.updateNft({ UserWallet: null }, nft.mint);
        }
        throw new Error('Nft is not owned at the end of the game');
    }

    const nftPatch = {};
    if (providedScore + nft.score >= nft.dailyLimit) {
        providedScore = nft.dailyLimit - nft.score;

        nftPatch.isOnCooldown = true;
    }
    newNftScore = nft.score + providedScore;
    newBalance = user.balance + providedScore;

    nftPatch.score = newNftScore;
    nftPatch.isDead = providedDidDie;

    // TODO: remove items used or remove them at start? iteration 2

    nftService.updateNft(nftPatch, nft.mint);
    userService.updateUser(
        { balance: newBalance, currentGameConfig: null },
        user.wallet
    );

    return true;
};

module.exports = gameService;

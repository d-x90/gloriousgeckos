const { default: rateLimit } = require('express-rate-limit');
const { authenticateJWT } = require('../middlewares');
const gameService = require('../services/game-service');
const solanaService = require('../services/solana-service');
const { validateNftVerification } = require('../validators');
const gameRoutes = require('express').Router();
const logger = require('../logger-factory').get('game-controller');

gameRoutes.post('/start', authenticateJWT, async (req, res, next) => {
    try {
        const { hash } = await gameService.startGame({
            nftMint: req.body.nftMint,
            wallet: req.userInfo.wallet,
            config: req.body.config || {},
        });
        res.json({ hash });
    } catch (err) {
        logger.error(
            `Error starting game for user: '${req.userInfo.username}' with nft: '${req.body.nftMint}'`
        );
        next(err);
    }
});

gameRoutes.post('/finish', authenticateJWT, async (req, res, next) => {
    try {
        const { payload } = req.body;
        const isSuccess = await gameService.finishGame({
            payload,
            wallet: req.userInfo.wallet,
        });
        res.json({ isSuccess });
    } catch (err) {
        logger.error(`Error ending game for user: '${req.userInfo.username}'`);
        next(err);
    }
});

module.exports = gameRoutes;

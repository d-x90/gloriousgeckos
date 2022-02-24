const { default: rateLimit } = require('express-rate-limit');
const { authenticateJWT } = require('../middlewares');
const gameService = require('../services/game-service');
const solanaService = require('../services/solana-service');
const { validateNftVerification } = require('../validators');
const tokenRoutes = require('express').Router();
const logger = require('../logger-factory').get('nft-controller');

tokenRoutes.post(
    '/deposit/:txSignature',
    authenticateJWT,
    async (req, res, next) => {
        try {
            const txSignature = req.params.txSignature;

            // check if txSignature is processed already

            // check if transaction is valid

            // add transaction
            // add amount to user's balance

            res.json({ isAccepted, isProcessed });
        } catch (err) {
            logger.error(
                `Error depositing token for user: '${req.userInfo.username}'`
            );
            next(err);
        }
    }
);

module.exports = tokenRoutes;

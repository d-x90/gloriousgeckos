const { authenticateJWT } = require('../middlewares');
const solanaService = require('../services/solana-service');
const { validateNftVerification } = require('../validators');
const nftRoutes = require('express').Router();
const logger = require('../logger-factory').get('nft-controller');
const rateLimit = require('express-rate-limit');

nftRoutes.use(
    rateLimit({
        windowMs: 60 * 1000, // 1 minute duration in milliseconds
        max: 3,
        message: 'You exceeded 3 requests in 1 minute limit!',
        headers: true,
    })
);

nftRoutes.get('/usable-nfts', authenticateJWT, async (req, res, next) => {
    try {
        const usableNfts = await solanaService.getNfts(req.userInfo.wallet);
        res.json({ usableNfts });
    } catch (err) {
        logger.error(
            `Couldn't get usable nfts for user: '${req.userInfo.username}'`
        );
        next(err);
    }
});

nftRoutes.get(
    '/:mint/verify',
    authenticateJWT,
    validateNftVerification,
    async (req, res, next) => {
        try {
            const isOwner = await solanaService.verifyNftOwnership(
                req.params.mint,
                req.userInfo.wallet
            );
            const isUsable = await solanaService.verifyNftWhitelist(
                req.params.mint
            );
            res.json({ isUsable: isOwner && isUsable });
        } catch (err) {
            logger.error(
                `Couldn't get usable nfts for user: '${req.userInfo.username}'`
            );
            next(err);
        }
    }
);

module.exports = nftRoutes;

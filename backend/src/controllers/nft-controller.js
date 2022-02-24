const { authenticateJWT } = require('../middlewares');
const solanaService = require('../services/solana-service');
const nftService = require('../services/nft-service');
const { validateNftVerification } = require('../validators');
const nftRoutes = require('express').Router();
const logger = require('../logger-factory').get('nft-controller');
const rateLimit = require('express-rate-limit');

nftRoutes.get('/all', authenticateJWT, async (req, res, next) => {
    try {
        const queriedNfts = await nftService.getNftsByWallet(
            req.userInfo.wallet
        );

        res.json({ nfts: queriedNfts });
    } catch (err) {
        logger.error(`Couldn't get nfts for user: '${req.userInfo.wallet}'`);
        next(err);
    }
});

nftRoutes.get('/:mint', async (req, res, next) => {
    try {
        const queriedNft = await nftService.getNft(req.params.mint);
        if (!queriedNft) {
            res.status(404);
            throw new Error('Nft is not found');
        }

        res.json(queriedNft);
    } catch (err) {
        logger.error(`Couldn't get nft: '${req.query.mint}'`);
        next(err);
    }
});

nftRoutes.use(
    rateLimit({
        windowMs: 60 * 1000, // 1 minute duration in milliseconds
        max: 3,
        message: 'You exceeded 3 requests in 1 minute limit!',
        headers: true,
    })
);

nftRoutes.post(
    '/check-for-new-nfts',
    authenticateJWT,
    async (req, res, next) => {
        try {
            const queriedNfts = await nftService.getNftsByWallet(
                req.userInfo.wallet
            );

            const crawledNfts = await solanaService.getNfts(
                req.userInfo.wallet,
                queriedNfts.map((nft) => nft.mint)
            );
            const nfts = crawledNfts.map((nft) => ({
                mint: nft.mint,
                metaDataUri: nft.uri,
                symbol: nft.symbol,
                UserWallet: req.userInfo.wallet,
            }));

            // TODO: don't create if exists just update the owner!
            const newNfts = await nftService.createManyNft(nfts);
            res.json({ newNfts });
        } catch (err) {
            logger.error(
                `Couldn't get more usable nfts for user: '${req.userInfo.username}'`
            );
            next(err);
        }
    }
);

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

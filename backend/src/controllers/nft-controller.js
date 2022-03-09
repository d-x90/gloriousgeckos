const { authenticateJWT } = require('../middlewares');
const solanaService = require('../services/solana-service');
const nftService = require('../services/nft-service');
const { validateNftVerification } = require('../validators');
const nftRoutes = require('express').Router();
const logger = require('../logger-factory').get('nft-controller');
const rateLimit = require('express-rate-limit');
const inventoryService = require('../services/inventory-service');
const degodsService = require('../services/degods-service');
const abstractNftService = require('../services/abstract-nft-service');

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

nftRoutes.post('/:mint/revive', authenticateJWT, async (req, res, next) => {
    try {
        const queriedNft = await nftService.getNft(req.params.mint);

        if (!queriedNft) {
            res.status(404);
            throw new Error('Nft not found');
        }

        if (queriedNft.UserWallet !== req.userInfo.wallet) {
            res.status(400);
            throw new Error("It's not your nft");
        }

        if (!queriedNft.isDead) {
            res.status(400);
            throw new Error('Nft is not dead');
        }

        const inventory = await inventoryService.getInventoryByWallet(
            req.userInfo.wallet
        );

        if (inventory.revivePotion === 0) {
            res.status(400);
            throw new Error('Not enough revive potion');
        }

        await inventoryService.updateInventory(
            { revivePotion: inventory.revivePotion - 1 },
            inventory.id
        );
        await nftService.updateNft({ isDead: false }, queriedNft.mint);

        res.json({ revived: true });
    } catch (err) {
        logger.error(
            `Couldn't revive nft: '${req.params.mint}' for user: '${req.userInfo.username}'`
        );
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
            const userWallet = req.userInfo.wallet;

            const queriedNfts = await nftService.getNftsByWallet(userWallet);

            let onChainNfts = await solanaService.getNfts(
                userWallet,
                queriedNfts.map((nft) => nft.mint)
            );
            onChainNfts = onChainNfts.map((nft) => ({
                mint: nft.mint,
                metaDataUri: nft.uri,
                symbol: nft.symbol,
                UserWallet: userWallet,
            }));

            const degodsStakedNfts = await degodsService.getStakedNfts(
                userWallet
            );

            const nfts = [...onChainNfts, ...degodsStakedNfts];

            const newNfts = [];
            for (let i = 0; i < nfts.length; i++) {
                const existingNft = await nftService.getNft(nfts[i].mint);
                if (existingNft) {
                    if (existingNft.UserWallet !== userWallet) {
                        const updatedNft = await nftService.updateNft(
                            { UserWallet: userWallet },
                            nfts[i].mint
                        );
                        newNfts.push(updatedNft);
                    }
                } else {
                    newNfts.push(await nftService.createNft(nfts[i]));
                }
            }

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
        // TODO: Check if this is needed at all....
        try {
            let storedNft = await nftService.getNft(req.params.mint);
            if (!storedNft) {
                throw new Error('Nft not in db');
            }
            const isOwner = await abstractNftService.verifyNftOwnership(
                req.params.mint,
                req.userInfo.wallet
            );
            const isUsable = await solanaService.verifyNftWhitelist(
                req.params.mint
            );
            if (
                storedNft &&
                storedNft.UserWallet === req.userInfo.wallet &&
                !isOwner
            ) {
                storedNft = await nftService.updateNft(
                    { UserWallet: null },
                    storedNft.mint
                );
            }

            res.json({
                isUsable: isOwner && isUsable,
                removedFromUser: storedNft.UserWallet === null,
            });
        } catch (err) {
            logger.error(
                `Could not verify nft '${req.params.mint}' for user: '${req.userInfo.username}'`
            );
            next(err);
        }
    }
);

module.exports = nftRoutes;

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
const { LAMPORTS_PER_SOL } = require('@solana/web3.js');
const transactionService = require('../services/transaction-service');

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

nftRoutes.post('/:mint/stake', authenticateJWT, async (req, res, next) => {
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

        if (queriedNft.isStaked) {
            res.status(400);
            throw new Error('Nft already staked');
        }

        if (queriedNft.symbol !== 'GG') {
            res.status(400);
            throw new Error('Only GloriousGeckos can be staked');
        }

        /*
        don't gather fee on staking

        if (await transactionService.getTransaction(req.body.txSignature)) {
            res.status(400);
            throw new Error('Transaction already processed');
        }


        const { verified, amountSent } = await solanaService.verifySolTransfer(
            req.body.txSignature,
            req.userInfo.wallet
        );

        await transactionService.createTransaction({
            signature: req.body.txSignature,
            UserWallet: req.userInfo.wallet,
            amount: amountSent,
            tokenMint: 'SOL',
        });

        const isFeePaid = verified && amountSent >= LAMPORTS_PER_SOL * 0.02;

        if (!isFeePaid) {
            res.status(400);
            throw new Error('Fee is not paid yet');
        }
        */

        await nftService.updateNft(
            { isStaked: true, stakingDaysLeft: 50 },
            queriedNft.mint
        );

        res.json({ staked: true });
    } catch (err) {
        logger.error(
            `Couldn't stake nft: '${req.params.mint}' for user: '${req.userInfo.username}'`
        );
        next(err);
    }
});

nftRoutes.post('/:mint/unstake', authenticateJWT, async (req, res, next) => {
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

        if (!queriedNft.isStaked) {
            res.status(400);
            throw new Error('Nft is not staked');
        }

        if (queriedNft.symbol !== 'GG') {
            res.status(400);
            throw new Error('Only GloriousGeckos can be unstaked');
        }

        /*
        don't gather fee on staking

        if (await transactionService.getTransaction(req.body.txSignature)) {
            res.status(400);
            throw new Error('Transaction already processed');
        }


        const { verified, amountSent } = await solanaService.verifySolTransfer(
            req.body.txSignature,
            req.userInfo.wallet
        );

        await transactionService.createTransaction({
            signature: req.body.txSignature,
            UserWallet: req.userInfo.wallet,
            amount: amountSent,
            tokenMint: 'SOL',
        });

        const isFeePaid = verified && amountSent >= LAMPORTS_PER_SOL * 0.02;

        if (!isFeePaid) {
            res.status(400);
            throw new Error('Fee is not paid yet');
        }
        */

        await nftService.updateNft(
            { isStaked: false, stakingDaysLeft: 50 },
            queriedNft.mint
        );

        res.json({ unstaked: true });
    } catch (err) {
        logger.error(
            `Couldn't unstake nft: '${req.params.mint}' for user: '${req.userInfo.username}'`
        );
        next(err);
    }
});

nftRoutes.post('/claim-reward', authenticateJWT, async (req, res, next) => {
    try {
        const { signature, mint } = req.body;
        const userWallet = req.userInfo.wallet;
        const nft = await nftService.getNft(mint);

        if (!nft.isStaked || nft.stakingDaysLeft > 0) {
            return res.status(400).json({
                success: false,
                errorMessage: 'Reward cannot be claimed',
            });
        }

        const { isFeePaid, errorMessage } =
            await transactionService.validateSolTx(
                signature,
                userWallet,
                0.025 * LAMPORTS_PER_SOL
            );

        if (!isFeePaid) {
            return res.status(400).json({ success: false, errorMessage });
        }

        await nftService.updateNft(
            {
                isStaked: false,
                stakingDaysLeft: 50,
                claimableStakingRewards: nft.claimableStakingRewards + 1,
            },
            mint
        );

        res.json({ success: true });
    } catch (err) {
        logger.error(`Error claiming staking reward`);
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

            let queriedNfts = await nftService.getNftsByWallet(userWallet);

            let onChainNfts = await solanaService.getNfts(userWallet);
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
                const currentNft = nfts[i];
                const nftIsOwnedInOurDB = queriedNfts.some(
                    (x) => x.mint === currentNft.mint
                );

                // If nft owned on chain and owned in db then do nothing
                // otherwise it's a new NFT in this wallet
                if (!nftIsOwnedInOurDB) {
                    const existingNft = await nftService.getNft(nfts[i].mint);
                    if (existingNft) {
                        // If it's stored in db for other user change ownership
                        if (existingNft.UserWallet !== userWallet) {
                            const updatedNft = await nftService.updateNft(
                                {
                                    UserWallet: userWallet,
                                    isStaked: false,
                                    stakingDaysLeft: 50,
                                },
                                nfts[i].mint
                            );
                            newNfts.push(updatedNft);
                        }
                        // owherwise add it to db
                    } else {
                        newNfts.push(await nftService.createNft(nfts[i]));
                    }
                }

                // remove nft mint from already owned nft list
                queriedNfts = queriedNfts.filter(
                    (x) => x.mint !== currentNft.mint
                );
            }

            // Remove those nfts from user that are not owned anymore
            for (let j = 0; j < queriedNfts.length; j++) {
                const updatedNft = await nftService.updateNft(
                    {
                        UserWallet: null,
                        isStaked: false,
                        stakingDaysLeft: 50,
                    },
                    queriedNfts[j].mint
                );
            }

            // TODO testit

            res.json({ newNfts, removedNfts: queriedNfts });
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
                    {
                        UserWallet: null,
                        isStaked: false,
                        stakingDaysLeft: 50,
                    },
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

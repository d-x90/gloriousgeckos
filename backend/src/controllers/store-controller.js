const { authenticateJWT } = require('../middlewares');
const storeService = require('../services/store-service');

const logger = require('../logger-factory').get('store-controller.js');
const storeRoutes = require('express').Router();

storeRoutes.post(
    '/buy-revive-potion',
    authenticateJWT,
    async (req, res, next) => {
        try {
            const { isSuccess } = await storeService.buyRevivePotion(
                req.userInfo.wallet
            );

            res.json({ isSuccess });
        } catch (err) {
            logger.error(
                `Error buying revive potion for user: '${req.userInfo.username}', reason: ${err.message}`
            );
            res.status(400);
            next(err);
        }
    }
);

module.exports = storeRoutes;

const { LAMPORTS_PER_SOL } = require('@solana/web3.js');
const { authenticateJWT } = require('../middlewares');
const transactionService = require('../services/transaction-service');
const userService = require('../services/user-service');
const contestRoutes = require('express').Router();
const logger = require('../logger-factory').get('contest-controller');

contestRoutes.post('/signUp', authenticateJWT, async (req, res, next) => {
    try {
        const { signature } = req.body;
        const userWallet = req.userInfo.wallet;
        const user = await userService.getUserByWallet(userWallet);
        if (user.isSignedUp) {
            return res.status(400).json({
                success: false,
                errorMessage: 'User already signed up for this contest',
            });
        }
        const { isFeePaid, errorMessage } =
            await transactionService.validateSolTx(
                signature,
                userWallet,
                0.05 * LAMPORTS_PER_SOL
            );

        if (!isFeePaid) {
            return res.status(400).json({ success: false, errorMessage });
        }

        await userService.updateUser({ isSignedUp: true }, userWallet);

        res.json({ success: true });
    } catch (err) {
        logger.error(`Error signing up user: '${req.userInfo.username}'`);
        next(err);
    }
});

contestRoutes.get('/leaderboard', async (req, res, next) => {
    try {
        const leaderboard = await userService.getLeaderboard();
        res.json({ leaderboard });
    } catch (err) {
        logger.error(`Error fetching the leaderboard`);
        next(err);
    }
});

module.exports = contestRoutes;

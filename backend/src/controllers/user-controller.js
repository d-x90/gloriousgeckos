const { authenticateJWT } = require('../middlewares');
const userService = require('../services/user-service');
const userRoutes = require('express').Router();
const logger = require('../logger-factory').get('user-controller');
const { mapUserToUserDto } = require('../mapper');

userRoutes.get('/own-user', authenticateJWT, async (req, res, next) => {
    try {
        const user = await userService.getUserByUsername(req.userInfo.username);
        if (user) {
            return res.json(mapUserToUserDto(user));
        }

        res.status(404);
        next(new Error('User not found'));
    } catch (err) {
        logger.error(`Couldn't get user: '${req.userInfo.username}'`);
        next(err);
    }
});

userRoutes.delete('/own-user', authenticateJWT, async (req, res, next) => {
    try {
        const numberOfUserDeleted = await userService.deleteUser(
            req.userInfo.username
        );

        if (numberOfUserDeleted === 1) {
            res.sendStatus(204);
        } else if (numberOfUserDeleted === 0) {
            res.status(404);
            next(new Error('User not found'));
        } else {
            next(new Error());
        }
    } catch (err) {
        logger.error(`Couldn't delete user: '${req.userInfo.username}'`);
        next(err);
    }
});

module.exports = userRoutes;

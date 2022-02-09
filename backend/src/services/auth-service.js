const jwt = require('jsonwebtoken');
const userService = require('./user-service');
const solService = require('./sol-service');
const logger = require('../logger-factory').get('auth-service');
const bcrypt = require('bcrypt');

const authService = {};

const { JWT_SIGN_KEY, JWT_EXPIRATION } = require('../config');

const createJwtForUser = (user) => {
    const payload = {
        id: user.id,
        username: user.username,
        wallet: user.wallet,
        role: user.role,
    };

    const token = jwt.sign({ ...payload }, JWT_SIGN_KEY, {
        expiresIn: JWT_EXPIRATION,
    });

    return token;
};

authService.register = async (newUser) => {
    if(!(await solService.checkIfWalletExists(newUser.wallet))) {
        const message = `Wallet: '${newUser.wallet}' does not exist on solana`;
        logger.info(message);
        throw new Error(message);
    }

    if (await userService.checkIfUserExistsByWallet(newUser.wallet)) {
        const message = `User with wallet: '${newUser.wallet}' already exists`;
        logger.info(message);
        throw new Error(message);
    }

    if (await userService.checkIfUserExistsByUsername(newUser.username)) {
        const message = `User with username: '${newUser.username}' already exists`;
        logger.info(message);
        throw new Error(message);
    }

    newUser.password = await bcrypt.hash(newUser.password, 10);

    const savedUser = await userService.createUser(newUser);
    const token = createJwtForUser(savedUser);
    const refreshToken = await userService.updateRefreshToken(savedUser.id);

    logger.info(`User with wallet '${savedUser.wallet}' created successfully.`);

    return { user: savedUser, token, refreshToken };
};

authService.login = async (usernameOrWallet, password) => {
    const user = await userService.getUserByUsernameOrWallet(usernameOrWallet);

    if (!user) {
        logger.info(`User not found. usernameOrWallet: '${usernameOrWallet}'`);
        throw new Error('User not found');
    }

    if (await bcrypt.compare(password, user.password)) {
        const token = createJwtForUser(user);
        const refreshToken = await userService.updateRefreshToken(user.id);
        logger.info(`JWT token created for user '${user.username}'.`);

        return { token, refreshToken };
    } else {
        logger.info(
            `Invalid credentials for usernameOrWallet: '${usernameOrWallet}'`
        );
        throw new Error('Invalid credentials');
    }
};

authService.refreshJwt = async (refreshToken) => {
    const user = await userService.getUserByRefreshToken(refreshToken);

    if (!user) {
        logger.info(`User not found. Refresh token: '${refreshToken}'`);
        throw new Error('Invalid Refresh token');
    }

    const token = createJwtForUser(user);
    const newRefreshToken = await userService.updateRefreshToken(user.id);
    logger.info(`JWT token created for user '${user.username}'.`);

    return { token, newRefreshToken };
};

authService.revokeJwt = async (userId) => {
    try {
        const jwtValidAfter = await userService.revokeJwtForUser(userId);

        logger.info(
            `JWT token revoked for user with id: '${userId}' at ${jwtValidAfter}.`
        );
    } catch (e) {
        logger.error(`JWT revoke failed for user with id: ${userId}`);
        throw new Error('JWT revoke failed');
    }
};

module.exports = authService;

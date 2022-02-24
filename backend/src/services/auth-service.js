const jwt = require('jsonwebtoken');
const userService = require('./user-service');
const solanaService = require('./solana-service');
const logger = require('../logger-factory').get('auth-service');
const bcrypt = require('bcrypt');

const authService = {};

const { JWT_SIGN_KEY, JWT_EXPIRATION } = require('../config');
const { USER_ROLES } = require('../enums');
const nftService = require('./nft-service');

const createJwtForUser = (user) => {
    const payload = {
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
    if (
        !(await solanaService.verifyWallet(newUser.wallet, newUser.signature))
    ) {
        const message = `User: '${newUser.username}' could not verify ownership for wallet: '${newUser.wallet}'`;
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

    const crawledNftsPromise = solanaService.getNfts(newUser.wallet);

    newUser.password = await bcrypt.hash(newUser.password, 10);

    // "disable" this feature for now
    newUser.role = USER_ROLES.USER;

    const savedUser = await userService.createUser(newUser);
    const token = createJwtForUser(savedUser);
    const refreshToken = await userService.updateRefreshToken(
        savedUser.username
    );

    const crawledNfts = await crawledNftsPromise;
    const nfts = crawledNfts.map((nft) => ({
        mint: nft.mint,
        metaDataUri: nft.uri,
        symbol: nft.symbol,
        UserWallet: newUser.wallet,
    }));

    const usersNfts = await nftService.createManyNft(nfts);

    logger.info(`User with wallet '${savedUser.wallet}' created successfully.`);

    return { user: savedUser, token, refreshToken, nfts: usersNfts };
};

authService.login = async (usernameOrWallet, password) => {
    const user = await userService.getUserByUsernameOrWallet(usernameOrWallet);

    if (!user) {
        logger.info(`User not found. usernameOrWallet: '${usernameOrWallet}'`);
        throw new Error('Invalid credentials');
    }

    if (await bcrypt.compare(password, user.password)) {
        const token = createJwtForUser(user);
        const refreshToken = await userService.updateRefreshToken(
            user.username
        );
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
    const newRefreshToken = await userService.updateRefreshToken(user.username);
    logger.info(`JWT token created for user '${user.username}'.`);

    return { token, newRefreshToken };
};

authService.revokeJwt = async (username) => {
    try {
        const jwtValidAfter = await userService.revokeJwtForUser(username);

        logger.info(
            `JWT token revoked for user: '${username}' at ${jwtValidAfter}.`
        );
    } catch (e) {
        logger.error(`JWT revoke failed for user: ${username}`);
        throw new Error('JWT revoke failed');
    }
};

module.exports = authService;

const User = require('../models/user');
const { Op } = require('sequelize');
const uuid = require('uuid');
const logger = require('../logger-factory').get('./user-service.js');

const userService = {};

userService.createUser = (user) => {
    return User.create(user);
};

userService.getUserByWallet = (wallet) => {
    return User.findOne({ where: { wallet } });
};

userService.getUserByUsername = (username) => {
    return User.findOne({ where: { username } });
};

userService.getUserByUsernameOrWallet = (usernameOrWallet) => {
    return User.findOne({
        where: {
            [Op.or]: {
                username: usernameOrWallet,
                wallet: usernameOrWallet,
            },
        },
    });
};

userService.getJwtValidAfterDateByUsername = async (username) => {
    const result = await User.findOne({
        attributes: ['jwtValidAfter'],
        where: {
            username: username,
        },
    });

    if (!result) {
        throw new Error('User not found');
    }

    return result.jwtValidAfter;
};

userService.getUserByRefreshToken = (refreshToken) => {
    return User.findOne({
        where: {
            refreshToken,
        },
    });
};

userService.updateUser = (user) => {
    return User.update(user, {
        where: {
            username: user.username,
        },
    });
};

userService.updateRefreshToken = async (username) => {
    const refreshToken = uuid.v4();

    await User.update(
        { refreshToken },
        {
            where: {
                username: username,
            },
        }
    );

    return refreshToken;
};

userService.revokeJwtForUser = async (username) => {
    const jwtValidAfter = Date.now();
    const refreshToken = uuid.v4();

    const [rowsUpdated] = await User.update(
        { jwtValidAfter, refreshToken },
        {
            where: {
                username: username,
            },
        }
    );

    if (rowsUpdated !== 1) {
        throw new Error('Update failed');
    }

    return jwtValidAfter;
};

userService.deleteUser = (username) => {
    return User.destroy({
        where: {
            username: username,
        },
    });
};

userService.checkIfUserExistsByWallet = async (wallet) => {
    const count = await User.count({
        where: {
            wallet,
        },
    });

    return count > 0;
};

userService.checkIfUserExistsByUsername = async (username) => {
    const count = await User.count({
        where: {
            username,
        },
    });

    return count > 0;
};

module.exports = userService;

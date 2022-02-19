const mapper = {};

mapper.mapUserToUserDto = (user) => {
    return {
        wallet: user.wallet,
        username: user.username,
        role: user.role,
        createdAt: user.createdAt,
    };
};

module.exports = mapper;

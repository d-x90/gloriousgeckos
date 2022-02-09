const mapper = {};

mapper.mapUserToUserDto = (user) => {
    return {
        id: user.id,
        wallet: user.wallet,
        username: user.username,
        role: user.role,
        createdAt: user.createdAt,
    };
};

module.exports = mapper;

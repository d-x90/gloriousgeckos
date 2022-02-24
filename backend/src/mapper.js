const mapper = {};

mapper.InventoryToInventoryDto = (inventory) => {
    return {
        revivePotion: inventory.revivePotion,
    };
};

mapper.mapUserToUserDto = (user) => {
    return {
        wallet: user.wallet,
        username: user.username,
        role: user.role,
        balance: user.balance,
        inventory: mapper.InventoryToInventoryDto(user.Inventory),
        createdAt: user.createdAt,
    };
};

module.exports = mapper;

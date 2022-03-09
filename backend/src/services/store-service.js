const inventoryService = require('./inventory-service');
const userService = require('./user-service');

const storeService = {};

const PRICE_LIST = {
    REVIVE_POTION: 100,
};

storeService.buyRevivePotion = async (wallet) => {
    let user = await userService.getUserByWallet(wallet);

    if (!user) {
        throw new Error('User not found');
    }

    if (user.balance < PRICE_LIST.REVIVE_POTION) {
        throw new Error('Insufficient balance');
    }

    user = await userService.updateUser(
        { balance: user.balance - PRICE_LIST.REVIVE_POTION },
        wallet
    );

    let inventory = await inventoryService.getInventoryByWallet(wallet);
    inventory = await inventoryService.updateInventoryByWallet(
        { revivePotion: inventory.revivePotion + 1 },
        wallet
    );

    return { isSuccess: true };
};

module.exports = storeService;

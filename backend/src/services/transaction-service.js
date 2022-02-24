const Transaction = require('../models/transaction');
const logger = require('../logger-factory').get('./transaction-service.js');

const transactionService = {};

transactionService.createTransaction = async ({
    signature,
    UserWallet,
    amount,
    tokenMint,
}) => {
    const transaction = { signature, UserWallet, amount, tokenMint };
    const createdTransaction = await Transaction.create(transaction);
    return createdTransaction;
};

transactionService.getTransaction = (signature) => {
    return Transaction.findOne({ where: { signature } });
};

module.exports = transactionService;

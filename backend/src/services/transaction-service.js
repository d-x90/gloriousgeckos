const Transaction = require('../models/transaction');
const solanaService = require('./solana-service');
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

transactionService.getTransaction = async (signature) => {
    return await Transaction.findOne({ where: { signature } });
};

transactionService.validateSolTx = async (
    signature,
    wallet,
    solAmountInLamports
) => {
    let errorMessage;
    let isFeePaid = false;

    if (await transactionService.getTransaction(signature)) {
        errorMessage = 'Transaction already processed';
        return { isFeePaid, errorMessage };
    }

    const { verified, amountSent } = await solanaService.verifySolTransfer(
        signature,
        wallet
    );

    await transactionService.createTransaction({
        signature: signature,
        UserWallet: wallet,
        amount: amountSent,
        tokenMint: 'SOL',
    });

    isFeePaid = verified && amountSent >= solAmountInLamports;

    if (!isFeePaid) {
        errorMessage = 'Fee is not paid yet';
    }

    return { isFeePaid, errorMessage };
};

module.exports = transactionService;

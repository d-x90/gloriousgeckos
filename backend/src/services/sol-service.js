const logger = require('../logger-factory').get('./sol-service.js');
const web3 = require('@solana/web3.js');
const splToken = require('@solana/spl-token');
const { SOLANA_NETWORK } = require('../config');
var nacl = require('tweetnacl');
nacl.util = require('tweetnacl-util');

// Connect to cluster
const connection = new web3.Connection(
    web3.clusterApiUrl(SOLANA_NETWORK),
    'confirmed'
);

const solService = {};

const getPublicKey = (wallet) => {
    return new web3.PublicKey(wallet);
};

/*
FRONTEND CODE PART

const signMessage = async (s) => {
    const encodedMessage = new TextEncoder().encode(s);
    let { signature } = await window.solana.signMessage(encodedMessage, "utf-8")
    signature = Array.from(signature);
    return signature;
}
*/

solService.verifyWallet = async (wallet, signature) => {
    try {
        console.log(typeof signature);
        signature = new Uint8Array(JSON.parse(signature));
        const isVerified = nacl.sign.detached.verify(
            nacl.util.decodeUTF8('hello'),
            signature,
            getPublicKey(wallet).toBytes()
        );

        return isVerified;
    } catch (e) {
        logger.error(e);
        return false;
    }
};

solService.verifyNftOwnership = async (tokenAddress, wallet) => {
    let response = await connection.getTokenLargestAccounts(
        getPublicKey(tokenAddress)
    );
    const owningTokenAccount = response.value[0].address;

    response = await connection.getParsedAccountInfo(
        getPublicKey(owningTokenAccount)
    );

    const tokenOwner = response.value.data.parsed.info.owner;

    return tokenOwner === wallet;
};

module.exports = solService;

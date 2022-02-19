const logger = require('../logger-factory').get('./solana-service.js');
const web3 = require('@solana/web3.js');
const { PublicKey } = web3;
const splToken = require('@solana/spl-token');
const { SOLANA_NETWORK_NODE } = require('../config');
const { Metadata } = require('@metaplex-foundation/mpl-token-metadata');
var nacl = require('tweetnacl');
const { limitUsageAtOnce } = require('../decorators');
nacl.util = require('tweetnacl-util');

const RATE_LIMIT_PER_SEC = 10;

const NFT_WHITELIST = {
    F9xNaaCgUrznEkRABCrsyvVjCvMgnCTniqDRCfAw4h4V: 'GloriousGeckos', // "updateAuthority" field
};

const TOKEN_PROGRAM_ID = new PublicKey(
    'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'
);

// Connect to cluster
const connection = new web3.Connection(
    //web3.clusterApiUrl('mainnet-beta'),
    SOLANA_NETWORK_NODE,
    'confirmed'
);

const solanaService = {};
/*
FRONTEND CODE PART

const signMessage = async (s) => {
    const encodedMessage = new TextEncoder().encode(s);
    let { signature } = await window.solana.signMessage(encodedMessage, "utf-8")
    signature = Array.from(signature);
    return signature;
}
*/

solanaService.verifyWallet = async (wallet, signature) => {
    try {
        console.log(typeof signature);
        signature = new Uint8Array(JSON.parse(signature));
        const isVerified = nacl.sign.detached.verify(
            nacl.util.decodeUTF8('I am the owner of this wallet'),
            signature,
            new PublicKey(wallet).toBytes()
        );

        return isVerified;
    } catch (e) {
        logger.error(e);
        return false;
    }
};

solanaService.getTokenAccounts = limitUsageAtOnce(async (wallet) => {
    const accounts = await connection.getParsedProgramAccounts(
        TOKEN_PROGRAM_ID,
        {
            filters: [
                {
                    dataSize: 165, // number of bytes
                },
                {
                    memcmp: {
                        offset: 32, // number of bytes
                        bytes: wallet, // base58 encoded string
                    },
                },
            ],
        }
    );

    return accounts;
}, RATE_LIMIT_PER_SEC);

solanaService.verifyNftOwnership = limitUsageAtOnce(async (mint, wallet) => {
    const accounts = await connection.getParsedProgramAccounts(
        TOKEN_PROGRAM_ID,
        {
            filters: [
                {
                    dataSize: 165,
                },
                {
                    memcmp: {
                        offset: 32,
                        bytes: wallet,
                    },
                },
            ],
        }
    );

    return accounts.some(
        (tokenAccount) =>
            tokenAccount.account.data.parsed.info.mint === mint &&
            tokenAccount.account.data.parsed.info.owner === wallet &&
            tokenAccount.account.data.parsed.info.tokenAmount.amount === '1'
    );
}, RATE_LIMIT_PER_SEC);

solanaService.verifyNftWhitelist = limitUsageAtOnce(async (mint) => {
    const metadataPDA = await Metadata.getPDA(new PublicKey(mint));
    const tokenMetadata = await Metadata.load(connection, metadataPDA);

    return Object.keys(NFT_WHITELIST).includes(
        tokenMetadata.data.updateAuthority
    );
}, RATE_LIMIT_PER_SEC / 2);

// CAUTION: lot of solana api calls..
solanaService.getNfts = limitUsageAtOnce(async (wallet) => {
    const accounts = await connection.getParsedProgramAccounts(
        TOKEN_PROGRAM_ID,
        {
            filters: [
                {
                    dataSize: 165,
                },
                {
                    memcmp: {
                        offset: 32,
                        bytes: wallet,
                    },
                },
            ],
        }
    );

    const nftAddresses = accounts
        .filter((i) => i.account.data.parsed.info.tokenAmount.amount === '1')
        .map((i) => i.account.data.parsed.info.mint);

    const promises = nftAddresses.map(async (address) => {
        const metadataPDA = await Metadata.getPDA(new PublicKey(address));
        const tokenMetadata = await Metadata.load(connection, metadataPDA);
        return tokenMetadata.data;
    });

    const settledPromises = await Promise.allSettled(promises);
    const nfts = settledPromises
        .filter((settledPromise) =>
            Object.keys(NFT_WHITELIST).includes(
                settledPromise.value.updateAuthority
            )
        )
        .map((settledPromise) => ({
            mint: settledPromise.value.mint,
            uri: settledPromise.value.data.uri,
            symbol: settledPromise.value.data.symbol,
        }));

    return nfts;
}, 1);

module.exports = solanaService;

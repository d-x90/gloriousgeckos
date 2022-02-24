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

const ourTokenAccountForGlory = '';
const ourTokenAccountForDust = '';
const GLORY_TOKEN_MINT = '';
const DUST_TOKEN_MINT = '';

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

solanaService.verifyNft = limitUsageAtOnce(async (mint, wallet) => {
    const isOwner = await solanaService.verifyNftOwnership(mint, wallet);
    const isUsable = await solanaService.verifyNftWhitelist(mint);

    return isOwner && isUsable;
}, RATE_LIMIT_PER_SEC / 2);

solanaService.verifyTokenTransfer = limitUsageAtOnce(
    async (txSignature, wallet) => {
        const response = await connection.getParsedTransaction(txSignature);

        const senderWallet =
            response.transaction.message.instructions.parsed.info.authority;
        const tokenMint =
            response.transaction.message.instructions.parsed.info.mint;
        const destinationTokenAccount =
            response.transaction.message.instructions.parsed.info.destination;
        const amountSent =
            response.transaction.message.instructions.parsed.info.tokenAmount
                .uiAmount;

        let verified = true;
        let isGlory = tokenMint === GLORY_TOKEN_MINT;
        let isDust = tokenMint === DUST_TOKEN_MINT;
        if (senderWallet !== wallet) {
            verified = false;
        }

        if (isGlory) {
            if (destinationTokenAccount !== ourTokenAccountForGlory) {
                verified = false;
            }
        } else if (isDust) {
            if (destinationTokenAccount !== ourTokenAccountForDust) {
                verified = false;
            }
        } else {
            verified = false;
        }

        return { verified, amountSent, isGlory, isDust };
    },
    RATE_LIMIT_PER_SEC
);

// CAUTION: lot of solana api calls..
solanaService.getNfts = limitUsageAtOnce(
    async (wallet, dontCheckTheseMints = []) => {
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

        await Promise.waitFor(250);

        const nftAddresses = accounts
            .filter(
                (i) => i.account.data.parsed.info.tokenAmount.amount === '1'
            )
            .map((i) => i.account.data.parsed.info.mint);

        const filteredNftAddresses = nftAddresses.filter(
            (mint) => !dontCheckTheseMints.includes(mint)
        );

        const nftResponses = [];

        for (let i = 0; i < filteredNftAddresses.length; i++) {
            const metadataPDA = await Metadata.getPDA(
                new PublicKey(filteredNftAddresses[i])
            );
            const tokenMetadata = await Metadata.load(connection, metadataPDA);
            nftResponses.push(tokenMetadata.data);
            await Promise.waitFor(250);
        }

        const nfts = nftResponses
            .filter((nftResponse) =>
                Object.keys(NFT_WHITELIST).includes(nftResponse.updateAuthority)
            )
            .map((nftResponse) => ({
                mint: nftResponse.mint,
                uri: nftResponse.data.uri,
                symbol: nftResponse.data.symbol,
            }));

        return nfts;
    },
    1
);

module.exports = solanaService;

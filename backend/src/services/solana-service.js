const logger = require('../logger-factory').get('./solana-service.js');
const web3 = require('@solana/web3.js');
const { PublicKey } = web3;
const splToken = require('@solana/spl-token');
const { SOLANA_NETWORK_NODE } = require('../config');
const { Metadata } = require('@metaplex-foundation/mpl-token-metadata');
var nacl = require('tweetnacl');
nacl.util = require('tweetnacl-util');

const NFT_WHITELIST = {
    AouX7hQB9d6BSwp96upmAjNiEfTbq7LWVnq1p66Vdi7Z: 'GloriousGeckos', // // CandyMachine id
    '8RMqBV79p8sb51nMaKMWR94XKjUvD2kuUSAkpEJTmxyx': 'DeGods_1', // CandyMachine id
    '9MynErYQ5Qi6obp4YwwdoDmXkZ1hYVtPUqYmJJ3rZ9Kn': 'DeGods_2', // CandyMachine id
};

const ourTokenAccountForGlory = '';
const ourTokenAccountForDust = '';
const GLORY_TOKEN_MINT = '';
const DUST_TOKEN_MINT = '';

const TOKEN_PROGRAM_ID = new PublicKey(
    'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'
);

const connectionPool = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => ({
    isBeingUsed: false,
    connection: new web3.Connection(
        //web3.clusterApiUrl('mainnet-beta'),
        SOLANA_NETWORK_NODE,
        'confirmed'
    ),
}));

function getConnection() {
    const connection = connectionPool.find((c) => c.isBeingUsed === false);
    if (connection) {
        connection.isBeingUsed = true;
        return connection;
    }

    return connectionPool[0];
}

// Connect to cluster
// const connection = new web3.Connection(
//     //web3.clusterApiUrl('mainnet-beta'),
//     SOLANA_NETWORK_NODE,
//     'confirmed'
// );

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

solanaService.getTokenAccounts = async (wallet) => {
    const connection = getConnection();
    try {
        const accounts = await connection.connection.getParsedProgramAccounts(
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
    } catch (error) {
        throw error;
    } finally {
        connection.isBeingUsed = false;
    }
};

solanaService.verifyNftOwnership = async (mint, wallet) => {
    const connection = getConnection();
    try {
        const accounts = await connection.connection.getParsedProgramAccounts(
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
    } catch (error) {
        throw error;
    } finally {
        connection.isBeingUsed = false;
    }
};

solanaService.verifyNftWhitelist = async (mint) => {
    const connection = getConnection();
    try {
        const metadataPDA = await Metadata.getPDA(new PublicKey(mint));
        const tokenMetadata = await Metadata.load(
            connection.connection,
            metadataPDA
        );

        return tokenMetadata.data.data.creators.some((x) =>
            Object.keys(NFT_WHITELIST).includes(x.address)
        );
    } catch (error) {
        throw error;
    } finally {
        connection.isBeingUsed = false;
    }
};

solanaService.verifyNft = async (mint, wallet) => {
    const isOwner = await solanaService.verifyNftOwnership(mint, wallet);
    const isUsable = await solanaService.verifyNftWhitelist(mint);

    return isOwner && isUsable;
};

solanaService.verifyTokenTransfer = async (txSignature, wallet) => {
    const connection = getConnection();
    try {
        const response = await connection.connection.getParsedTransaction(
            txSignature
        );

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
    } catch (error) {
        throw error;
    } finally {
        connection.isBeingUsed = false;
    }
};

// CAUTION: lot of solana api calls..
solanaService.getNfts = async (wallet, dontCheckTheseMints = []) => {
    const connection = getConnection();

    try {
        const accounts = await connection.connection.getParsedProgramAccounts(
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
            try {
                const metadataPDA = await Metadata.getPDA(
                    new PublicKey(filteredNftAddresses[i])
                );
                const tokenMetadata = await Metadata.load(
                    connection.connection,
                    metadataPDA
                );
                nftResponses.push(tokenMetadata.data);
            } catch (error) {
                logger.info(
                    "Tricky non-NFT account with amount of 1: '" +
                        filteredNftAddresses[i] +
                        "'"
                );
            } finally {
                await Promise.waitFor(250);
            }
        }

        const nfts = nftResponses
            .filter((nftResponse) =>
                nftResponse.data.creators.some((x) =>
                    Object.keys(NFT_WHITELIST).includes(x.address)
                )
            )
            .map((nftResponse) => ({
                mint: nftResponse.mint,
                uri: nftResponse.data.uri,
                symbol: nftResponse.data.symbol,
            }));

        return nfts;
    } catch (error) {
        throw error;
    } finally {
        connection.isBeingUsed = false;
    }
};

module.exports = solanaService;

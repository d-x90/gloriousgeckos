// @ts-nocheck

import { Metadata } from '@metaplex-foundation/mpl-token-metadata';
import { clusterApiUrl, Connection, PublicKey } from '@solana/web3.js';

// Connect to cluster
const connection = new Connection(clusterApiUrl('mainnet-beta'), 'confirmed');

const NFT_WHITELIST = {
  F9xNaaCgUrznEkRABCrsyvVjCvMgnCTniqDRCfAw4h4V: 'GloriousGeckos',
};

const TOKEN_PROGRAM_ID = new PublicKey(
  'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'
);

export const getUsableNfts = async (wallet: string) => {
  const accounts = await connection.getParsedProgramAccounts(TOKEN_PROGRAM_ID, {
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
  });

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
      Object.keys(NFT_WHITELIST).includes(settledPromise.value.updateAuthority)
    )
    .map((settledPromise) => ({
      mint: settledPromise.value.mint,
      uri: settledPromise.value.data.uri,
      symbol: settledPromise.value.data.symbol,
    }));

  return nfts;
};

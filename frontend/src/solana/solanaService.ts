// @ts-nocheck

import { Metadata } from '@metaplex-foundation/mpl-token-metadata';
import { WalletContextState } from '@solana/wallet-adapter-react';
import {
  clusterApiUrl,
  Connection,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
} from '@solana/web3.js';
import { toast } from 'react-toastify';

// Connect to cluster
const connection = new Connection(clusterApiUrl('mainnet-beta'), 'confirmed');

const GGWallet = '5wDX8A9KE4AXdChseJ1LWkRrtekniNLZ1QY8BsMdKcyS';

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

export async function setPayerAndBlockhashTransaction(
  publicKey: PublicKey,
  instructions: TransactionInstruction[]
) {
  const transaction = new Transaction();
  instructions.forEach((element) => {
    transaction.add(element);
  });
  transaction.feePayer = publicKey;
  const hash = await connection.getLatestBlockhash();
  transaction.recentBlockhash = hash.blockhash;
  return transaction;
}

export async function sendSolToWallet(wallet: WalletContextState, sol: number) {
  if (!wallet.connected) {
    toast.error('Wallet not connected');
    return null;
  }

  const transferSol = SystemProgram.transfer({
    fromPubkey: wallet.publicKey,
    toPubkey: new PublicKey(GGWallet),
    lamports: LAMPORTS_PER_SOL * sol,
  });

  let transaction = await setPayerAndBlockhashTransaction(wallet.publicKey, [
    transferSol,
  ]);

  let signature;
  try {
    signature = await wallet.sendTransaction(transaction);
  } catch (e) {
    return null;
  }

  toast.info('Transaction sent..');
  toast.info('Waiting..');

  await connection.confirmTransaction(signature);

  toast.info('Transaction successfull');

  return signature;
}

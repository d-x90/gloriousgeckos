import axios from 'axios';
import { Nft } from '../requests/authenticated/nfts/useNft';
import { getUsableNfts } from '../solana/solanaService';

export const getCleanedUsableNfts = async (wallet: string) => {
  const nfts = await getUsableNfts(wallet);

  const settledPromises = await Promise.allSettled(
    nfts.map(async (nft) => {
      const { data: nftMetadata } = await axios.get(nft.uri);
      return {
        mint: nft.mint,
        symbol: nft.symbol,
        image: nftMetadata.image,
        name: nftMetadata.name,
        attributes: nftMetadata.attributes,
      } as Nft;
    })
  );

  return settledPromises.map((settledPromise) =>
    settledPromise.status === 'fulfilled'
      ? settledPromise.value
      : {
          mint: 'rejected',
          symbol: '',
          image: '',
          name: '',
          attributes: [],
        }
  );
};

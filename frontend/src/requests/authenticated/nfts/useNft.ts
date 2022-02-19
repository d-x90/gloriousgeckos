import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../../../contexts/authContext';
import { getCleanedUsableNfts } from '../../../services/nftService';
import { verifyNft } from './nftRequests';

export type Attribute = {};

export type Nft = {
  mint: string;
  symbol: string;
  image: string;
  name: string;
  attributes: Attribute[];
};

const useNft = () => {
  const { authenticatedApiCall, userInfo } = useAuth();
  const [nfts, setNfts] = useState<Nft[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const checkIfNftIsUsable = useCallback(
    async (mint: string) => {
      return await authenticatedApiCall(verifyNft, mint);
    },
    [authenticatedApiCall]
  );

  useEffect(() => {
    (async () => {
      console.log({ userInfo });
      if (userInfo?.wallet) {
        const nfts = await getCleanedUsableNfts(userInfo?.wallet);
        setNfts(nfts);
        setIsLoading(false);
      }
    })();
  }, [userInfo]);

  return {
    nfts,
    checkIfNftIsUsable,
    isLoading,
  };
};

export default useNft;

import axios from 'axios';
import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../../../contexts/authContext';
import { getCleanedUsableNfts } from '../../../services/nftService';
import { getNfts, requestCheckForNewNfts, verifyNft } from './nftRequests';

export type Attribute = {
  trait_type: string;
  value: string;
};

export type NftDto = {
  mint: string;
  UserWallet: string;
  isDead: boolean;
  score: number;
  dailyLimit: number;
  cooldownStartedAt: number | null;
  symbol: string | null;
  metaDataUri: string | null;
};

export type Nft = {
  mint: string;
  UserWallet: string;
  isDead: boolean;
  score: number;
  dailyLimit: number;
  cooldownStartedAt: number | null;
  symbol: string | null;
  metaDataUri: string | null;
  image: string;
  name: string;
  attributes: Attribute[];
};

const useNft = () => {
  const { authenticatedApiCall, userInfo } = useAuth();
  const [nfts, setNfts] = useState<Nft[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const checkForNewNfts = useCallback(async () => {
    const newNfts = await authenticatedApiCall(requestCheckForNewNfts);
    setNfts([...nfts, ...newNfts]);
  }, [authenticatedApiCall, nfts]);

  const checkIfNftIsUsable = useCallback(
    async (mint: string) => {
      return await authenticatedApiCall(verifyNft, mint);
    },
    [authenticatedApiCall]
  );

  useEffect(() => {
    (async () => {
      if (userInfo?.wallet) {
        const nfts = await authenticatedApiCall(getNfts);

        setNfts(nfts);
        setIsLoading(false);
      }
    })();
  }, [authenticatedApiCall, userInfo]);

  return {
    nfts,
    checkIfNftIsUsable,
    isLoading,
    checkForNewNfts,
  };
};

export default useNft;

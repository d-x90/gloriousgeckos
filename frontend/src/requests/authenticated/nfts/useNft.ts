import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../../../contexts/authContext';
import { useLoading } from '../../../contexts/loadingContext';
import {
  getNfts,
  requestCheckForNewNfts,
  requestReviveNft,
  requestStakeNft,
  requestUnstakeNft,
  verifyNft,
} from './nftRequests';

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
  isOnCooldown: boolean;
  symbol: string | null;
  metaDataUri: string | null;
};

export type Nft = {
  mint: string;
  UserWallet: string;
  isDead: boolean;
  score: number;
  dailyLimit: number;
  isOnCooldown: boolean;
  symbol: string | null;
  metaDataUri: string | null;
  image: string;
  name: string;
  isStaked: boolean;
  stakingDaysLeft: number;
  claimableStakingRewards: number;
  claimedStakingRewards: number;
  attributes: Attribute[];
};

const useNft = () => {
  const [nfts, setNfts] = useState<Nft[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const { decreaseLoadingCount, increaseLoadingCount } = useLoading();
  const { authenticatedApiCall, isAuthenticated } = useAuth();

  const checkForNewNfts = useCallback(async () => {
    increaseLoadingCount(1);
    const { newNfts, removedNfts } = await authenticatedApiCall(
      requestCheckForNewNfts
    );
    setNfts([
      ...nfts.filter((x) => !removedNfts.some((y: Nft) => x.mint === y.mint)),
      ...newNfts,
    ]);
    decreaseLoadingCount(1);
  }, [authenticatedApiCall, decreaseLoadingCount, increaseLoadingCount, nfts]);

  const checkIfNftIsUsable = useCallback(
    async (mint: string) => {
      increaseLoadingCount(1);
      const response = await authenticatedApiCall(verifyNft, mint);
      decreaseLoadingCount(1);
      return response;
    },
    [authenticatedApiCall, decreaseLoadingCount, increaseLoadingCount]
  );

  const reviveNft = useCallback(
    async (mint: string) => {
      increaseLoadingCount(1);
      const response = await authenticatedApiCall(requestReviveNft, mint);
      decreaseLoadingCount(1);
      return response;
    },
    [authenticatedApiCall, decreaseLoadingCount, increaseLoadingCount]
  );

  const stakeNft = useCallback(
    async (mint: string) => {
      increaseLoadingCount(1);
      const response = await authenticatedApiCall(requestStakeNft, mint);
      decreaseLoadingCount(1);
      return response;
    },
    [authenticatedApiCall, decreaseLoadingCount, increaseLoadingCount]
  );

  const unstakeNft = useCallback(
    async (mint: string) => {
      increaseLoadingCount(1);
      const response = await authenticatedApiCall(requestUnstakeNft, mint);
      decreaseLoadingCount(1);
      return response;
    },
    [authenticatedApiCall, decreaseLoadingCount, increaseLoadingCount]
  );

  useEffect(() => {
    (async () => {
      if (isAuthenticated) {
        increaseLoadingCount(1);
        const nfts = await authenticatedApiCall(getNfts);
        setNfts(nfts);
        decreaseLoadingCount(1);
        setIsLoading(false);
      }
    })();
  }, [
    authenticatedApiCall,
    decreaseLoadingCount,
    increaseLoadingCount,
    isAuthenticated,
  ]);

  return {
    nfts,
    setNfts,
    checkIfNftIsUsable,
    reviveNft,
    isLoading,
    checkForNewNfts,
    stakeNft,
    unstakeNft,
  };
};

export default useNft;

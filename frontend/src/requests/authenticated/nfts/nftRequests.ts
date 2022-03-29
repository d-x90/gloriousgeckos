import axios from 'axios';
import { Nft, NftDto } from './useNft';

const basePath = '/api/v1/nft';

export const verifyNft = async (mint: string, jwt: string) => {
  const response = await axios.get<{ isUsable: boolean }>(
    `${basePath}/${mint}/verify`,
    {
      headers: {
        Authorization: 'Bearer ' + jwt,
      },
    }
  );
  return response.data;
};

export const requestReviveNft = async (mint: string, jwt: string) => {
  const response = await axios.post<{ revived: boolean; message?: string }>(
    `${basePath}/${mint}/revive`,
    null,
    {
      headers: {
        Authorization: 'Bearer ' + jwt,
      },
    }
  );

  return response.data;
};

export const requestStakeNft = async (mint: string, jwt: string) => {
  const response = await axios.post<{ staked: boolean; message?: string }>(
    `${basePath}/${mint}/stake`,
    null,
    {
      headers: {
        Authorization: 'Bearer ' + jwt,
      },
    }
  );

  return response.data;
};

export const requestUnstakeNft = async (mint: string, jwt: string) => {
  const response = await axios.post<{ unstaked: boolean; message?: string }>(
    `${basePath}/${mint}/unstake`,
    null,
    {
      headers: {
        Authorization: 'Bearer ' + jwt,
      },
    }
  );

  return response.data;
};

const decorateNfts = async (nfts: NftDto[]) => {
  const decorationPromises = [];
  for (let i = 0; i < nfts.length; i++) {
    let storedNft = nfts[i] as NftDto;
    if (storedNft.metaDataUri) {
      decorationPromises.push(
        axios.get(storedNft.metaDataUri).then((response) => {
          const nftMetadata = response.data;
          (storedNft as Nft).image = nftMetadata.image;
          (storedNft as Nft).name = nftMetadata.name;
          (storedNft as Nft).attributes = nftMetadata.attributes;

          return storedNft as Nft;
        })
      );
    }
  }

  await Promise.allSettled(decorationPromises);

  return nfts;
};

export const getNft = async (mint: string) => {
  const response = await axios.get<NftDto>(`${basePath}/${mint}`);
  return response.data;
};

export const getNfts = async (jwt: string) => {
  const response = await axios.get<{ nfts: NftDto[] }>(`${basePath}/all`, {
    headers: {
      Authorization: 'Bearer ' + jwt,
    },
  });
  const { nfts: storedNfts } = response.data;

  return await decorateNfts(storedNfts);
};

export const requestCheckForNewNfts = async (jwt: string) => {
  try {
    const response = await axios.post<{
      newNfts: NftDto[];
      removedNfts: NftDto[];
    }>(`${basePath}/check-for-new-nfts`, null, {
      headers: {
        Authorization: 'Bearer ' + jwt,
      },
    });

    const { newNfts, removedNfts } = response.data;

    const decoratedNewNfts = await decorateNfts(newNfts);
    const decoratedRemovedNfts = await decorateNfts(removedNfts);

    return { newNfts: decoratedNewNfts, removedNfts: decoratedRemovedNfts };
  } catch (error) {
    console.log({ message: 'big error', error });
  }
};

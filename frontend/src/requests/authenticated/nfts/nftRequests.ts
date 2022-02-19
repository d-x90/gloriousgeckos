import axios from 'axios';

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

export const getNftInfo = async (mint: string, jwt: string) => {
  const response = await axios.get<{ isUsable: boolean }>(
    `${basePath}/${mint}/info`,
    {
      headers: {
        Authorization: 'Bearer ' + jwt,
      },
    }
  );
  return response.data;
};

export const getNftInfos = async (jwt: string) => {
  const response = await axios.get<{ isUsable: boolean }>(`${basePath}/infos`, {
    headers: {
      Authorization: 'Bearer ' + jwt,
    },
  });
  return response.data;
};

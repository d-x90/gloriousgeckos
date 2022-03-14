import axios from 'axios';

const basePath = '/api/v1/game';

export const startGame = async (
  nftMint: string,
  secondaries: string[],
  jwt: string
) => {
  const response = await axios.post<{ hash: string }>(
    `${basePath}/start`,
    {
      nftMint,
      secondaries,
    },
    {
      headers: {
        Authorization: 'Bearer ' + jwt,
      },
    }
  );

  return response.data;
};

export const endGame = async (payload: string, jwt: string) => {
  const response = await axios.post<{ hash: string }>(
    `${basePath}/finish`,
    {
      payload,
    },
    {
      headers: {
        Authorization: 'Bearer ' + jwt,
      },
    }
  );

  return response.data;
};

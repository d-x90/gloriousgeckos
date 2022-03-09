import axios from 'axios';

const basePath = '/api/v1/store';

export const buyRevivePotion = async (jwt: string) => {
  const response = await axios.post<{ isSuccess: boolean }>(
    `${basePath}/buy-revive-potion`,
    null,
    {
      headers: {
        Authorization: 'Bearer ' + jwt,
      },
    }
  );

  return response.data;
};

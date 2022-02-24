import axios from 'axios';

const basePath = '/api/v1/user';

export type User = {
  wallet: string;
  username: string;
  balance: number;
  inventory: {
    revivePotion: number;
  };
};

export const getOwnUser = async (jwt: string) => {
  const response = await axios.get<User>(`${basePath}/own-user`, {
    headers: {
      Authorization: 'Bearer ' + jwt,
    },
  });
  return response.data;
};

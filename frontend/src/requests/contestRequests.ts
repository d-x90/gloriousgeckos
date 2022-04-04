import axios from 'axios';

const basePath = '/api/v1/contest';

export const signUpForContest = async (signature: string, jwt: string) => {
  const response = await axios.post<{ success: boolean; errorMessage: string }>(
    basePath + '/signUp',
    { signature },
    {
      headers: {
        Authorization: 'Bearer ' + jwt,
      },
    }
  );
  return response.data;
};

export const getLeaderBoard = async () => {
  const response = await axios.get<{
    leaderboard: [{ username: string; bestScore: number }];
  }>(basePath + '/leaderboard');

  return response.data;
};

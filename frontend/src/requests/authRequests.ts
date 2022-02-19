import axios from 'axios';

const basePath = '/api/v1/auth';

interface AuthResponseData {
  jwt: string;
  refreshToken: string;
}

export const login = async (loginDetails: {
  usernameOrWallet: string;
  password: string;
}) => {
  const response = await axios.post<AuthResponseData>(
    basePath + '/login',
    loginDetails
  );
  return response.data;
};

export const register = async (registrationDetails: {
  wallet: string;
  signature: string;
  username: string;
  password: string;
  confirmPassword: string;
}) => {
  const response = await axios.post<AuthResponseData>(
    basePath + '/register',
    registrationDetails
  );
  return response.data;
};

export const refreshJwt = async (refreshToken: string) => {
  const response = await axios.post<AuthResponseData>(
    basePath + '/refresh-jwt/' + refreshToken
  );
  return response.data;
};

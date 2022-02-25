import {
  createContext,
  FC,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { decode } from 'jsonwebtoken';
import { refreshJwt } from '../requests/authRequests';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

interface AuthContextValue {
  isAuthenticated: boolean;
  jwt: string;
  refreshToken: string;
  userInfo: UserInfo | null;
  logIn: (jwt: string, refreshToken: string) => void;
  logOut: () => void;
  authenticatedApiCall: (...params: any) => any;
}

const DEFAULT_CONTEXT: AuthContextValue = {
  isAuthenticated: false,
  jwt: '',
  refreshToken: '',
  userInfo: null,
  logIn: () => {},
  logOut: () => {},
  authenticatedApiCall: () => {},
};

// @ts-ignore
const AuthContext = createContext<AuthContextValue>(DEFAULT_CONTEXT);

export const useAuth = () => {
  return useContext(AuthContext);
};

interface UserInfo {
  wallet: string;
  username: string;
}

const clearAuthStateFromStorage = () => {
  localStorage.removeItem('AuthState');
};

const loadAuthStateFromStorage = () => {
  try {
    const storedState = JSON.parse(localStorage.getItem('AuthState')!);
    if (!storedState) {
      return {};
    }

    return storedState;
  } catch (error) {
    console.error(error);
    return {};
  }
};

const saveAuthStateToStorage = (state: AuthContextValue) => {
  localStorage.setItem(
    'AuthState',
    JSON.stringify({
      isAuthenticated: state.isAuthenticated,
      jwt: state.jwt,
      refreshToken: state.refreshToken,
      userInfo: state.userInfo,
    })
  );
};

export const AuthContextProvider: FC = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(
    loadAuthStateFromStorage().isAuthenticated
  );
  const [jwt, setJwt] = useState<string>(loadAuthStateFromStorage().jwt);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(
    loadAuthStateFromStorage().userInfo
  );
  const [refreshToken, setRefreshToken] = useState<string>(
    loadAuthStateFromStorage().refreshToken
  );

  const navigate = useNavigate();

  const logIn = useCallback(
    async (jwt: string, refreshToken: string) => {
      setIsAuthenticated(true);
      setJwt(jwt);
      setRefreshToken(refreshToken);
      setUserInfo(decode(jwt) as UserInfo);

      navigate('/');
    },
    [navigate]
  );

  const logOut = useCallback(() => {
    setIsAuthenticated(false);
    setJwt('');
    setRefreshToken('');
    setUserInfo(null);

    navigate('/login');
  }, [setIsAuthenticated, setJwt, navigate]);

  const authenticatedApiCall = useCallback(
    async (apiCall, ...params) => {
      try {
        return await apiCall(...params, jwt);
      } catch (error) {
        // @ts-ignore
        console.error(Object.keys(error.response));
        // @ts-ignore
        if (error.response.status !== 403) {
          // @ts-ignore
          toast.error(error.response.message);
          return null;
        }

        try {
          const { jwt: newJwt, refreshToken: newRefreshToken } =
            await refreshJwt(refreshToken);
          setJwt(newJwt);
          setRefreshToken(newRefreshToken);
          return await apiCall(...params, newJwt);
        } catch (error) {
          console.error(error);
          setIsAuthenticated(false);
          navigate('/login');
        }
      }
    },
    [jwt, refreshToken, navigate]
  );

  const contextValue = useMemo(
    () => ({
      isAuthenticated,
      jwt,
      refreshToken,
      userInfo,
      logIn,
      logOut,
      authenticatedApiCall,
    }),
    [
      isAuthenticated,
      jwt,
      refreshToken,
      userInfo,
      logIn,
      logOut,
      authenticatedApiCall,
    ]
  );

  useEffect(() => {
    saveAuthStateToStorage(contextValue);
  }, [contextValue]);

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

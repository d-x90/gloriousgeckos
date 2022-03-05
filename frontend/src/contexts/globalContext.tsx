import {
  createContext,
  FC,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { Nft } from '../requests/authenticated/nfts/useNft';
import { getOwnUser, User } from '../requests/authenticated/user/userRequests';
import { useAuth } from './authContext';
import { useLoading } from './loadingContext';

interface GlobalContextValue {
  selectedNft: Nft | null;
  selectNft: (nft: Nft | null) => void;
  user: User | null;
  refreshUser: () => void;
}

const DEFAULT_CONTEXT: GlobalContextValue = {
  selectedNft: null,
  selectNft: () => {},
  user: null,
  refreshUser: () => {},
};

const GlobalContext = createContext<GlobalContextValue>(DEFAULT_CONTEXT);

export const useGlobal = () => {
  return useContext(GlobalContext);
};

export const GlobalContextProvider: FC = ({ children }) => {
  const [selectedNft, selectNft] = useState<Nft | null>(null);
  const [user, setUser] = useState<User | null>(null);

  const { decreaseLoadingCount, increaseLoadingCount } = useLoading();
  const { isAuthenticated, authenticatedApiCall, jwt, refreshToken } =
    useAuth();

  useEffect(() => {
    (async () => {
      if (isAuthenticated && jwt && refreshToken) {
        if (!user) {
          increaseLoadingCount(1);
          setUser(await authenticatedApiCall(getOwnUser));
          decreaseLoadingCount(1);
        }
      } else {
        setUser(null);
      }
    })();
  }, [
    authenticatedApiCall,
    decreaseLoadingCount,
    increaseLoadingCount,
    isAuthenticated,
    jwt,
    refreshToken,
    user,
  ]);

  const refreshUser = useCallback(() => {
    (async () => {
      if (isAuthenticated) {
        increaseLoadingCount(1);
        setUser(await authenticatedApiCall(getOwnUser));
        decreaseLoadingCount(1);
      }
    })();
  }, [
    authenticatedApiCall,
    decreaseLoadingCount,
    increaseLoadingCount,
    isAuthenticated,
  ]);

  const contextValue = useMemo(
    () => ({
      selectedNft,
      selectNft,
      user,
      refreshUser,
    }),
    [refreshUser, selectedNft, user]
  );

  return (
    <GlobalContext.Provider value={contextValue}>
      {children}
    </GlobalContext.Provider>
  );
};

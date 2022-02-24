import {
  createContext,
  FC,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { Nft } from '../requests/authenticated/nfts/useNft';
import { getOwnUser, User } from '../requests/authenticated/user/userRequests';
import { useAuth } from './authContext';

interface GlobalContextValue {
  selectedNft: Nft | null;
  selectNft: (nft: Nft) => void;
  user: User | null;
}

const DEFAULT_CONTEXT: GlobalContextValue = {
  selectedNft: null,
  selectNft: () => {},
  user: null,
};

const GlobalContext = createContext<GlobalContextValue>(DEFAULT_CONTEXT);

export const useGlobal = () => {
  return useContext(GlobalContext);
};

export const GlobalContextProvider: FC = ({ children }) => {
  const [selectedNft, selectNft] = useState<Nft | null>(null);
  const [user, setUser] = useState<User | null>(null);

  const { isAuthenticated, authenticatedApiCall } = useAuth();

  useEffect(() => {
    (async () => {
      if (isAuthenticated) {
        if (!user) {
          setUser(await authenticatedApiCall(getOwnUser));
        }
      } else {
        setUser(null);
      }
    })();
  }, [authenticatedApiCall, isAuthenticated, user]);

  const contextValue = useMemo(
    () => ({
      selectedNft,
      selectNft,
      user,
    }),
    [selectedNft, user]
  );

  return (
    <GlobalContext.Provider value={contextValue}>
      {children}
    </GlobalContext.Provider>
  );
};

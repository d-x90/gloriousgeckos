import { styled } from '@mui/material';
import {
  createContext,
  FC,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import SpinnerGif from '../assets/gifs/loading-animation-gif-9.gif';

interface LoadingContextValue {
  loadingCount: number;
  increaseLoadingCount: (count: number) => void;
  decreaseLoadingCount: (count: number) => void;
}

const DEFAULT_CONTEXT: LoadingContextValue = {
  loadingCount: 0,
  increaseLoadingCount: (count: number) => {},
  decreaseLoadingCount: (count: number) => {},
};

const LoadingContext = createContext<LoadingContextValue>(DEFAULT_CONTEXT);

export const useLoading = () => {
  return useContext(LoadingContext);
};

const LoadingOverlay = styled('div')(() => ({
  top: 0,
  zIndex: 999,
  position: 'fixed',
  height: '100vh',
  width: '100vw',
  backgroundColor: 'rgba(0,0,0,0.75)',
  backdropFilter: 'blur(5px)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  '&>.spinner': {
    backgroundImage: `url(${SpinnerGif})`,
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    width: '150px',
    height: '150px',
    borderRadius: '10px',
    position: 'relative',
    '&::after': {
      content: '"Please wait while loading.."',
      position: 'fixed',
      fontSize: '28px',
      transform: 'translate(-70px, 155px)',
      color: 'white',
    },
  },
}));

export const LoadingContextProvider: FC = ({ children }) => {
  const [loadingCount, setLoadingCount] = useState(0);

  const increaseLoadingCount = useCallback((value: number) => {
    setLoadingCount((count) => count + value);
  }, []);

  const decreaseLoadingCount = useCallback((value: number) => {
    setLoadingCount((count) => {
      const newValue = count - value;
      return newValue < 0 ? 0 : newValue;
    });
  }, []);

  const contextValue = useMemo(
    () => ({
      loadingCount,
      increaseLoadingCount,
      decreaseLoadingCount,
    }),
    [decreaseLoadingCount, increaseLoadingCount, loadingCount]
  );

  return (
    <LoadingContext.Provider value={contextValue}>
      {children}
      {loadingCount > 0 ? (
        <LoadingOverlay>
          <div className="spinner"></div>
        </LoadingOverlay>
      ) : null}
    </LoadingContext.Provider>
  );
};

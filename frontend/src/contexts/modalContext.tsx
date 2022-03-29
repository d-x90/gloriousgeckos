import { NoEncryptionTwoTone } from '@mui/icons-material';
import { Card, CardActions, CardContent, styled, Button } from '@mui/material';
import {
  createContext,
  FC,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from 'react';

interface ModalContextValue {
  showModal: (text: string) => Promise<{ isAccepted: boolean }>;
}

const DEFAULT_CONTEXT: ModalContextValue = {
  showModal: (text: string) => Promise.resolve({ isAccepted: true }),
};

const ModalContext = createContext<ModalContextValue>(DEFAULT_CONTEXT);

export const useModal = () => {
  return useContext(ModalContext);
};

const ModalOverlay = styled('div')(() => ({
  top: 0,
  zIndex: 901,
  position: 'fixed',
  height: '100vh',
  width: '100vw',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  pointerEvents: 'none',
  '.MuiPaper-root': {
    pointerEvents: 'all',
    padding: '24px',
    maxWidth: '620px',
    h1: {
      marginTop: '0',
    },
    'h1,h3': {
      textAlign: 'center',
    },
    '.MuiCardActions-root': {
      display: 'flex',
      justifyContent: 'space-around',
    },
  },
}));

const ModalBackdrop = styled('div')(() => ({
  top: 0,
  zIndex: 900,
  position: 'fixed',
  height: '100vh',
  width: '100vw',
  backgroundColor: 'rgba(0,0,0,0.75)',
  backdropFilter: 'blur(5px)',
}));

export const ModalContextProvider: FC = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const onOk = useRef(() => {});
  const onCancel = useRef(() => {});

  const [content, setContent] = useState('');

  const showModal = useCallback(async (text: string) => {
    setIsOpen(true);
    setContent(text);

    return new Promise<{ isAccepted: boolean }>((resolve, reject) => {
      onOk.current = () => resolve({ isAccepted: true });
      onCancel.current = () => resolve({ isAccepted: false });
    });
  }, []);

  const handleCancel = useCallback((e: any) => {
    e.stopPropagation();
    onCancel.current();
    setIsOpen(false);
  }, []);

  const handleOk = useCallback((e: any) => {
    e.stopPropagation();
    onOk.current();
    setIsOpen(false);
  }, []);

  const contextValue = useMemo(
    () => ({
      showModal,
    }),
    [showModal]
  );

  return (
    <ModalContext.Provider value={contextValue}>
      {children}
      {isOpen ? (
        <>
          <ModalBackdrop onClick={handleCancel} />
          <ModalOverlay>
            <Card sx={{ minWidth: 275 }}>
              <CardContent>
                <h1>Are you sure?</h1>
                <h3>{content}</h3>
              </CardContent>
              <CardActions>
                <Button variant="contained" onClick={handleOk}>
                  Yes
                </Button>
                <Button variant="contained" onClick={handleCancel}>
                  Cancel
                </Button>
              </CardActions>
            </Card>
          </ModalOverlay>
        </>
      ) : null}
    </ModalContext.Provider>
  );
};

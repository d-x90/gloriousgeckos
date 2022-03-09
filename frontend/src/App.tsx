import { BrowserRouter as Router } from 'react-router-dom';
import { AuthContextProvider } from './contexts/authContext';
import SolanaWalletProvider from './solana/SolanaWalletProvider';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AppRoutes from './AppRoutes';
import Navbar from './components/Navbar';
import { GlobalContextProvider } from './contexts/globalContext';
import { LoadingContextProvider } from './contexts/loadingContext';
import { ModalContextProvider } from './contexts/modalContext';

window.alert = console.log;

export default function App() {
  return (
    <SolanaWalletProvider>
      <Router>
        <LoadingContextProvider>
          <ModalContextProvider>
            <AuthContextProvider>
              <GlobalContextProvider>
                <Navbar />
                <AppRoutes />
                <ToastContainer
                  closeOnClick={false}
                  limit={7}
                  autoClose={7000}
                  position="bottom-right"
                />
              </GlobalContextProvider>
            </AuthContextProvider>
          </ModalContextProvider>
        </LoadingContextProvider>
      </Router>
    </SolanaWalletProvider>
  );
}

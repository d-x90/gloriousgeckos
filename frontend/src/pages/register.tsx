import { Button, styled, TextField } from '@mui/material';
import { useWallet } from '@solana/wallet-adapter-react';
import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../contexts/authContext';
import { register } from '../requests/authRequests';
import MessageSignerButton from '../solana/MessageSignerButton';
import { toast } from 'react-toastify';
import {
  WalletDisconnectButton,
  WalletMultiButton,
} from '@solana/wallet-adapter-react-ui';
import { GeneralPageStyle } from '../GeneralStyles';
import { useNavigate } from 'react-router-dom';
import bgImage from '../assets/images/blurry-gradient-haikei_2.svg';
import { useLoading } from '../contexts/loadingContext';

const StyledRegister = styled(GeneralPageStyle)(() => ({
  backgroundImage: `url(${bgImage})`,
  backgroundSize: 'cover',
  '&>.panel': {
    backgroundColor: '#f6f6f6',
    width: '30vw',
    height: '35vh',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-around',
    border: '1px solid rgba(0, 0, 0, 0.23)',
    borderRadius: '5px',
    padding: '20px',
  },
}));

const Register = () => {
  const { isAuthenticated, logIn } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [passwordAgain, setPasswordAgain] = useState<string>('');
  const [signedMessage, setSignedMessage] = useState<number[]>([]);

  const { publicKey: wallet } = useWallet();

  const { decreaseLoadingCount, increaseLoadingCount } = useLoading();

  const evaluateForm = useCallback(() => {
    if (!username) {
      toast.error('Username is required');
      return false;
    }

    if (!password) {
      toast.error('Password is required');
      return false;
    }

    if (password !== passwordAgain) {
      toast.error('Passwords do not match');
      return false;
    }

    if (signedMessage.length === 0) {
      toast.error('Verifing your wallet is required');
      return false;
    }

    if (!wallet) {
      toast.error('Connecting your walllet is required');
      return false;
    }

    return true;
  }, [username, password, passwordAgain, signedMessage, wallet]);

  useEffect(() => {
    setSignedMessage([]);
  }, [wallet]);

  const onRegisterClick = useCallback(async () => {
    if (!evaluateForm()) {
      return;
    }
    increaseLoadingCount(1);

    try {
      const { jwt, refreshToken } = await register({
        wallet: wallet?.toString()!,
        signature: JSON.stringify(signedMessage),
        username,
        password,
        confirmPassword: passwordAgain,
      });
      decreaseLoadingCount(1);

      logIn(jwt, refreshToken);
    } catch (error) {
      decreaseLoadingCount(1);
      // @ts-ignore
      toast.error(error.response.data.message);
    }
  }, [
    increaseLoadingCount,
    evaluateForm,
    wallet,
    signedMessage,
    username,
    password,
    passwordAgain,
    decreaseLoadingCount,
    logIn,
  ]);

  return (
    <StyledRegister>
      <div className="panel">
        <TextField
          label="Username"
          variant="outlined"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <TextField
          label="Password"
          variant="outlined"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <TextField
          label="Verify Password"
          variant="outlined"
          type="password"
          value={passwordAgain}
          onChange={(e) => setPasswordAgain(e.target.value)}
        />
        <MessageSignerButton
          onMessageSigned={(signedMessageParam) =>
            setSignedMessage(signedMessageParam)
          }
          isSigned={signedMessage.length > 0}
        ></MessageSignerButton>
        <Button variant="contained" onClick={onRegisterClick}>
          Register
        </Button>
      </div>
    </StyledRegister>
  );
};

export default Register;

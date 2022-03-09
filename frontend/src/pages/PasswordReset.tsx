import { Button, styled, TextField } from '@mui/material';
import { useWallet } from '@solana/wallet-adapter-react';
import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../contexts/authContext';
import { passwordReset } from '../requests/authRequests';
import MessageSignerButton from '../solana/MessageSignerButton';
import { toast } from 'react-toastify';
import { GeneralPageStyle } from '../GeneralStyles';
import { useNavigate } from 'react-router-dom';
import bgImage from '../assets/images/blurry-gradient-haikei_2.svg';
import { useLoading } from '../contexts/loadingContext';

const StyledPasswordReset = styled(GeneralPageStyle)(() => ({
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

const PasswordReset = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const [password, setPassword] = useState<string>('');
  const [passwordAgain, setPasswordAgain] = useState<string>('');
  const [signedMessage, setSignedMessage] = useState<number[]>([]);

  const { publicKey: wallet } = useWallet();

  const { decreaseLoadingCount, increaseLoadingCount } = useLoading();

  const evaluateForm = useCallback(() => {
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
  }, [password, passwordAgain, signedMessage, wallet]);

  useEffect(() => {
    setSignedMessage([]);
  }, [wallet]);

  const handleResetPasswordClick = useCallback(async () => {
    if (!evaluateForm()) {
      return;
    }
    increaseLoadingCount(1);

    try {
      const response = await passwordReset({
        wallet: wallet?.toString()!,
        signature: JSON.stringify(signedMessage),
        password,
        confirmPassword: passwordAgain,
      });

      if (response.isSuccess) {
        toast.success('Password changed successfully');
        return navigate('/');
      }

      // @ts-ignore
      toast.error(response.response.data.message);
    } catch (error) {
      // @ts-ignore
      toast.error(error.response.data.message);
    } finally {
      decreaseLoadingCount(1);
    }
  }, [
    evaluateForm,
    increaseLoadingCount,
    wallet,
    signedMessage,
    password,
    passwordAgain,
    navigate,
    decreaseLoadingCount,
  ]);

  return (
    <StyledPasswordReset>
      <div className="panel">
        <TextField
          label="New password"
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
        <Button variant="contained" onClick={handleResetPasswordClick}>
          Reset password
        </Button>
      </div>
    </StyledPasswordReset>
  );
};

export default PasswordReset;

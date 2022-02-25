import { Button, styled, TextField } from '@mui/material';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/authContext';
import { GeneralPageStyle } from '../GeneralStyles';
import { login } from '../requests/authRequests';
import bgImage from '../assets/images/blurry-gradient-haikei.svg';
import { useLoading } from '../contexts/loadingContext';

const StyledLogin = styled(GeneralPageStyle)(() => ({
  backgroundImage: `url(${bgImage})`,
  backgroundSize: 'cover',
  '&>.panel': {
    backgroundColor: '#f6f6f6',
    width: '30vw',
    height: '25vh',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-around',
    border: '1px solid rgba(0, 0, 0, 0.23)',
    borderRadius: '5px',
    padding: '20px',
  },
}));

const Login = () => {
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  const { decreaseLoadingCount, increaseLoadingCount } = useLoading();
  const { isAuthenticated, logIn } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const evaluateForm = useCallback(() => {
    if (!username) {
      toast.error('Username is required');
      return false;
    }

    if (!password) {
      toast.error('Password is required');
      return false;
    }
    return true;
  }, [username, password]);

  const onLoginClick = async () => {
    try {
      if (!evaluateForm()) {
        return;
      }
      increaseLoadingCount(1);

      const { jwt, refreshToken } = await login({
        usernameOrWallet: username,
        password,
      });
      decreaseLoadingCount(1);
      logIn(jwt, refreshToken);
    } catch (error) {
      decreaseLoadingCount(1);
      // @ts-ignore
      toast.error(error.response.data.message);
    }
  };

  return (
    <StyledLogin>
      <div className="panel">
        <TextField
          data-atropos-offset="5"
          label="Username"
          variant="outlined"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <TextField
          data-atropos-offset="5"
          label="Password"
          variant="outlined"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button
          data-atropos-offset="10"
          variant="contained"
          onClick={onLoginClick}
        >
          Login
        </Button>
      </div>
    </StyledLogin>
  );
};

export default Login;

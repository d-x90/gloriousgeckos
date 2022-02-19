import { Button, styled, TextField } from '@mui/material';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/authContext';
import { GeneralPageStyle } from '../GeneralStyles';
import { login } from '../requests/authRequests';

const StyledLogin = styled(GeneralPageStyle)(() => ({
  '&>.panel': {
    width: '50%',
    height: '25%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-around',
    border: '1px solid black',
    borderRadius: '5px',
    padding: '20px',
  },
}));

const Login = () => {
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  const { isAuthenticated, logIn } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const onLoginClick = async () => {
    try {
      const { jwt, refreshToken } = await login({
        usernameOrWallet: username,
        password,
      });
      logIn(jwt, refreshToken);
    } catch (error) {
      // @ts-ignore
      toast.error(error.response.data.message);
    }
  };

  return (
    <StyledLogin>
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
        <Button variant="contained" onClick={onLoginClick}>
          Login
        </Button>
      </div>
    </StyledLogin>
  );
};

export default Login;

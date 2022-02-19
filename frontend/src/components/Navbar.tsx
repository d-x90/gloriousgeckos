import { styled } from '@mui/material';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/authContext';

const StyledNavbar = styled('div')(() => ({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  width: '100vw',
  minHeight: '6vh',
  padding: '20px',
  borderBottom: '1px solid black',
  '&>.links': {
    '&>*': {
      marginRight: '12px',
      fontWeight: 'bolder',
      fontSize: '18px',
      textDecoration: 'none',
      cursor: 'pointer',
    },
  },
}));

const Navbar = () => {
  const { isAuthenticated, logOut } = useAuth();

  return (
    <StyledNavbar>
      <div className="links">
        {isAuthenticated ? (
          <span onClick={logOut}>Log out</span>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </div>

      <WalletMultiButton />
    </StyledNavbar>
  );
};

export default Navbar;

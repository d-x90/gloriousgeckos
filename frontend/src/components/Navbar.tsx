import { styled } from '@mui/material';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/authContext';
import { useGlobal } from '../contexts/globalContext';

const StyledNavbar = styled('div')(() => ({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  width: '100vw',
  height: '8vh',
  padding: '20px',
  backgroundColor: '#f6f6f6',
  borderBottom: '1px solid black',
  '&>.links': {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    '&>*': {
      marginRight: '12px',
      fontWeight: 'bolder',
      fontSize: '18px',
      textDecoration: 'none',
      cursor: 'pointer',
      color: 'black',
    },
  },
  '&>.stats': {
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'center',
    '&>*': {
      marginRight: '12px',
      fontSize: '18px',
      color: 'black',
    },
  },
}));

const Navbar = () => {
  const { isAuthenticated, logOut } = useAuth();
  const { user } = useGlobal();

  return (
    <StyledNavbar>
      <div className="links">
        {isAuthenticated ? (
          <p onClick={logOut}>Log out</p>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </div>
      {user ? (
        <div className="stats">
          <p>
            Balance: <strong>{user.balance} $GLORY</strong>
          </p>
          <p>
            Revive Potions: <strong>{user.inventory.revivePotion}</strong>
          </p>
        </div>
      ) : null}

      <WalletMultiButton />
    </StyledNavbar>
  );
};

export default Navbar;

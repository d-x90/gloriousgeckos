import { Button, styled, Tooltip } from '@mui/material';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useCallback } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/authContext';
import { useGlobal } from '../contexts/globalContext';
import { useLoading } from '../contexts/loadingContext';
import { useModal } from '../contexts/modalContext';
import { buyRevivePotion } from '../requests/authenticated/storeRequests';
import HomeIcon from '@mui/icons-material/Home';
import EggIcon from '@mui/icons-material/Egg';

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
    alignItems: 'center',
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
  const { isAuthenticated, authenticatedApiCall } = useAuth();
  const { user, refreshUser } = useGlobal();
  const { increaseLoadingCount, decreaseLoadingCount } = useLoading();
  const { showModal } = useModal();

  const handleBuyButtonClick = useCallback(async () => {
    try {
      const { isAccepted } = await showModal('Revive potion costs 100 $GLORY!');
      if (!isAccepted) {
        return;
      }

      increaseLoadingCount(1);
      const response = await authenticatedApiCall(buyRevivePotion);
      if (response.isSuccess) {
        toast.success('Purchased 1 revive potion');
        return refreshUser();
      }

      toast.error(response.response.data.message);
    } catch (error) {
      toast.error('Something went wrong');
    } finally {
      decreaseLoadingCount(1);
    }
  }, [
    authenticatedApiCall,
    decreaseLoadingCount,
    increaseLoadingCount,
    refreshUser,
    showModal,
  ]);

  return (
    <StyledNavbar>
      <div className="links">
        {isAuthenticated ? (
          <>
            <Link to="/">
              <Tooltip title="Dashboard" placement="right" arrow>
                <HomeIcon />
              </Tooltip>
            </Link>
            <Link to="/staking">
              <Tooltip title="Staking" placement="right" arrow>
                <EggIcon />
              </Tooltip>
            </Link>
          </>
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
          <Button
            style={{ height: '32px', color: 'white' }}
            variant="contained"
            onClick={handleBuyButtonClick}
          >
            Buy
          </Button>
        </div>
      ) : null}

      <WalletMultiButton />
    </StyledNavbar>
  );
};

export default Navbar;

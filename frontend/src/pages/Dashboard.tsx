import { Button, styled, Tooltip } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import NftCard from '../components/NftCard';
import { useGlobal } from '../contexts/globalContext';
import useNft from '../requests/authenticated/nfts/useNft';
import { useEffect } from 'react';
import { useModal } from '../contexts/modalContext';
import { useAuth } from '../contexts/authContext';
import LogoutIcon from '@mui/icons-material/Logout';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

const StyledDashboard = styled('div')(() => ({
  width: '100vw',
  height: '92vh',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-start',
  '&>.buttons': {
    display: 'flex',
    justifyContent: 'center',
    padding: '20px',
    borderTop: '1px solid black',
    '&>*': {
      margin: '0 20px',
    },
  },
}));
const StyledNftContainer = styled('section')(() => ({
  // backgroundImage: `url(${bgImage})`,
  // backgroundSize: 'cover',
  backgroundColor: 'rgb(28, 19, 38)',
  width: '100%',
  height: '100%',
  //backgroundColor: '#ececec',
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'flex-start',
  flexWrap: 'wrap',
  overflowY: 'scroll',
}));

const Dashboard = () => {
  const {
    isLoading,
    nfts,
    setNfts,
    checkIfNftIsUsable,
    reviveNft,
    stakeNft,
    unstakeNft,
    checkForNewNfts,
  } = useNft();
  const navigate = useNavigate();

  const {
    selectedNft,
    selectNft,
    refreshUser,
    secondaryNfts,
    addSecondaryNft,
    removeSecondaryNft,
  } = useGlobal();
  const { logOut } = useAuth();

  const { showModal } = useModal();

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const startPlaying = async () => {
    if (!selectedNft) {
      return;
    }

    return navigate('/game');
  };

  return (
    <StyledDashboard>
      <StyledNftContainer onClick={() => selectNft(null)}>
        {nfts.map((nft) => (
          <NftCard
            key={nft.mint}
            onClick={() => {
              nft.mint === selectedNft?.mint ? selectNft(null) : selectNft(nft);
              removeSecondaryNft(nft.mint);
            }}
            isSelected={selectedNft?.mint === nft.mint}
            nft={nft}
          />
        ))}
        {isLoading ? (
          <span
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              color: 'white',
              fontSize: '30px',
              transform: 'translateX(-50%)',
            }}
          >
            Loading playable NFTs...
          </span>
        ) : null}
        {nfts.length === 0 && !isLoading ? (
          <span
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              color: 'white',
              fontSize: '30px',
              transform: 'translateX(-50%)',
            }}
          >
            You have no playable NFTs
          </span>
        ) : null}
      </StyledNftContainer>

      <div className="buttons">
        {selectedNft && !selectedNft.isDead && !selectedNft.isOnCooldown ? (
          <Button
            variant="contained"
            disabled={!selectedNft || selectedNft?.isDead}
            onClick={startPlaying}
          >
            Play
          </Button>
        ) : null}
        {selectedNft && selectedNft.symbol === 'GG' && !selectedNft.isStaked ? (
          <Button
            variant="contained"
            onClick={async () => {
              if (!selectedNft) {
                return;
              }

              const { isAccepted } = await showModal(
                'You will get 100 $GLORY/day and a gecko egg that can be claimed after 50 days. If you list your gecko or transfer it to another wallet during staking your progress will be lost!'
              );

              if (!isAccepted) {
                return;
              }

              try {
                const response = await stakeNft(selectedNft.mint);
                if (response.staked) {
                  toast.success('Successfully staked');
                  setNfts(
                    nfts.map((nft) =>
                      nft.mint === selectedNft.mint
                        ? { ...nft, isStaked: true, stakingDaysLeft: 50 }
                        : nft
                    )
                  );
                  selectNft(null);
                } else {
                  toast.error(response.response.data.message);
                }
              } catch (error) {
                // @ts-ignore
                toast.error('Something went wrong');
              }
            }}
          >
            Stake
          </Button>
        ) : null}

        {selectedNft && selectedNft.symbol === 'GG' && selectedNft.isStaked ? (
          <Button
            variant="contained"
            onClick={async () => {
              if (!selectedNft) {
                return;
              }

              const { isAccepted } = await showModal(
                'Your staking progress will be lost!'
              );

              if (!isAccepted) {
                return;
              }

              try {
                const response = await unstakeNft(selectedNft.mint);
                if (response.unstaked) {
                  toast.success('Successfully unstaked');
                  setNfts(
                    nfts.map((nft) =>
                      nft.mint === selectedNft.mint
                        ? { ...nft, isStaked: false, stakingDaysLeft: 50 }
                        : nft
                    )
                  );
                  selectNft(null);
                } else {
                  toast.error(response.response.data.message);
                }
              } catch (error) {
                // @ts-ignore
                toast.error('Something went wrong');
              }
            }}
          >
            Unstake
          </Button>
        ) : null}

        {selectedNft && selectedNft.isDead ? (
          <Button
            variant="outlined"
            onClick={async () => {
              if (!selectedNft) {
                return;
              }

              const { isAccepted } = await showModal(
                'Reviving an NFT costs 1 revive potion!'
              );

              if (!isAccepted) {
                return;
              }

              try {
                const response = await reviveNft(selectedNft.mint);
                if (response.revived) {
                  toast.success('Successful revival');
                  setNfts(
                    nfts.map((nft) =>
                      nft.mint === selectedNft.mint
                        ? { ...nft, isDead: false }
                        : nft
                    )
                  );
                  selectNft(null);
                  refreshUser();
                } else {
                  toast.error(response.response.data.message);
                }
              } catch (error) {
                // @ts-ignore
                toast.error('Something went wrong');
              }
            }}
          >
            Revive
          </Button>
        ) : null}
        <Tooltip
          arrow
          placement="left"
          title="Click here if you can't see your nft or you sold some of them"
        >
          <Button variant="outlined" onClick={() => checkForNewNfts()}>
            Revalidate my NFTs
          </Button>
        </Tooltip>

        <Tooltip arrow placement="left" title="Log out">
          <p
            style={{
              position: 'absolute',
              right: 0,
              marginRight: '12px',
              fontWeight: 'bolder',
              fontSize: '18px',
              textDecoration: 'none',
              cursor: 'pointer',
              color: 'black',
            }}
            className="logout-btn"
            onClick={logOut}
          >
            <LogoutIcon />
          </p>
        </Tooltip>

        <Tooltip arrow placement="left" title="Rules">
          <p
            style={{
              position: 'absolute',
              left: 0,
              marginRight: '12px',
              fontWeight: 'bolder',
              fontSize: '18px',
              textDecoration: 'none',
              cursor: 'pointer',
              color: 'black',
            }}
            className="info-btn"
            onClick={() => navigate('/info')}
          >
            <InfoOutlinedIcon />
          </p>
        </Tooltip>
      </div>
    </StyledDashboard>
  );
};

export default Dashboard;

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
import StakingRewardCard from '../components/StakingRewardCard';

const StyledStakingRewards = styled('div')(() => ({
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

const StakingRewards = () => {
  const { isLoading, nfts, checkForNewNfts } = useNft();
  const navigate = useNavigate();

  const { selectedNft, selectNft, refreshUser } = useGlobal();
  const { logOut } = useAuth();

  const { showModal } = useModal();

  useEffect(() => {
    selectNft(null);
    refreshUser();
  }, [refreshUser, selectNft]);

  const claim = async () => {};

  return (
    <StyledStakingRewards>
      <StyledNftContainer onClick={() => selectNft(null)}>
        {nfts
          .filter((nft) => nft.isStaked)
          .map((nft) => (
            <StakingRewardCard
              key={nft.mint}
              onClick={() => {
                nft.mint === selectedNft?.mint
                  ? selectNft(null)
                  : selectNft(nft);
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
            Loading staking rewards NFTs...
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
            You have no staking rewards
          </span>
        ) : null}
      </StyledNftContainer>

      <div className="buttons">
        {selectedNft ? (
          <Button variant="contained" onClick={claim} disabled>
            Hatch
          </Button>
        ) : null}
        {selectedNft ? (
          <Button variant="contained" onClick={claim} disabled>
            Claim
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
    </StyledStakingRewards>
  );
};

export default StakingRewards;

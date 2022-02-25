import { Button, styled } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import NftCard from '../components/NftCard';
import { useGlobal } from '../contexts/globalContext';
import useNft from '../requests/authenticated/nfts/useNft';
import bgImage from '../assets/images/blurry-gradient-haikei.svg';

const StyledDashboard = styled('div')(() => ({
  width: '100vw',
  height: '92vh',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-start',
}));
const StyledNftContainer = styled('section')(() => ({
  backgroundImage: `url(${bgImage})`,
  backgroundSize: 'cover',
  width: '100%',
  height: '100%',
  backgroundColor: '#ececec',
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'flex-start',
  flexWrap: 'wrap',
  overflowY: 'scroll',
}));

const Dashboard = () => {
  const { isLoading, nfts, setNfts, checkIfNftIsUsable, checkForNewNfts } =
    useNft();
  const navigate = useNavigate();

  const { selectedNft, selectNft } = useGlobal();

  const startPlaying = async () => {
    if (!selectedNft) {
      return;
    }
    const { isUsable, removedFromUser } = await checkIfNftIsUsable(
      selectedNft?.mint
    );
    if (isUsable) {
      navigate('/game');
    } else {
      if (removedFromUser) {
        setNfts((nftsState) =>
          nftsState.filter((nft) => nft.mint !== selectedNft.mint)
        );
      }
      toast.error(
        'It seems like you are not the owner of this nft or it cannot be used'
      );
    }
  };

  return (
    <StyledDashboard>
      <StyledNftContainer>
        {nfts.map((nft) => (
          <NftCard
            key={nft.mint}
            onClick={() => selectNft(nft)}
            isSelected={selectedNft?.mint === nft.mint}
            nft={nft}
          />
        ))}
        {isLoading ? 'Loading playable NFTs...' : null}
        {nfts.length === 0 && !isLoading ? 'You have no playable NFT' : null}
      </StyledNftContainer>
      <div>
        <Button
          variant="contained"
          disabled={!selectedNft}
          onClick={startPlaying}
        >
          Play
        </Button>
        <Button variant="outlined" disabled>
          Revive
        </Button>
        <Button variant="outlined" onClick={() => checkForNewNfts()}>
          I can't see my NFT!
        </Button>
      </div>
    </StyledDashboard>
  );
};

export default Dashboard;

import { Button, styled } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import NftCard from '../components/NftCard';
import { useGlobal } from '../contexts/globalContext';
import useNft from '../requests/authenticated/nfts/useNft';
import bgImage from '../assets/images/blurry-gradient-haikei.svg';
import { AxiosError } from 'axios';
import { useEffect } from 'react';

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
    checkForNewNfts,
  } = useNft();
  const navigate = useNavigate();

  const { selectedNft, selectNft, refreshUser } = useGlobal();

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const startPlaying = async () => {
    if (!selectedNft) {
      return;
    }

    return navigate('/game');

    // TODO
    // const { isUsable, removedFromUser } = await checkIfNftIsUsable(
    //   selectedNft?.mint
    // );
    // if (isUsable) {
    //   navigate('/game');
    // } else {
    //   if (removedFromUser) {
    //     setNfts((nftsState) =>
    //       nftsState.filter((nft) => nft.mint !== selectedNft.mint)
    //     );
    //   }
    //   toast.error(
    //     'It seems like you are not the owner of this nft or it cannot be used'
    //   );
    // }
  };

  return (
    <StyledDashboard>
      <StyledNftContainer onClick={() => selectNft(null)}>
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

      <div className="buttons">
        <Button
          variant="contained"
          disabled={!selectedNft || selectedNft?.isDead}
          onClick={startPlaying}
        >
          Play
        </Button>
        <Button
          variant="outlined"
          onClick={async () => {
            if (!selectedNft) {
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
          disabled={!selectedNft?.isDead}
        >
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

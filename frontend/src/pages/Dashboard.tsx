import { Button, styled } from '@mui/material';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NftCard from '../components/NftCard';
import { useGlobal } from '../contexts/globalContext';
import useNft from '../requests/authenticated/nfts/useNft';

const StyledDashboard = styled('div')(() => ({
  width: '100vw',
  height: '90vh',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-start',
}));
const StyledNftContainer = styled('section')(() => ({
  width: '100%',
  height: '90%',
  backgroundColor: '#ececec',
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'flex-start',
  flexWrap: 'wrap',
  overflow: 'scroll',
}));

const Dashboard = () => {
  const { isLoading, nfts, checkIfNftIsUsable, checkForNewNfts } = useNft();
  const navigate = useNavigate();

  const { selectedNft, selectNft } = useGlobal();

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
          onClick={async () => {
            if (!selectedNft) {
              return;
            }
            const { isUsable } = await checkIfNftIsUsable(selectedNft?.mint);
            if (isUsable) {
              navigate('/game');
            }
          }}
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

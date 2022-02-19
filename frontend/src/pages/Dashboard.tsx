// @ts-nocheck

import { Button, styled } from '@mui/material';
import { useEffect, useState } from 'react';
import NftCard from '../components/NftCard';
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
  const { isLoading, nfts } = useNft();

  const [selectedNft, selectNft] = useState('');

  return (
    <StyledDashboard>
      <StyledNftContainer>
        {nfts.map((nft) => (
          <NftCard
            key={nft.mint}
            onClick={() => selectNft(nft.mint)}
            isSelected={selectedNft === nft.mint}
            nft={nft}
          />
        ))}
        {isLoading ? 'Loading playable NFTs...' : null}
        {nfts.length === 0 && !isLoading ? 'You have no playable NFT' : null}
      </StyledNftContainer>
      <Button variant="contained">Play</Button>
    </StyledDashboard>
  );
};

export default Dashboard;

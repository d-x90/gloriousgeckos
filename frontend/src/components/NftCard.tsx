import { styled } from '@mui/material';
import { FC } from 'react';
import { Nft } from '../requests/authenticated/nfts/useNft';

const StyledNftCard = styled('div', {
  shouldForwardProp: (prop) => prop !== 'isSelcted' && prop !== 'myProp',
})<{ isSelected?: boolean; isDead?: boolean }>(
  ({ theme, isSelected, isDead }) => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '20px',
    '>img': {
      border: isSelected ? '6px solid #ffab0c' : '',
      filter: `drop-shadow(2px 4px 6px black) ${isDead ? 'greyscale(1)' : ''}`,
    },
    '>p': {
      fontWeight: 'bold',
    },
  })
);

const NftCard: FC<{ nft: Nft; onClick: any; isSelected: boolean }> = ({
  nft,
  onClick,
  isSelected,
}) => {
  return (
    <StyledNftCard isSelected={isSelected} onClick={onClick}>
      <img width={100} height={100} src={nft.image} alt={nft.name} />
      <p>{nft.name}</p>
    </StyledNftCard>
  );
};

export default NftCard;

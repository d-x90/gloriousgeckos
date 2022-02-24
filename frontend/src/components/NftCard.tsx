import { styled } from '@mui/material';
import { FC, useCallback } from 'react';
import { Nft } from '../requests/authenticated/nfts/useNft';

const StyledNftCard = styled('div', {
  shouldForwardProp: (prop) =>
    prop !== 'isSelcted' && prop !== 'isDead' && prop !== 'isOnCooldown',
})<{ isSelected?: boolean; isDead?: boolean; isOnCooldown?: boolean }>(
  ({ theme, isSelected, isDead, isOnCooldown }) => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '20px',
    '>img': {
      cursor: 'pointer',
      border: isSelected ? '6px solid #ffab0c' : '',
      filter: `drop-shadow(2px 4px 6px black) ${
        isDead ? 'greyscale(1)' : isOnCooldown ? 'hue-rotate(90deg)' : ''
      }`,
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
  const calculateCooldownDuration = useCallback(() => {
    if (!nft.cooldownStartedAt) {
      return 0;
    }

    const now = new Date();
    const nowInUTC = now.getTime() + now.getTimezoneOffset() * 60 * 1000;

    return nft.cooldownStartedAt + 86400000 - nowInUTC;
  }, [nft.cooldownStartedAt]);

  return (
    <StyledNftCard
      isSelected={isSelected}
      isDead={nft.isDead}
      isOnCooldown={calculateCooldownDuration() > 0}
    >
      <img
        onClick={onClick}
        width={100}
        height={100}
        src={nft.image}
        alt={nft.name}
      />
      <p>{nft.name}</p>
    </StyledNftCard>
  );
};

export default NftCard;

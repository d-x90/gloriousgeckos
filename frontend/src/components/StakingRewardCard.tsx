import {
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Checkbox,
  styled,
  Tooltip,
} from '@mui/material';
import { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Nft } from '../requests/authenticated/nfts/useNft';
import AccessTimeFilledIcon from '@mui/icons-material/AccessTimeFilled';
import { useGlobal } from '../contexts/globalContext';
import geckeggGif from '../assets/gifs/egg.webp';

const StyledStakingRewardCard = styled('div', {
  shouldForwardProp: (prop) =>
    prop !== 'isSelcted' && prop !== 'isDead' && prop !== 'isOnCooldown',
})<{ isSelected?: boolean; isDead?: boolean; isOnCooldown?: boolean }>(
  ({ theme, isSelected, isDead, isOnCooldown }) => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '20px',
    '&:hover': {
      transition: 'transform .3s',
      transform: 'translateY(-3px)',
    },
    img: {
      border: isSelected ? '6px solid #ffab0c' : '',
    },
    p: {
      fontSize: '22px',
      display: 'flex',
      alignItems: 'center',
      fontWeight: 'bold',
    },
    '.MuiCard-root': {
      filter: `drop-shadow(2px 4px 6px black) ${
        isDead ? 'grayscale(1)' : isOnCooldown ? 'sepia(1)' : ''
      }`,
    },
  })
);

const StakingRewardCard: FC<{
  nft: Nft;
  onClick: any;
  isSelected: boolean;
}> = ({ nft, onClick, isSelected }) => {
  return (
    <StyledStakingRewardCard
      isSelected={isSelected}
      isDead={false}
      isOnCooldown={false}
    >
      <Tooltip
        arrow
        placement="right"
        title={<img width={100} height={100} src={nft.image} alt={nft.name} />}
      >
        <Card
          sx={{ width: 200, height: 270 }}
          onClick={(e: any) => {
            e.stopPropagation();

            if (nft.isOnCooldown) {
              return;
            }

            onClick();
          }}
        >
          <CardActionArea>
            <CardMedia
              component="img"
              height="200"
              image={geckeggGif}
              alt="geckegg"
            />

            <CardContent
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <p style={{ color: 'rgb(29,29,29)', margin: 0 }}>
                {50 - nft.stakingDaysLeft}/50 days
              </p>
              <span
                style={{ color: 'rgb(29,29,29)', margin: 0, fontSize: '16px' }}
              >
                {(50 - nft.stakingDaysLeft) * 100} $GLORY earned
              </span>
            </CardContent>
          </CardActionArea>
        </Card>
      </Tooltip>
    </StyledStakingRewardCard>
  );
};

export default StakingRewardCard;

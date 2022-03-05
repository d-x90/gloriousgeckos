import { styled, Tooltip } from '@mui/material';
import { FC, useCallback, useEffect, useRef, useState } from 'react';
import { Nft } from '../requests/authenticated/nfts/useNft';
import AccessTimeFilledIcon from '@mui/icons-material/AccessTimeFilled';

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
        isDead ? 'grayscale(1)' : isOnCooldown ? 'sepia(1)' : ''
      }`,
    },
    '>p': {
      display: 'flex',
      alignItems: 'center',
      fontWeight: 'bold',
    },
  })
);

function getDurationUntilNextMidnightInMs() {
  var midnight = new Date();
  midnight.setUTCHours(24);
  midnight.setUTCMinutes(0);
  midnight.setUTCSeconds(0);
  midnight.setUTCMilliseconds(0);

  return midnight.getTime() - new Date().getTime();
}

function msToTime(duration: number) {
  let seconds: string | number = Math.floor((duration / 1000) % 60);
  let minutes: string | number = Math.floor((duration / (1000 * 60)) % 60);
  let hours: string | number = Math.floor((duration / (1000 * 60 * 60)) % 24);

  hours = hours < 10 ? '0' + hours : hours;
  minutes = minutes < 10 ? '0' + minutes : minutes;
  seconds = seconds < 10 ? '0' + seconds : seconds;

  return hours + ':' + minutes + ':' + seconds;
}

const NftCard: FC<{ nft: Nft; onClick: any; isSelected: boolean }> = ({
  nft,
  onClick,
  isSelected,
}) => {
  const [cooldown, setCooldown] = useState(getDurationUntilNextMidnightInMs());
  const [isTooltipOpen, setTooltipOpen] = useState(false);
  const ref = useRef<number>();

  const handleOpen = () => {
    setCooldown(getDurationUntilNextMidnightInMs());
    setTooltipOpen(true);
    ref.current = setInterval(() => {
      console.log('TICK');
      setCooldown(getDurationUntilNextMidnightInMs());
    }, 1000) as unknown as number;
  };

  const handleClose = () => {
    setTooltipOpen(false);
    clearInterval(ref.current);
  };

  // @ts-ignore
  useEffect(() => () => ref.current ? clearInterval(ref.current) : null, []);

  return (
    <StyledNftCard
      isSelected={isSelected}
      isDead={nft.isDead}
      isOnCooldown={nft.isOnCooldown}
    >
      <Tooltip
        arrow
        placement="right"
        open={isTooltipOpen}
        onClose={handleClose}
        onOpen={handleOpen}
        title={
          <>
            <p style={{ fontSize: '20px' }}>
              Points earned: {nft.score} / {nft.dailyLimit}
            </p>
            {nft.isDead ? (
              <p style={{ fontSize: '20px' }}>NFT is dead</p>
            ) : null}
            {nft.isOnCooldown ? (
              <p style={{ fontSize: '20px' }}>
                Playable in: {msToTime(cooldown)}
              </p>
            ) : null}
          </>
        }
      >
        <img
          onClick={(e) => {
            e.stopPropagation();

            if (nft.isOnCooldown) {
              return;
            }
            onClick();
          }}
          width={100}
          height={100}
          src={nft.image}
          alt={nft.name}
        />
      </Tooltip>
      <p style={{ color: 'white' }}>
        {nft.name} {nft.isOnCooldown ? <AccessTimeFilledIcon /> : null}
      </p>
    </StyledNftCard>
  );
};

export default NftCard;

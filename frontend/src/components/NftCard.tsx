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
import EggIcon from '@mui/icons-material/Egg';

const StyledNftCard = styled('div', {
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

function getDurationUntilNextMidnightInMs() {
  const now = new Date();

  const midnight = Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth() + 1,
    now.getUTCDate(),
    24,
    0,
    0,
    0
  );

  const utcNow = Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth() + 1,
    now.getUTCDate(),
    now.getUTCHours(),
    now.getUTCMinutes(),
    now.getUTCSeconds(),
    now.getUTCMilliseconds()
  );

  return midnight - utcNow + now.getTimezoneOffset() * 60 * 1000;
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

const NftCard: FC<{
  nft: Nft;
  onClick: any;
  isSelected: boolean;
}> = ({ nft, onClick, isSelected }) => {
  const [cooldown, setCooldown] = useState(getDurationUntilNextMidnightInMs());
  const [isTooltipOpen, setTooltipOpen] = useState(false);
  const { addSecondaryNft, removeSecondaryNft, secondaryNfts } = useGlobal();
  const ref = useRef<number>();

  const isSelectedAsSecondary = useMemo(
    () => secondaryNfts.some((x) => x === nft.mint),
    [nft.mint, secondaryNfts]
  );

  const handleOpen = () => {
    setCooldown(getDurationUntilNextMidnightInMs());
    setTooltipOpen(true);
    ref.current = setInterval(() => {
      setCooldown(getDurationUntilNextMidnightInMs());
    }, 1000) as unknown as number;
  };

  const handleClose = () => {
    setTooltipOpen(false);
    clearInterval(ref.current);
  };

  const handleSelectAsSecondary = useCallback(
    (e) => {
      e.stopPropagation();
      if (nft.isOnCooldown || nft.isDead || isSelected) {
        return;
      }

      if (isSelectedAsSecondary) {
        removeSecondaryNft(nft.mint);
      } else {
        addSecondaryNft(nft.mint);
      }
    },
    [
      addSecondaryNft,
      isSelected,
      isSelectedAsSecondary,
      nft.isDead,
      nft.isOnCooldown,
      nft.mint,
      removeSecondaryNft,
    ]
  );

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
              <p style={{ fontSize: '20px' }}>Will be refreshed at 00:00 UTC</p>
            ) : null}
          </>
        }
      >
        <Card
          sx={{ width: 200, height: 250 }}
          onClick={(e: any) => {
            e.stopPropagation();

            onClick();
          }}
        >
          <CardActionArea>
            <CardMedia
              component="img"
              height="150"
              image={nft.image}
              alt={nft.name}
            />

            <CardContent>
              <p style={{ color: 'rgb(29,29,29)', margin: 0 }}>
                {nft.name} {nft.isOnCooldown ? <AccessTimeFilledIcon /> : null}
              </p>
            </CardContent>
          </CardActionArea>
          {nft.isStaked ? (
            <Tooltip title="Staked" arrow placement="right">
              <EggIcon
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                }}
              />
            </Tooltip>
          ) : null}
          <Tooltip title="Select as secondary" arrow placement="left">
            <Checkbox
              style={{
                position: 'absolute',
                bottom: 0,
                right: 0,
              }}
              onClick={handleSelectAsSecondary}
              checked={
                isSelectedAsSecondary &&
                !(nft.isOnCooldown || nft.isDead || isSelected)
              }
              disabled={nft.isOnCooldown || nft.isDead || isSelected}
            ></Checkbox>
          </Tooltip>
        </Card>
      </Tooltip>
    </StyledNftCard>
  );
};

export default NftCard;

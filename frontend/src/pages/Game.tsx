import { Button, styled } from '@mui/material';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Unity, { UnityContext } from 'react-unity-webgl';
import { useAuth } from '../contexts/authContext';
import { useGlobal } from '../contexts/globalContext';
import { useLoading } from '../contexts/loadingContext';
import { endGame, startGame } from '../requests/authenticated/gameRequests';

const unityContext = new UnityContext({
  loaderUrl: 'Unity_build/Build/Unity_build.loader.js',
  dataUrl: 'Unity_build/Build/Unity_build.data',
  frameworkUrl: 'Unity_build/Build/Unity_build.framework.js',
  codeUrl: 'Unity_build/Build/Unity_build.wasm',
  // @ts-ignore
  webGLContextAttributes: {
    alpha: true,
    antialias: true,
    depth: true,
    failIfMajorPerformanceCaveat: true,
    powerPreference: 'high-performance',
    premultipliedAlpha: true,
    preserveDrawingBuffer: true,
    stencil: true,
    desynchronized: true,
    xrCompatible: true,
  },

  productName: 'GeckAdventures',
  productVersion: '0.1.0',
  companyName: 'GloriousGeckos',
});

const GameContainer = styled('div')(() => ({
  width: '100vw',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
}));

const Game = () => {
  const [progression, setProgression] = useState(0);
  const [hash, setHash] = useState('');
  const [isGameFinished, setIsGetgameFinished] = useState(false);

  const [didDie, setDidDie] = useState(false);

  const { increaseLoadingCount, decreaseLoadingCount } = useLoading();
  const { isAuthenticated, authenticatedApiCall } = useAuth();
  const { selectedNft, secondaryNfts, resetSelections, refreshUser } =
    useGlobal();

  const navigate = useNavigate();

  useEffect(() => {
    if (!selectedNft || !isAuthenticated) {
      return navigate('/');
    }

    (async () => {
      increaseLoadingCount(1);
      try {
        const response = await authenticatedApiCall(
          startGame,
          selectedNft.mint,
          secondaryNfts
        );
        if (response.hash) {
          setHash(response.hash);
        } else {
          toast.error(response.response.data.message);
          navigate('/');
        }
      } catch (error) {
        toast.error('Something went wrong');
        navigate('/');
      } finally {
        decreaseLoadingCount(1);
      }
    })();
  }, [
    authenticatedApiCall,
    decreaseLoadingCount,
    increaseLoadingCount,
    isAuthenticated,
    navigate,
    resetSelections,
    secondaryNfts,
    selectedNft,
  ]);

  useEffect(() => {
    if (hash && selectedNft) {
      unityContext.on('progress', function (progression) {
        setProgression(progression);
      });

      unityContext.on('canvas', (canvas) => {
        canvas.width = 1000;
        canvas.height = 700;
      });

      unityContext.on('SceneLoaded', () => {
        unityContext.send('GameManager', 'SetHash', hash);
        unityContext.send('GameManager', 'SetSymbol', selectedNft.symbol || '');
        unityContext.send(
          'GameManager',
          'SetNFTImageThenStart',
          selectedNft?.image
        );
      });

      unityContext.on('GameOver', async (payload, score, didDie) => {
        increaseLoadingCount(1);
        setDidDie(didDie);
        try {
          const response = await authenticatedApiCall(endGame, payload);
          if (response.isSuccess) {
            toast.success('Result submitted successfully');
            toast.success(`${response.gloryEarned} $GLORY earned`);
          } else {
            toast.error(response.response.data.message);
          }
        } catch (error) {
          // @ts-ignore
          toast.error('Something went wrong');
          decreaseLoadingCount(1);
          navigate('/');
        }
        decreaseLoadingCount(1);
        refreshUser();
        setIsGetgameFinished(true);
      });
    }
  }, [
    authenticatedApiCall,
    decreaseLoadingCount,
    hash,
    increaseLoadingCount,
    navigate,
    refreshUser,
    selectedNft,
  ]);

  return (
    <GameContainer>
      {hash ? (
        <Unity
          style={{ maxWidth: '1000px', maxHeight: '700px' }}
          className="webgl-canvas"
          unityContext={unityContext}
          matchWebGLToCanvasSize={true}
        />
      ) : null}
      {progression < 1 ? (
        <p>Loading...{Math.ceil(progression * 100)}%</p>
      ) : null}
      {isGameFinished ? (
        <>
          {!didDie ? (
            <Button
              style={{ marginTop: '16px' }}
              variant="contained"
              onClick={async () => {
                setHash('');
                setIsGetgameFinished(false);
                increaseLoadingCount(1);
                try {
                  const response = await authenticatedApiCall(
                    startGame,
                    selectedNft?.mint,
                    secondaryNfts
                  );
                  if (response.hash) {
                    setHash(response.hash);
                  } else {
                    toast.error(response.response.data.message);
                    navigate('/');
                  }
                } catch (error) {
                  toast.error('Something went wrong');
                  navigate('/');
                } finally {
                  decreaseLoadingCount(1);
                }
              }}
            >
              Play Again
            </Button>
          ) : null}
          <Button
            style={{ marginTop: '16px' }}
            variant={didDie ? 'contained' : 'outlined'}
            onClick={() => {
              resetSelections();
              navigate('/');
            }}
          >
            Back to dashboard
          </Button>
        </>
      ) : null}
    </GameContainer>
  );
};

export default Game;

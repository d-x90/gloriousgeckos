import { Button, styled } from '@mui/material';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Unity, { UnityContext } from 'react-unity-webgl';
import { useGlobal } from '../contexts/globalContext';

const unityContext = new UnityContext({
  loaderUrl: 'Unity_build/Unity_build.loader.js',
  dataUrl: 'Unity_build/Unity_build.data',
  frameworkUrl: 'Unity_build/Unity_build.framework.js',
  codeUrl: 'Unity_build/Unity_build.wasm',
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

  const { selectedNft } = useGlobal();
  const navigate = useNavigate();

  useEffect(() => {
    unityContext.on('progress', function (progression) {
      setProgression(progression);
    });

    unityContext.on('canvas', (canvas) => {
      canvas.width = 1000;
      canvas.height = 700;
    });

    unityContext.on('SceneLoaded', () => {
      unityContext.send('GameManager', 'StartGame', selectedNft?.image);
    });

    unityContext.on('GameOver', (success, score) => {
      console.log({ success, score });
    });
  }, [selectedNft?.image]);

  if (!selectedNft) {
    navigate('/');
  }

  return (
    <GameContainer>
      <Unity
        className="webgl-canvas"
        unityContext={unityContext}
        matchWebGLToCanvasSize={true}
      />
      {progression < 1 ? (
        <p>Loading...{Math.ceil(progression * 100)}%</p>
      ) : null}
      <Button variant="contained" onClick={() => navigate('/')}>
        Back to dashboard
      </Button>
    </GameContainer>
  );
};

export default Game;

import { Button } from '@mui/material';
import { WalletNotConnectedError } from '@solana/wallet-adapter-base';
import { useWallet } from '@solana/wallet-adapter-react';
import { FC, useCallback } from 'react';

const MessageSignerButton: FC<{
  onMessageSigned: (signature: number[]) => void;
}> = ({ onMessageSigned }) => {
  const { publicKey, signMessage } = useWallet();

  const onClick = useCallback(async () => {
    if (!publicKey) throw new WalletNotConnectedError();

    const encodedMessage = new TextEncoder().encode(
      'I am the owner of this wallet'
    );

    //@ts-ignore
    const signature = Array.from(await signMessage(encodedMessage));

    onMessageSigned(signature);
  }, [publicKey, signMessage, onMessageSigned]);

  return (
    <Button variant="outlined" onClick={onClick} disabled={!publicKey}>
      Verify wallet
    </Button>
  );
};

export default MessageSignerButton;

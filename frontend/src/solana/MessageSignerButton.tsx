import { Button, Tooltip } from '@mui/material';
import { WalletNotConnectedError } from '@solana/wallet-adapter-base';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import { useWallet } from '@solana/wallet-adapter-react';
import { FC, useCallback } from 'react';
import { toast } from 'react-toastify';

const MessageSignerButton: FC<{
  onMessageSigned: (signature: number[]) => void;
  isSigned: boolean;
}> = ({ onMessageSigned, isSigned }) => {
  const { publicKey, signMessage } = useWallet();

  const onClick = useCallback(async () => {
    if (!publicKey) toast.error('Please connect your wallet first');

    const encodedMessage = new TextEncoder().encode(
      'I am the owner of this wallet'
    );

    //@ts-ignore
    const signature = Array.from(await signMessage(encodedMessage));

    onMessageSigned(signature);
  }, [publicKey, signMessage, onMessageSigned]);

  return (
    <Button
      variant="outlined"
      color={isSigned ? 'success' : 'primary'}
      onClick={onClick}
    >
      {isSigned ? (
        <>
          Signed
          <CheckCircleRoundedIcon />
        </>
      ) : (
        'Verify wallet'
      )}
    </Button>
  );
};

export default MessageSignerButton;

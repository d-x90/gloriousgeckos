import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
} from '@mui/material';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useLoading } from '../contexts/loadingContext';
import { getLeaderBoard, signUpForContest } from '../requests/contestRequests';
import { useGlobal } from '../contexts/globalContext';
import { useWallet } from '@solana/wallet-adapter-react';
import { sendSolToWallet } from '../solana/solanaService';
import { useAuth } from '../contexts/authContext';

const LeaderBoard = () => {
  const { increaseLoadingCount, decreaseLoadingCount } = useLoading();

  const { authenticatedApiCall } = useAuth();

  const wallet = useWallet();

  const { user, refreshUser } = useGlobal();

  const [leaderboard, setLeaderboard] = useState<
    [{ username: string; bestScore: number }] | []
  >([]);

  useEffect(() => {
    (async () => {
      try {
        increaseLoadingCount(1);
        const response = await getLeaderBoard();
        setLeaderboard(response.leaderboard);
      } catch (e) {
        toast.error('Something went wrong.');
      } finally {
        decreaseLoadingCount(1);
      }
    })();
  }, [decreaseLoadingCount, increaseLoadingCount]);

  const onSignUp = useCallback(async () => {
    try {
      increaseLoadingCount(1);
      const signature = await sendSolToWallet(wallet, 0.05);
      decreaseLoadingCount(1);

      if (!signature) {
        return;
      }

      increaseLoadingCount(1);

      const response = await authenticatedApiCall(signUpForContest, signature);

      if (response.success) {
        toast.success('Signed up successfully');
        refreshUser();
      } else {
        toast.error(response.errorMessage);
      }
    } catch (e) {
      console.error(e);
      toast.error('Something went wrong');
    } finally {
      decreaseLoadingCount(1);
    }
  }, [
    authenticatedApiCall,
    decreaseLoadingCount,
    increaseLoadingCount,
    refreshUser,
    wallet,
  ]);

  return (
    <div
      style={{
        width: '100vw',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        position: 'relative',
      }}
    >
      <h1>🏆Leaderboard🏆</h1>
      <div
        style={{
          width: '75vw',
          height: '70vh',
          overflowY: 'scroll',
          overflowX: 'hidden',
          maxWidth: '1000px',
        }}
      >
        <TableContainer component={Paper}>
          <Table stickyHeader aria-label="simple table">
            <TableHead>
              <TableRow>
                <TableCell style={{ color: 'white', backgroundColor: 'black' }}>
                  Place
                </TableCell>
                <TableCell style={{ color: 'white', backgroundColor: 'black' }}>
                  Username
                </TableCell>
                <TableCell style={{ color: 'white', backgroundColor: 'black' }}>
                  Time
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {leaderboard.map((row, index) => (
                <TableRow
                  style={{
                    backgroundColor:
                      user?.username === row.username ? '#fff500' : '#ffffb0',
                  }}
                  key={row.username}
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
                  <TableCell component="th" scope="row">
                    {index + 1}.
                  </TableCell>
                  <TableCell component="th" scope="row">
                    {row.username}
                  </TableCell>
                  <TableCell>
                    {row.bestScore === null ? '-' : row.bestScore / 1000} sec
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </div>
      <Button
        onClick={onSignUp}
        disabled={user?.isSignedUp}
        variant="contained"
        style={{ marginTop: 16 }}
      >
        {user?.isSignedUp ? 'Signed up!' : 'Sign up for contest'}
      </Button>
    </div>
  );
};

export default LeaderBoard;

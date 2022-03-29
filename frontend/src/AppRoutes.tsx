import { Navigate, Route, Routes } from 'react-router-dom';
import StakingRewardCard from './components/StakingRewardCard';
import { useAuth } from './contexts/authContext';
import Dashboard from './pages/Dashboard';
import Game from './pages/Game';
import Info from './pages/info';
import Login from './pages/login';
import PasswordReset from './pages/PasswordReset';
import Register from './pages/register';
import StakingRewards from './pages/StakingRewards';

const AppRoutes = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      {isAuthenticated && <Route path="/" element={<Dashboard />} />}
      {isAuthenticated && <Route path="/game" element={<Game />} />}
      {isAuthenticated && (
        <Route path="/staking" element={<StakingRewards />} />
      )}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/password-reset" element={<PasswordReset />} />
      <Route path="/info" element={<Info />} />
      <Route
        path="*"
        element={<Navigate to={isAuthenticated ? '/' : '/login'} />}
      />
    </Routes>
  );
};

function Lootboxes() {
  return <h2>Lootboxes</h2>;
}

export default AppRoutes;

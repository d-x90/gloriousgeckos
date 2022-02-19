import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './contexts/authContext';
import Dashboard from './pages/Dashboard';
import Login from './pages/login';
import Register from './pages/register';

const AppRoutes = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      {isAuthenticated && <Route path="/" element={<Dashboard />} />}
      {isAuthenticated && <Route path="/lootboxes" element={<Lootboxes />} />}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
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

import { Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword'; // <-- 1. IMPORTA A PÁGINA ResetPassword
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Routes>

      {/* Rota Protegida */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      {/* Rotas Públicas */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      
      {/* 2. ADICIONA A ROTA ResetPassword (com token dinâmico) */}
      <Route path="/reset-password/:token" element={<ResetPassword />} /> 

    </Routes>
  );
}

export default App;
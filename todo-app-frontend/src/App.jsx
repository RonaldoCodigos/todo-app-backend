import { Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';

// 1. Importe o seu "porteiro"
import ProtectedRoute from './components/ProtectedRoute'; 

function App() {
  return (
    <Routes>
      
      {/* 2. Rota Protegida */}
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

    </Routes>
  );
}

export default App;

// Forçando atualização - 23/10/2025 19:45
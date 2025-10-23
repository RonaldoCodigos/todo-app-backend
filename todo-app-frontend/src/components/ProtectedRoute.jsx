import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

// "children" será o componente que queremos proteger (ex: <Dashboard />)
function ProtectedRoute({ children }) {
  
  // 1. Pega os dados do nosso "cérebro" (o Contexto)
  const { isAuthenticated, loading } = useAuth();

  // 2. Espera o contexto verificar o localStorage
  // (Isso impede que o usuário seja expulso antes de checarmos se ele tem um token)
  if (loading) {
    return <div>Carregando...</div>; 
  }

  // 3. A VERIFICAÇÃO:
  // Se o 'cérebro' diz que ele NÃO está autenticado...
  if (!isAuthenticated) {
    // ...redireciona ele para a página de login.
    // 'replace' impede que ele use o botão "voltar" do navegador
    return <Navigate to="/login" replace />;
  }

  // 4. Se ele passou por tudo, ele está autenticado.
  // Mostra a página que ele tentou acessar (o "children").
  return children;
}

export default ProtectedRoute;
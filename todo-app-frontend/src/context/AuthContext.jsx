// Em: src/context/AuthContext.jsx

import { createContext, useContext, useState, useEffect } from 'react';

// 1. Cria o "Contexto" (o cérebro)
const AuthContext = createContext();

// 2. Cria o "Provedor" (o componente que vai envolver o app)
export function AuthProvider({ children }) {
  const [userToken, setUserToken] = useState(null);
  const [loading, setLoading] = useState(true); // Para sabermos quando a verificação inicial terminou

  // 3. Efeito que roda UMA VEZ quando o app carrega
  useEffect(() => {
    // Tenta pegar o token que salvamos no localStorage (no Login/Registro)
    const token = localStorage.getItem('token');
    
    if (token) {
      setUserToken(token);
    }
    setLoading(false); // Termina a verificação
  }, []); // O [] vazio significa "rode só uma vez"

  // 4. Função para fazer Login
  // (Nossas páginas de Login/Registro vão chamar isso)
  const login = (token) => {
    localStorage.setItem('token', token);
    setUserToken(token);
  };

  // 5. Função para fazer Logout
  const logout = () => {
    localStorage.removeItem('token');
    setUserToken(null);
  };

  // 6. O valor que será compartilhado com TODOS os componentes
  const value = {
    userToken,
    login,
    logout,
    isAuthenticated: !!userToken, // !! (dupla negação) transforma o token (string) em um booleano (true/false)
    loading // Informa se ainda estamos carregando o token
  };

  // 7. Retorna o Provedor envolvendo os "filhos" (nosso app)
  // Só renderiza o app se não estiver carregando
  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

// 8. Hook customizado (um atalho para usar o contexto)
// Em vez de importar useContext(AuthContext) em todo lugar,
// vamos só importar useAuth()
export function useAuth() {
  return useContext(AuthContext);
}
import { useState } from 'react';
import apiClient from '../api/axiosConfig'; // Usa apiClient
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Importações do Material-UI
import { Container, Box, Typography, TextField, Button, Alert, Link } from '@mui/material';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    console.log("[Login.jsx] handleSubmit iniciado."); // Log Adicional

    try {
      // Lê a URL base do apiClient para confirmar
      const baseUrlUsed = apiClient.defaults.baseURL;
      console.log("[Login.jsx] apiClient baseURL:", baseUrlUsed); // Log Adicional
      const loginUrl = '/users/login'; // Endpoint relativo
      console.log("[Login.jsx] Tentando chamar:", `${baseUrlUsed}${loginUrl}`); // Log Adicional

      // Usa apiClient
      const response = await apiClient.post(loginUrl, {
        email: email,
        password: password
      });

      console.log('Login bem-sucedido:', response.data);
      login(response.data.token);
      navigate('/');

    } catch (err) {
      console.error('[Login.jsx] Erro no login:', err.response?.data?.message || err.message);
      console.error('[Login.jsx] Erro completo:', err);
      setError(err.response?.data?.message || 'Erro ao fazer login.');
    }
  };

  // O return com o JSX do Material UI continua o mesmo
  return (
    <Container component="main" maxWidth="xs">
        {/* ... (JSX igual ao anterior) ... */}
         <Box sx={{ marginTop: 8, display: 'flex', flexDirection: 'column', alignItems: 'center', }} >
           <Typography component="h1" variant="h5"> Login </Typography>
           <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
             {error && ( <Alert severity="error" sx={{ width: '100%', mb: 2 }}> {error} </Alert> )}
             <TextField margin="normal" required fullWidth id="email" label="Endereço de E-mail" name="email" autoComplete="email" autoFocus value={email} onChange={(e) => setEmail(e.target.value)} />
             <TextField margin="normal" required fullWidth name="password" label="Senha" type="password" id="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
             <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }} > Entrar </Button>
             <Link component={RouterLink} to="/register" variant="body2"> {"Não tem uma conta? Registre-se"} </Link>
           </Box>
         </Box>
    </Container>
  );
}
export default Login;
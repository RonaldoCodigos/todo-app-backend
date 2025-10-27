// Em: src/pages/Register.jsx
// VERSÃO FINAL (Usando apiClient)

import { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import apiClient from '../api/axiosConfig'; // Usa apiClient

// Importações do Material-UI
import { Container, Box, Typography, TextField, Button, Alert, Link } from '@mui/material';

function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError('Por favor, preencha todos os campos.');
      return;
    }

    try {
      // Usa apiClient
      const response = await apiClient.post('/users/register', {
        email: email,
        password: password
      });

      console.log('Usuário registrado:', response.data);
      login(response.data.token);
      navigate('/');

    } catch (err) {
      console.error('Erro no registro:', err.response?.data?.message);
      setError(err.response?.data?.message || 'Erro ao registrar.');
    }
  };

  // O JSX com Material-UI continua o mesmo
  return (
    <Container component="main" maxWidth="xs">
        {/* ... (JSX igual ao anterior) ... */}
        <Box sx={{ marginTop: 8, display: 'flex', flexDirection: 'column', alignItems: 'center', }} >
          <Typography component="h1" variant="h5"> Registrar Nova Conta </Typography>
          <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
            {error && ( <Alert severity="error" sx={{ width: '100%', mb: 2 }}> {error} </Alert> )}
            <TextField margin="normal" required fullWidth id="email" label="Endereço de E-mail" name="email" autoComplete="email" autoFocus value={email} onChange={(e) => setEmail(e.target.value)} />
            <TextField margin="normal" required fullWidth name="password" label="Senha (mínimo 6 caracteres)" type="password" id="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} />
            <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }} > Registrar </Button>
            <Link component={RouterLink} to="/login" variant="body2"> {"Já tem uma conta? Faça Login"} </Link>
          </Box>
        </Box>
    </Container>
  );
}
export default Register;
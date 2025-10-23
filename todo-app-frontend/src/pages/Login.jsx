import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link as RouterLink } from 'react-router-dom'; // Importa Link para navegação
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

    try {
      // 1. A URL agora aponta para o endpoint de LOGIN
      const response = await axios.post('http://localhost:3000/api/users/login', {
        email: email,
        password: password
      });

      console.log('Login bem-sucedido:', response.data);
      login(response.data.token); // Usa a função do 'cérebro'
      navigate('/'); // Redireciona para o Dashboard

    } catch (err) {
      console.error('Erro no login:', err.response?.data?.message);
      setError(err.response?.data?.message || 'Erro ao fazer login.');
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        {/* 2. Título da página mudou */}
        <Typography component="h1" variant="h5">
          Login
        </Typography>

        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
          
          {error && (
            <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
              {error}
            </Alert>
          )}

          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Endereço de E-mail"
            name="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Senha"
            type="password"
            id="password"
            autoComplete="current-password" // Mudou para "senha atual"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {/* 3. Texto do botão mudou */}
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
          >
            Entrar
          </Button>

          {/* 4. Link agora aponta para /register */}
          <Link component={RouterLink} to="/register" variant="body2">
            {"Não tem uma conta? Registre-se"}
          </Link>

        </Box>
      </Box>
    </Container>
  );
}

export default Login;
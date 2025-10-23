import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link as RouterLink } from 'react-router-dom'; // Importa Link para navegação
import { useAuth } from '../context/AuthContext';

// 1. Importações do Material-UI
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

    // Validação simples (o MUI 'required' já ajuda, mas é bom ter)
    if (!email || !password) {
      setError('Por favor, preencha todos os campos.');
      return;
    }

    try {
      const response = await axios.post('http://localhost:3000/api/users/register', {
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

  // 2. Este é o novo JSX com Material-UI
  return (
    // 'Container' centraliza o conteúdo e define uma largura máxima
    <Container component="main" maxWidth="xs">
      {/* 'Box' é um container genérico (pense <div>)
           Aqui, usamos para centralizar tudo verticalmente */}
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Typography component="h1" variant="h5">
          Registrar Nova Conta
        </Typography>

        {/* 'Box' usado como formulário */}
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
          
          {/* Mostra a mensagem de erro (se houver) */}
          {error && (
            <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
              {error}
            </Alert>
          )}

          {/* Campo de E-mail */}
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

          {/* Campo de Senha */}
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Senha (mínimo 6 caracteres)"
            type="password"
            id="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {/* Botão de Envio */}
          <Button
            type="submit"
            fullWidth
            variant="contained" // Define o estilo "preenchido"
            sx={{ mt: 3, mb: 2 }} // Margem
          >
            Registrar
          </Button>

          {/* Link para a página de Login */}
          <Link component={RouterLink} to="/login" variant="body2">
            {"Já tem uma conta? Faça Login"}
          </Link>

        </Box>
      </Box>
    </Container>
  );
}

export default Register;
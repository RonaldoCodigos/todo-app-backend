import { useState } from 'react';
import apiClient from '../api/axiosConfig';
import { Link as RouterLink } from 'react-router-dom';

// Importações do Material-UI
import { Container, Box, Typography, TextField, Button, Alert, Link, CircularProgress } from '@mui/material';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState(''); // Para mostrar sucesso ou erro
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      // Chama a API que criamos no back-end
      const response = await apiClient.post('/users/forgot-password', { email });

      setMessage(response.data.message || 'Se o e-mail estiver cadastrado, um link de redefinição foi logado no servidor.'); // Mostra a mensagem de sucesso

    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao solicitar redefinição.');
      console.error('Erro forgot password:', err);
    } finally {
      setLoading(false);
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
        <Typography component="h1" variant="h5">
          Redefinir Senha
        </Typography>
        <Typography variant="body2" sx={{ mt: 1, mb: 2 }}>
          Digite seu e-mail para receber o link de redefinição.
        </Typography>

        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1, width: '100%' }}>

          {/* Mostra mensagem de sucesso OU erro */}
          {message && <Alert severity="success" sx={{ width: '100%', mb: 2 }}>{message}</Alert>}
          {error && <Alert severity="error" sx={{ width: '100%', mb: 2 }}>{error}</Alert>}

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
            disabled={loading || !!message} // Desabilita se estiver carregando ou se já deu sucesso
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={loading || !!message} // Desabilita se estiver carregando ou se já deu sucesso
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Enviar Link'}
          </Button>

          <Link component={RouterLink} to="/login" variant="body2">
            {"Voltar para Login"}
          </Link>
        </Box>
      </Box>
    </Container>
  );
}

export default ForgotPassword;
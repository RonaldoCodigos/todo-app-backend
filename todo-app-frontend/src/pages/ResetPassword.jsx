import { useState, useEffect } from 'react';
import apiClient from '../api/axiosConfig';
import { useNavigate, useParams, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Para logar após o reset

// Importações do Material-UI
import { Container, Box, Typography, TextField, Button, Alert, Link, CircularProgress, InputAdornment, IconButton } from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth(); // Pega a função de login

  // 1. Hook para ler parâmetros da URL (o token)
  const { token } = useParams(); 

  // Estados e funções para visualizar senha (igual ao Login/Register)
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const handleClickShowPassword = () => setShowPassword((show) => !show);
  const handleMouseDownPassword = (event) => event.preventDefault();
  const handleClickShowConfirmPassword = () => setShowConfirmPassword((show) => !show);
  const handleMouseDownConfirmPassword = (event) => event.preventDefault();

  // Verifica se o token existe na URL ao carregar
  useEffect(() => {
    if (!token) {
      setError('Token de redefinição inválido ou ausente.');
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    // 2. Validação: senhas coincidem?
    if (password !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }
    // Validação: senha tem 6+ caracteres? (O back-end também valida, mas é bom ter no front)
    if (password.length < 6) {
        setError('A senha deve ter no mínimo 6 caracteres.');
        return;
    }
    if (!token) {
        setError('Token de redefinição inválido ou ausente.');
        return;
    }

    setLoading(true);

    try {
      // 3. Chama a API PATCH do back-end, passando o token na URL
      const response = await apiClient.patch(`/users/reset-password/${token}`, { 
        password: password // Envia apenas a nova senha no corpo
      });
      
      setMessage(response.data.message || 'Senha redefinida com sucesso!');
      
      // 4. Opcional: Loga o usuário automaticamente com o token de login retornado
      if (response.data.token) {
        login(response.data.token);
      }

      // 5. Redireciona para o Dashboard após um pequeno atraso
      setTimeout(() => {
        navigate('/');
      }, 3000); // Espera 3 segundos para o usuário ler a mensagem

    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao redefinir a senha.');
      console.error('Erro reset password:', err);
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
          Digite sua Nova Senha
        </Typography>
        
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1, width: '100%' }}>
          
          {/* Mostra mensagem de sucesso OU erro */}
          {message && <Alert severity="success" sx={{ width: '100%', mb: 2 }}>{message}</Alert>}
          {error && <Alert severity="error" sx={{ width: '100%', mb: 2 }}>{error}</Alert>}

          {/* Campo Nova Senha */}
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Nova Senha"
            type={showPassword ? 'text' : 'password'}
            id="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading || !!message} // Desabilita se carregando ou sucesso
            InputProps={{
              endAdornment: ( <InputAdornment position="end"> <IconButton aria-label="toggle password visibility" onClick={handleClickShowPassword} onMouseDown={handleMouseDownPassword} edge="end"> {showPassword ? <VisibilityOff /> : <Visibility />} </IconButton> </InputAdornment> ),
            }}
          />

          {/* Campo Confirmar Nova Senha */}
          <TextField
            margin="normal"
            required
            fullWidth
            name="confirmPassword"
            label="Confirmar Nova Senha"
            type={showConfirmPassword ? 'text' : 'password'}
            id="confirmPassword"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={loading || !!message}
            InputProps={{
              endAdornment: ( <InputAdornment position="end"> <IconButton aria-label="toggle confirm password visibility" onClick={handleClickShowConfirmPassword} onMouseDown={handleMouseDownConfirmPassword} edge="end"> {showConfirmPassword ? <VisibilityOff /> : <Visibility />} </IconButton> </InputAdornment> ),
            }}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={loading || !!message}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Redefinir Senha'}
          </Button>

          {/* Link opcional para voltar ao Login se o usuário desistir */}
          {!message && ( // Só mostra se ainda não deu sucesso
             <Link component={RouterLink} to="/login" variant="body2">
               {"Voltar para Login"}
             </Link>
          )}

        </Box>
      </Box>
    </Container>
  );
}

export default ResetPassword;
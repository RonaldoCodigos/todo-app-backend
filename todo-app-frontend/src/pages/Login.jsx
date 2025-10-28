import { useState, useEffect } from 'react';
import apiClient from '../api/axiosConfig';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Importações do Material-UI
import { Container, Box, Typography, TextField, Button, Alert, Link, InputAdornment, IconButton, FormControlLabel, Checkbox } from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

const REMEMBER_ME_KEY = 'rememberedEmail';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  useEffect(() => {
    const rememberedEmail = localStorage.getItem(REMEMBER_ME_KEY);
    if (rememberedEmail) {
      setEmail(rememberedEmail);
      setRememberMe(true);
    }
  }, []);

  const handleClickShowPassword = () => setShowPassword((show) => !show);
  const handleMouseDownPassword = (event) => event.preventDefault();
  const handleRememberMeChange = (event) => {
    setRememberMe(event.target.checked);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const response = await apiClient.post('/users/login', { email, password });
      if (rememberMe) {
        localStorage.setItem(REMEMBER_ME_KEY, email);
      } else {
        localStorage.removeItem(REMEMBER_ME_KEY);
      }
      login(response.data.token);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao fazer login.');
      console.error('Erro no login:', err);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box sx={{ marginTop: 8, display: 'flex', flexDirection: 'column', alignItems: 'center', }} >
        <Typography component="h1" variant="h5"> Login </Typography>
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
          {error && ( <Alert severity="error" sx={{ width: '100%', mb: 2 }}> {error} </Alert> )}
          <TextField margin="normal" required fullWidth id="email" label="Endereço de E-mail" name="email" autoComplete="email" autoFocus value={email} onChange={(e) => setEmail(e.target.value)} />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Senha"
            type={showPassword ? 'text' : 'password'}
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            InputProps={{
              endAdornment: ( <InputAdornment position="end"> <IconButton aria-label="toggle password visibility" onClick={handleClickShowPassword} onMouseDown={handleMouseDownPassword} edge="end"> {showPassword ? <VisibilityOff /> : <Visibility />} </IconButton> </InputAdornment> ),
            }}
          />
          <FormControlLabel
            control={<Checkbox value="remember" color="primary" checked={rememberMe} onChange={handleRememberMeChange} />}
            label="Lembrar meu e-mail"
          />
          <Typography variant="caption" display="block" gutterBottom sx={{ mt: 1, textAlign: 'center', color: 'text.secondary' }}>
            Sua sessão permanecerá ativa por 30 dias.
          </Typography>

          {/* === ADICIONADO LINK "ESQUECEU A SENHA?" === */}
          <Box sx={{ textAlign: 'right', width: '100%', mt: 1 }}>
            <Link component={RouterLink} to="/forgot-password" variant="body2">
              Esqueceu a senha?
            </Link>
          </Box>
          {/* === FIM DA ADIÇÃO === */}

          <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }} > Entrar </Button>

          {/* Link para Registro */}
          <Link component={RouterLink} to="/register" variant="body2" sx={{ textAlign: 'center', display: 'block' }}>
            {"Não tem uma conta? Registre-se"}
          </Link>

        </Box>
      </Box>
    </Container>
  );
}
export default Login;
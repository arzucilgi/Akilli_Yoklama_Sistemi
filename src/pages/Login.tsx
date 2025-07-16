import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Typography,
  Link,
  IconButton,
  InputAdornment,
  CircularProgress,
  Alert
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { signInWithEmail } from '../services/authService';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!email || !password) {
        throw new Error('Lütfen tüm alanları doldurunuz');
      }

      await signInWithEmail(email, password);

      navigate('/dashboard'); // başarılı giriş sonrası yönlendirme
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Giriş başarısız');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100dvh',
        width:'100%',
        position: 'relative',
      }}
    >
      <Card sx={{ maxWidth: 450, width: '100%' }}>
        <CardContent>
          <Typography variant="h4" component="h1" align="center" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
            Yoklama Takip Sistemi
          </Typography>

          <Typography variant="body1" align="center" color="text.secondary" sx={{ mb: 4 }}>
            Lütfen hesap bilgilerinizle giriş yapın
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              label="Email"
              variant="outlined"
              fullWidth
              margin="normal"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              InputProps={{
                placeholder: 'example@school.edu.tr'
              }}
            />

            <TextField
              label="Şifre"
              variant="outlined"
              fullWidth
              margin="normal"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />


            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{ mt: 3, mb: 2, py: 1.5 }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Giriş Yap'}
            </Button>
          </form>

          <Typography variant="body2" align="center" sx={{ mt: 3 }}>
            Hesabınız yok mu?{' '}
            <Link href="/register" underline="hover" fontWeight="bold">
              Kayıt Olun
            </Link>
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default LoginPage;

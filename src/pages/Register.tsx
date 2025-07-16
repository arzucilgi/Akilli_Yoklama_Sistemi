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
  CircularProgress,
  Alert
} from '@mui/material';
import { signUpWithEmail } from '../services/authService';  // Kendi servis fonksiyonun

const RegisterPage = () => {
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!name || !surname || !email || !password) {
        throw new Error('Lütfen tüm alanları doldurunuz');
      }

      await signUpWithEmail({ name, surname, email, password });

      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kayıt başarısız');
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
        height: '100vh',
        width: '100vw',
      }}
    >
      <Card sx={{ maxWidth: 450, width: '100%' }}>
        <CardContent>
          <Typography variant="h4" component="h1" align="center" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
            Kayıt Ol
          </Typography>

          <Typography variant="body1" align="center" color="text.secondary" sx={{ mb: 4 }}>
            Yeni bir hesap oluşturmak için bilgilerinizi girin
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              label="İsim"
              variant="outlined"
              fullWidth
              margin="normal"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Adınız"
            />

            <TextField
              label="Soyisim"
              variant="outlined"
              fullWidth
              margin="normal"
              value={surname}
              onChange={(e) => setSurname(e.target.value)}
              required
              placeholder="Soyadınız"
            />

            <TextField
              label="Email"
              variant="outlined"
              fullWidth
              margin="normal"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="example@school.edu.tr"
            />

            <TextField
              label="Şifre"
              variant="outlined"
              fullWidth
              margin="normal"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Şifrenizi girin"
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{ mt: 3, mb: 2, py: 1.5 }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Kayıt Ol'}
            </Button>
          </form>

          <Typography variant="body2" align="center" sx={{ mt: 3 }}>
            Zaten hesabınız var mı?{' '}
            <Link href="/" underline="hover" fontWeight="bold">
              Giriş Yapın
            </Link>
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default RegisterPage;

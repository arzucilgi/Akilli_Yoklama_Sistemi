// TeacherProfile.tsx
import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  Avatar,
  Typography,
  CircularProgress,
  Alert,
  Divider,
  Button,
} from '@mui/material';
import { getCurrentUserProfile } from '../services/authService'; // servis fonksiyonunu sen yazacaksın

const TeacherProfile: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await getCurrentUserProfile(); // Supabase'den kullanıcı verisini al
        setUser(res);
      } catch (err) {
        setError('Profil bilgileri alınamadı.');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Card
      sx={{
        maxWidth: 600,
        mx: 'auto',
        my: 8,
        p: 4,
        borderRadius: 3,
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        backgroundColor: '#f9f9f9',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 3 }}>
        <Avatar
          src={user.profile_image || ''}
          sx={{ width: 80, height: 80, bgcolor: '#1976d2' }}
        >
          {user.name?.charAt(0)}
        </Avatar>
        <Box>
          <Typography variant="h5" fontWeight="bold">
            {user.name}
          </Typography>
          <Typography color="text.secondary">{user.email}</Typography>
        </Box>
      </Box>

      <Divider sx={{ my: 2 }} />

      <Box sx={{ mb: 2 }}>
        <Typography variant="body1">
          <strong>Branş:</strong> {user.department || 'Belirtilmemiş'}
        </Typography>
        <Typography variant="body1">
          <strong>Kullanıcı ID:</strong> {user.id}
        </Typography>
        <Typography variant="body1">
          <strong>Kayıt Tarihi:</strong>{' '}
          {new Date(user.created_at).toLocaleDateString()}
        </Typography>
      </Box>

      <Divider sx={{ my: 2 }} />

      <Box sx={{ mt: 2 }}>
        <Button variant="contained" color="primary">
          Profili Düzenle
        </Button>
      </Box>
    </Card>
  );
};

export default TeacherProfile;

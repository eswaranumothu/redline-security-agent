import React, { useState } from 'react';
import {
  Box,
  Button,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
  Paper,
  Alert,
  CircularProgress,
  Link,
} from '@mui/material';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import PersonAddOutlinedIcon from '@mui/icons-material/PersonAddOutlined';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../api/auth';
import { RedGridBackground } from '../components/common/RedGridBackground';
import { C } from '../theme';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { setAuthFromToken } = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password || !confirmPassword) {
      setError('Please fill out all fields.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 4) {
      setError('Password must be at least 4 characters long.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const res = await authApi.register(username, password, confirmPassword);
      setAuthFromToken(res.access_token, res.user);
      navigate('/');
    } catch (err: any) {
      if (!err.response) {
        setError('Cannot connect to backend server. Please verify FastAPI backend is running on port 8000.');
      } else {
        setError(err.response?.data?.detail || 'Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        height: '100vh',
        width: '100vw',
        bgcolor: '#06070a',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <RedGridBackground />

      {/* Left Panel */}
      <Box
        sx={{
          flex: { xs: 0, md: '0 0 44%' },
          display: { xs: 'none', md: 'flex' },
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'flex-start',
          px: 6,
          py: 4,
          color: C.white,
          position: 'relative',
          borderRight: `1px solid ${C.border}`,
        }}
      >
        <Box sx={{ mb: 3 }}>
          <Typography variant="h3" sx={{ fontWeight: 900, color: '#FFFFFF', letterSpacing: '0.04em', lineHeight: 1 }}>
            RED<Box component="span" sx={{ color: C.redBright }}>LINE</Box>
          </Typography>
          <Typography variant="caption" sx={{ color: C.redBright, fontWeight: 700, letterSpacing: '0.12em', display: 'block', mt: 0.5 }}>
            SECURITY THAT REMEMBERS
          </Typography>
        </Box>

        <Typography
          variant="h4"
          sx={{
            fontWeight: 800,
            color: '#FFFFFF',
            mb: 1.5,
            letterSpacing: '-0.02em',
            fontSize: '1.75rem',
            lineHeight: 1.2,
          }}
        >
          Create Your Account
        </Typography>

        <Box
          sx={{
            width: 56,
            height: 3,
            borderRadius: 2,
            bgcolor: C.redBright,
            mb: 2.5,
          }}
        />

        <Typography
          variant="body2"
          sx={{
            color: C.muted,
            maxWidth: 420,
            lineHeight: 1.7,
            fontSize: '0.9rem',
          }}
        >
          Register to access all features of REDLINE VAPT platform. Complete access is granted to all registered users.
        </Typography>
      </Box>

      {/* Right Panel */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          px: { xs: 2, sm: 4 },
          py: 2,
        }}
      >
        <Paper
          elevation={0}
          sx={{
            width: '100%',
            maxWidth: 400,
            p: { xs: 3, sm: 4 },
            borderRadius: 3,
            bgcolor: C.bg1,
            border: `1px solid ${C.border}`,
            boxShadow: '0 20px 50px -12px rgba(0,0,0,.85)',
          }}
        >
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 800,
                color: '#FFFFFF',
                mb: 0.5,
                fontSize: '1.5rem',
              }}
            >
              REDLINE Register
            </Typography>
            <Typography variant="body2" sx={{ color: C.muted, fontSize: '0.85rem' }}>
              Create new account to access security workspace
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2.5, borderRadius: 2, py: 0.5, bgcolor: 'rgba(239, 68, 68, 0.15)', color: '#FCA5A5', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <Box sx={{ mb: 2 }}>
              <Typography
                variant="subtitle2"
                sx={{ fontWeight: 600, color: C.white, mb: 0.5, fontSize: '0.8rem' }}
              >
                Username
              </Typography>
              <TextField
                fullWidth
                size="small"
                variant="outlined"
                placeholder="Enter username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonOutlinedIcon sx={{ color: C.muted, fontSize: 20 }} />
                      </InputAdornment>
                    ),
                  },
                }}
              />
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography
                variant="subtitle2"
                sx={{ fontWeight: 600, color: C.white, mb: 0.5, fontSize: '0.8rem' }}
              >
                Password
              </Typography>
              <TextField
                fullWidth
                size="small"
                type={showPassword ? 'text' : 'password'}
                variant="outlined"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockOutlinedIcon sx={{ color: C.muted, fontSize: 20 }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                          size="small"
                        >
                          {showPassword ? (
                            <VisibilityOff sx={{ color: C.muted, fontSize: 20 }} />
                          ) : (
                            <Visibility sx={{ color: C.muted, fontSize: 20 }} />
                          )}
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
              />
            </Box>

            <Box sx={{ mb: 2.5 }}>
              <Typography
                variant="subtitle2"
                sx={{ fontWeight: 600, color: C.white, mb: 0.5, fontSize: '0.8rem' }}
              >
                Confirm Password
              </Typography>
              <TextField
                fullWidth
                size="small"
                type={showConfirmPassword ? 'text' : 'password'}
                variant="outlined"
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockOutlinedIcon sx={{ color: C.muted, fontSize: 20 }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          edge="end"
                          size="small"
                        >
                          {showConfirmPassword ? (
                            <VisibilityOff sx={{ color: C.muted, fontSize: 20 }} />
                          ) : (
                            <Visibility sx={{ color: C.muted, fontSize: 20 }} />
                          )}
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
              />
            </Box>

            <Button
              fullWidth
              type="submit"
              variant="contained"
              disabled={loading}
              sx={{
                py: 1.1,
                bgcolor: C.redBright,
                color: '#FFFFFF',
                '&:hover': { bgcolor: C.red },
                fontSize: '0.95rem',
                fontWeight: 700,
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 1,
                mb: 2,
              }}
            >
              {loading ? (
                <CircularProgress size={22} color="inherit" />
              ) : (
                <>
                  <PersonAddOutlinedIcon sx={{ fontSize: 18 }} />
                  Register Account
                </>
              )}
            </Button>
          </form>

          <Box sx={{ textAlign: 'center', mt: 1 }}>
            <Typography variant="body2" sx={{ color: C.muted, fontSize: '0.8rem' }}>
              Already have an account?{' '}
              <Link
                component="button"
                variant="body2"
                onClick={() => navigate('/login')}
                sx={{ color: C.redBright, fontWeight: 600, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
              >
                Sign In
              </Link>
            </Typography>
          </Box>
        </Paper>

        <Typography
          variant="caption"
          sx={{
            mt: 3,
            color: C.muted,
            fontSize: '0.75rem',
            textAlign: 'center',
          }}
        >
          REDLINE — Security That Remembers © 2026
        </Typography>
      </Box>
    </Box>
  );
};

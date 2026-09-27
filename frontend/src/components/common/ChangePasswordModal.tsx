import React, { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, Alert, CircularProgress,
} from '@mui/material';
import LockResetIcon from '@mui/icons-material/LockReset';
import { usersApi } from '../../api/users';
import { useAuth } from '../../context/AuthContext';

interface Props {
  open: boolean;
}

/**
 * Shown when the logged-in user has must_change_password = true.
 * The dialog is non-dismissable — user must set a new password before
 * accessing any other part of the application.
 */
export const ChangePasswordModal: React.FC<Props> = ({ open }) => {
  const { logout } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters.');
      return;
    }
    if (newPassword !== confirm) {
      setError('Passwords do not match.');
      return;
    }

    try {
      setLoading(true);
      await usersApi.changePassword(currentPassword, newPassword);
      setSuccess(true);
      // Brief pause then reload so the token / user state refreshes cleanly
      setTimeout(() => {
        logout();
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.detail ?? 'Failed to change password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5, fontWeight: 700 }}>
        <LockResetIcon sx={{ color: '#ef4444' }} />
        Change Your Password
      </DialogTitle>

      {success ? (
        <DialogContent>
          <Alert severity="success" sx={{ borderRadius: 2 }}>
            Password changed successfully! You will be logged out to apply the changes.
          </Alert>
        </DialogContent>
      ) : (
        <form onSubmit={handleSubmit}>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Alert severity="warning" sx={{ borderRadius: 2 }}>
              You must set a new password before accessing the application.
            </Alert>

            {error && (
              <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>
            )}

            <TextField
              label="Current (Temporary) Password"
              type="password"
              required
              fullWidth
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
            <TextField
              label="New Password"
              type="password"
              required
              fullWidth
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              helperText="Minimum 8 characters"
            />
            <TextField
              label="Confirm New Password"
              type="password"
              required
              fullWidth
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />
          </DialogContent>

          <DialogActions sx={{ p: 2.5, justifyContent: 'space-between' }}>
            <Button onClick={logout} color="inherit" size="small">
              Logout instead
            </Button>
            <Button type="submit" variant="contained" disabled={loading}
              startIcon={loading ? <CircularProgress size={18} color="inherit" /> : undefined}
              sx={{ bgcolor: '#dc2626', '&:hover': { bgcolor: '#ef4444' } }}>
              {loading ? 'Changing…' : 'Set New Password'}
            </Button>
          </DialogActions>
        </form>
      )}
    </Dialog>
  );
};

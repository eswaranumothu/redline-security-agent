import React, { useState } from 'react';
import {
  Box, Typography, Paper, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Chip, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, MenuItem, IconButton,
  Tooltip, Alert, Switch, FormControlLabel,
} from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import EditIcon from '@mui/icons-material/Edit';
import PersonOffIcon from '@mui/icons-material/PersonOff';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi } from '../api/users';
import type { UserItem, UserCreate, UserUpdate } from '../api/users';
import { C } from '../theme';

export const UsersPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserItem | null>(null);
  const [createError, setCreateError] = useState('');
  const [editError, setEditError] = useState('');

  const [createForm, setCreateForm] = useState<UserCreate>({
    full_name: '', email: '', role: 'AUDITOR', password: '',
  });

  const [editForm, setEditForm] = useState<UserUpdate>({
    full_name: '', role: 'AUDITOR', is_active: true,
  });

  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: usersApi.list,
  });

  const createMutation = useMutation({
    mutationFn: usersApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setOpenCreateModal(false);
      setCreateForm({ full_name: '', email: '', role: 'AUDITOR', password: '' });
      setCreateError('');
    },
    onError: (err: any) => {
      setCreateError(err.response?.data?.detail ?? 'Failed to create user.');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UserUpdate }) =>
      usersApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setOpenEditModal(false);
      setSelectedUser(null);
      setEditError('');
    },
    onError: (err: any) => {
      setEditError(err.response?.data?.detail ?? 'Failed to update user.');
    },
  });

  const deactivateMutation = useMutation({
    mutationFn: (id: number) => usersApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError('');
    createMutation.mutate(createForm);
  };

  const handleEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    setEditError('');
    updateMutation.mutate({ id: selectedUser.id, data: editForm });
  };

  const openEdit = (u: UserItem) => {
    setSelectedUser(u);
    setEditForm({ full_name: u.full_name, role: u.role, is_active: u.is_active });
    setEditError('');
    setOpenEditModal(true);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800 }}>User Management</Typography>
          <Typography variant="body2" sx={{ color: C.muted }}>
            Manage team accounts, assign roles, and control access
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<PersonAddIcon />}
          onClick={() => { setCreateForm({ full_name: '', email: '', role: 'AUDITOR', password: '' }); setCreateError(''); setOpenCreateModal(true); }}
          sx={{ bgcolor: C.redDark, borderRadius: '10px', '&:hover': { bgcolor: C.red } }}>
          Add New User
        </Button>
      </Box>

      <TableContainer component={Paper} elevation={0} sx={{ borderRadius: '12px' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>Full Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Password</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4, color: C.muted }}>
                  No users found.
                </TableCell>
              </TableRow>
            ) : (
              users.map((u) => (
                <TableRow key={u.id} hover sx={{ opacity: u.is_active ? 1 : 0.55 }}>
                  <TableCell sx={{ fontWeight: 700 }}>{u.full_name}</TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>
                    <Chip label={u.role} size="small"
                      sx={{
                        bgcolor: u.role === 'ADMIN' ? `${C.red}22` : `${C.redDark}22`,
                        color: u.role === 'ADMIN' ? C.redBright : C.white,
                        border: `1px solid ${C.border}`,
                        fontWeight: 700,
                      }} />
                  </TableCell>
                  <TableCell>
                    <Chip label={u.is_active ? 'Active' : 'Inactive'} size="small"
                      sx={{
                        bgcolor: u.is_active ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                        color: u.is_active ? '#10B981' : C.redBright,
                        fontWeight: 600,
                      }} />
                  </TableCell>
                  <TableCell>
                    {u.must_change_password ? (
                      <Chip label="Must Change" size="small"
                        sx={{ bgcolor: 'rgba(245,158,11,0.1)', color: '#D97706', fontWeight: 600 }} />
                    ) : (
                      <Chip label="Set" size="small" variant="outlined" sx={{ color: C.muted }} />
                    )}
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Edit User">
                      <IconButton size="small" onClick={() => openEdit(u)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    {u.is_active && (
                      <Tooltip title="Deactivate User">
                        <IconButton size="small" color="error"
                          onClick={() => { if (confirm(`Deactivate "${u.full_name}"?`)) deactivateMutation.mutate(u.id); }}>
                          <PersonOffIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Create User Modal */}
      <Dialog open={openCreateModal} onClose={() => setOpenCreateModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Add New Team User</DialogTitle>
        <form onSubmit={handleCreate}>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {createError && <Alert severity="error" sx={{ borderRadius: 2 }}>{createError}</Alert>}
            <TextField label="Full Name" required fullWidth value={createForm.full_name}
              onChange={(e) => setCreateForm({ ...createForm, full_name: e.target.value })} />
            <TextField label="Email Address" type="email" required fullWidth value={createForm.email}
              onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })} />
            <TextField select fullWidth label="Role" value={createForm.role}
              onChange={(e) => setCreateForm({ ...createForm, role: e.target.value as 'ADMIN' | 'AUDITOR' })}>
              <MenuItem value="AUDITOR">Auditor</MenuItem>
              <MenuItem value="ADMIN">Admin</MenuItem>
            </TextField>
            <TextField label="Initial Password" type="password" required fullWidth value={createForm.password}
              onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
              helperText="User will be prompted to change this on first login." />
          </DialogContent>
          <DialogActions sx={{ p: 2.5 }}>
            <Button onClick={() => setOpenCreateModal(false)}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={createMutation.isPending} sx={{ bgcolor: C.redDark, '&:hover': { bgcolor: C.red } }}>
              {createMutation.isPending ? 'Creating…' : 'Create User'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Edit User Modal */}
      <Dialog open={openEditModal} onClose={() => setOpenEditModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Edit User — {selectedUser?.full_name}</DialogTitle>
        <form onSubmit={handleEdit}>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {editError && <Alert severity="error" sx={{ borderRadius: 2 }}>{editError}</Alert>}
            <TextField label="Full Name" required fullWidth value={editForm.full_name ?? ''}
              onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })} />
            <TextField select fullWidth label="Role" value={editForm.role ?? 'AUDITOR'}
              onChange={(e) => setEditForm({ ...editForm, role: e.target.value as 'ADMIN' | 'AUDITOR' })}>
              <MenuItem value="AUDITOR">Auditor</MenuItem>
              <MenuItem value="ADMIN">Admin</MenuItem>
            </TextField>
            <FormControlLabel
              control={
                <Switch checked={editForm.is_active ?? true}
                  onChange={(e) => setEditForm({ ...editForm, is_active: e.target.checked })} />
              }
              label={editForm.is_active ? 'Account Active' : 'Account Inactive'}
            />
          </DialogContent>
          <DialogActions sx={{ p: 2.5 }}>
            <Button onClick={() => setOpenEditModal(false)}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={updateMutation.isPending} sx={{ bgcolor: C.redDark, '&:hover': { bgcolor: C.red } }}>
              {updateMutation.isPending ? 'Saving…' : 'Save Changes'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

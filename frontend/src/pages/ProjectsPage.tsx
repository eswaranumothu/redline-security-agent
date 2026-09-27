import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Paper, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Chip, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, MenuItem, IconButton,
  Tooltip, CircularProgress, Alert,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import DeleteIcon from '@mui/icons-material/Delete';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  projectsApi, PROJECT_TYPES, PROJECT_STATUSES,
  getProjectTypeLabel, getProjectStatusLabel,
} from '../api/projects';
import type { ProjectCreate, ProjectUpdate } from '../api/projects';
import { reportsApi } from '../api/reports';
import { usersApi } from '../api/users';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { C } from '../theme';

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  DRAFT:       { bg: 'rgba(107,140,174,0.12)', color: '#6b8cae' },
  STAGE1:      { bg: 'rgba(0,200,150,0.12)',   color: '#00c896' },
};

const defaultCreate = (): ProjectCreate => ({
  project_name: '', client_name: '', application_name: '',
  application_url: '', project_type: 'WEB', description: '', scope: '',
  ip_address: '', operating_system: '', language: '', web_server: '', ports_scanned: '',
  start_date: new Date().toISOString().split('T')[0],
  end_date: '', status: 'DRAFT', assigned_to: undefined,
});

export const ProjectsPage: React.FC<{ myOnly?: boolean }> = ({ myOnly = false }) => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const { user, isAdmin } = useAuth();

  // ── Create modal ──────────────────────────────────────────────────────────
  const [openCreate, setOpenCreate] = useState(false);
  const [createForm, setCreateForm] = useState<ProjectCreate>(defaultCreate());
  const [createError, setCreateError] = useState('');

  // Dashboard links to /my-projects?new=true so the create form opens directly.
  useEffect(() => {
    if (searchParams.get('new') !== 'true') return;

    setCreateForm(defaultCreate());
    setCreateError('');
    setOpenCreate(true);
    setSearchParams({}, { replace: true });
  }, [searchParams, setSearchParams]);

  // ── Edit modal ────────────────────────────────────────────────────────────
  const [editTarget, setEditTarget] = useState<{ id: number } & ProjectUpdate | null>(null);
  const [editError, setEditError] = useState('');

  // ── PDF preview dialog ────────────────────────────────────────────────────
  const [pdfState, setPdfState] = useState<{
    loading: boolean;
    blobUrl: string | null;
    projectCode: string;
    projectId: number;
  } | null>(null);

  // ── Delete confirmation ───────────────────────────────────────────────────
  const [deleteTarget, setDeleteTarget] = useState<{
    id: number; project_name: string; created_by: number; created_by_name?: string;
  } | null>(null);

  // ── Queries ───────────────────────────────────────────────────────────────
  const { data: rawAllProjects } = useQuery({
    queryKey: ['projects'],
    queryFn: projectsApi.list,
  });

  const allProjects = Array.isArray(rawAllProjects) ? rawAllProjects : [];


  const projects = (myOnly && !isAdmin)
    ? [...allProjects]
        .filter((p) => String(p.created_by) === String(user?.id) || String(p.assigned_to) === String(user?.id))
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    : allProjects;

  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: usersApi.list,
    enabled: isAdmin,
  });
  const auditors = users.filter((u) => u.role === 'AUDITOR' && u.is_active);

  // ── Mutations ─────────────────────────────────────────────────────────────
  const createMutation = useMutation({
    mutationFn: projectsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      setOpenCreate(false);
      setCreateForm(defaultCreate());
      setCreateError('');
    },
    onError: (err: any) => setCreateError(err.response?.data?.detail ?? 'Failed to create project.'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: ProjectUpdate }) => projectsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      setEditTarget(null);
      setEditError('');
    },
    onError: (err: any) => setEditError(err.response?.data?.detail ?? 'Failed to update project.'),
  });

  const deleteMutation = useMutation({
    mutationFn: projectsApi.delete,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['projects'] }),
    onError: (err: any) => alert(err.response?.data?.detail ?? 'Failed to delete project.'),
  });

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError('');
    createMutation.mutate({
      ...createForm,
      application_url: createForm.application_url || undefined,
      ip_address: createForm.ip_address || undefined,
      operating_system: createForm.operating_system || undefined,
      language: createForm.language || undefined,
      web_server: createForm.web_server || undefined,
      ports_scanned: createForm.ports_scanned || undefined,
      end_date: createForm.end_date || undefined,
      description: createForm.description || undefined,
      scope: createForm.scope || undefined,
      assigned_to: createForm.assigned_to || undefined,
    });
  };

  const openEditModal = (e: React.MouseEvent, project: typeof allProjects[0]) => {
    e.stopPropagation();
    setEditTarget({
      id: project.id,
      project_name: project.project_name,
      client_name: project.client_name,
      application_name: project.application_name,
      application_url: project.application_url ?? '',
      ip_address: project.ip_address ?? '',
      operating_system: project.operating_system ?? '',
      language: project.language ?? '',
      web_server: project.web_server ?? '',
      ports_scanned: project.ports_scanned ?? '',
      project_type: project.project_type,
      description: project.description ?? '',
      scope: project.scope ?? '',
      start_date: project.start_date,
      end_date: project.end_date ?? '',
      status: project.status,
      assigned_to: project.assigned_to,
    });
    setEditError('');
  };

  const handleEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTarget) return;
    const { id, ...data } = editTarget;
    updateMutation.mutate({
      id,
      data: {
        ...data,
        end_date: data.end_date || undefined,
      },
    });
  };

  const handlePreviewPdf = async (e: React.MouseEvent, projectId: number, code: string) => {
    e.stopPropagation();
    setPdfState({ loading: true, blobUrl: null, projectCode: code, projectId });
    try {
      const url = await reportsApi.previewReport(projectId);
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      window.open(url, '_blank');
      setPdfState(null);
    } catch {
      setPdfState(null);
      alert('Failed to generate report. Ensure the backend is running.');
    }
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800 }}>
            {myOnly ? 'My Projects' : 'All Projects'}
          </Typography>
          <Typography variant="body2" sx={{ color: '#6b8cae' }}>
            {myOnly ? 'Projects you created or are assigned to'
              : isAdmin ? 'Manage all penetration testing assessments'
              : 'All penetration testing assessments'}
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />}
          onClick={() => { setCreateForm(defaultCreate()); setCreateError(''); setOpenCreate(true); }}
          sx={{ bgcolor: C.redDark, borderRadius: '10px', '&:hover': { bgcolor: C.red } }}>
          New Report
        </Button>
      </Box>

      {/* Table */}
      <TableContainer component={Paper} elevation={0} sx={{ borderRadius: '12px' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Code</TableCell>
              <TableCell>Project Name</TableCell>
              <TableCell>Client</TableCell>
              <TableCell>Type</TableCell>
              {isAdmin && <TableCell>Assigned Auditor</TableCell>}
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {projects.length === 0 ? (
              <TableRow>
                <TableCell colSpan={isAdmin ? 7 : 6} align="center" sx={{ py: 4, color: '#94A3B8' }}>
                  No projects found. Click "New Project" to get started.
                </TableCell>
              </TableRow>
            ) : (
              projects.map((project) => {
                const statusStyle = STATUS_COLORS[project.status] ?? STATUS_COLORS.DRAFT;
                return (
                  <TableRow key={project.id} hover
                    onClick={() => navigate(`/projects/${project.id}`)}
                    sx={{ cursor: 'pointer' }}>
                    <TableCell sx={{ fontWeight: 700, color: C.redBright }}>{project.project_code}</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>{project.project_name}</TableCell>
                    <TableCell>{project.client_name}</TableCell>
                    <TableCell>{getProjectTypeLabel(project.project_type)}</TableCell>
                    {isAdmin && (
                      <TableCell>
                        {project.assigned_user_name ? (
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>{project.assigned_user_name}</Typography>
                            <Typography variant="caption" sx={{ color: '#6b8cae' }}>{project.assigned_user_email}</Typography>
                          </Box>
                        ) : (
                          <Typography variant="caption" sx={{ color: '#94A3B8', fontStyle: 'italic' }}>Unassigned</Typography>
                        )}
                      </TableCell>
                    )}
                    <TableCell>
                      <Chip label={getProjectStatusLabel(project.status)} size="small"
                        sx={{ bgcolor: statusStyle.bg, color: statusStyle.color, fontWeight: 700 }} />
                    </TableCell>
                    <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                      {/* Edit */}
                      <Tooltip title="Edit Project">
                        <IconButton size="small" onClick={(e) => openEditModal(e, project)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      {/* Preview PDF */}
                      <Tooltip title="Preview PDF Report">
                        <IconButton size="small" color="primary"
                          disabled={pdfState?.loading && pdfState.projectId === project.id}
                          onClick={(e) => handlePreviewPdf(e, project.id, project.project_code)}>
                          {pdfState?.loading && pdfState.projectId === project.id
                            ? <CircularProgress size={16} />
                            : <PictureAsPdfIcon fontSize="small" />}
                        </IconButton>
                      </Tooltip>
                      {/* Delete */}
                      <Tooltip title="Delete Project">
                        <IconButton size="small" color="error"
                          onClick={(e) => { e.stopPropagation(); setDeleteTarget(project); }}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* ══ PDF Loading Dialog ══ */}
      <Dialog open={!!(pdfState?.loading)} maxWidth="xs" fullWidth>
        <DialogContent sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 3 }}>
          <CircularProgress size={28} />
          <Typography variant="body1" sx={{ fontWeight: 600 }}>Generating PDF report…</Typography>
        </DialogContent>
      </Dialog>

      {/* ══ Delete Confirmation Dialog ══ */}
      <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5, pb: 1 }}>
          {deleteTarget?.created_by !== user?.id
            ? <WarningAmberIcon sx={{ color: '#F59E0B', fontSize: 28 }} />
            : <DeleteForeverIcon sx={{ color: '#DC2626', fontSize: 28 }} />}
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            {deleteTarget?.created_by !== user?.id ? "Delete Someone Else's Project?" : 'Delete Project?'}
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          {deleteTarget?.created_by !== user?.id && (
            <Alert severity="warning" sx={{ borderRadius: 2, mb: 2 }}>
              This project was created by <strong>{deleteTarget?.created_by_name ?? 'another user'}</strong>.
              You are about to delete someone else's work.
            </Alert>
          )}
          <Typography variant="body2" sx={{ color: '#475569' }}>
            Permanently delete <strong>"{deleteTarget?.project_name}"</strong>?
          </Typography>
          <Typography variant="caption" sx={{ color: '#94A3B8', mt: 0.5, display: 'block' }}>
            All findings and evidence will also be deleted. This cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, gap: 1 }}>
          <Button onClick={() => setDeleteTarget(null)} variant="outlined" sx={{ flex: 1 }}>Cancel</Button>
          <Button variant="contained" color="error" sx={{ flex: 1 }}
            disabled={deleteMutation.isPending}
            startIcon={deleteMutation.isPending ? <CircularProgress size={16} color="inherit" /> : <DeleteForeverIcon />}
            onClick={() => {
              if (deleteTarget) deleteMutation.mutate(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) });
            }}>
            {deleteMutation.isPending ? 'Deleting…' : 'Yes, Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ══ Edit Project Modal ══ */}
      <Dialog open={!!editTarget} onClose={() => setEditTarget(null)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Edit Project</DialogTitle>
        <form onSubmit={handleEdit}>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {editError && <Alert severity="error" sx={{ borderRadius: 2 }}>{editError}</Alert>}
            <TextField label="Project Name" required fullWidth value={editTarget?.project_name ?? ''}
              onChange={(e) => setEditTarget((t) => t && { ...t, project_name: e.target.value })} />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField label="Client Name" required fullWidth value={editTarget?.client_name ?? ''}
                onChange={(e) => setEditTarget((t) => t && { ...t, client_name: e.target.value })} />
              <TextField label="Application Name" required fullWidth value={editTarget?.application_name ?? ''}
                onChange={(e) => setEditTarget((t) => t && { ...t, application_name: e.target.value })} />
            </Box>
            <TextField label="Application URL" fullWidth value={editTarget?.application_url ?? ''}
              onChange={(e) => setEditTarget((t) => t && { ...t, application_url: e.target.value })} />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField label="IP Address" fullWidth value={editTarget?.ip_address ?? ''}
                onChange={(e) => setEditTarget((t) => t && { ...t, ip_address: e.target.value })} />
              <TextField label="Operating System" fullWidth value={editTarget?.operating_system ?? ''}
                onChange={(e) => setEditTarget((t) => t && { ...t, operating_system: e.target.value })} />
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField label="Language" fullWidth value={editTarget?.language ?? ''}
                onChange={(e) => setEditTarget((t) => t && { ...t, language: e.target.value })} />
              <TextField label="Web Server" fullWidth value={editTarget?.web_server ?? ''}
                onChange={(e) => setEditTarget((t) => t && { ...t, web_server: e.target.value })} />
            </Box>
            <TextField label="Ports Scanned" fullWidth value={editTarget?.ports_scanned ?? ''} placeholder="e.g. 22, 80, 443"
              onChange={(e) => setEditTarget((t) => t && { ...t, ports_scanned: e.target.value })} />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField select fullWidth label="Project Type" value={editTarget?.project_type ?? 'WEB'}
                onChange={(e) => setEditTarget((t) => t && { ...t, project_type: e.target.value })}>
                {PROJECT_TYPES.map((t) => <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>)}
              </TextField>
              <TextField select fullWidth label="Status" value={editTarget?.status ?? 'DRAFT'}
                onChange={(e) => setEditTarget((t) => t && { ...t, status: e.target.value })}>
                {PROJECT_STATUSES.map((s) => <MenuItem key={s.value} value={s.value}>{s.label}</MenuItem>)}
              </TextField>
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField label="Start Date" type="date" fullWidth slotProps={{ inputLabel: { shrink: true } }}
                value={editTarget?.start_date ?? ''}
                onChange={(e) => setEditTarget((t) => t && { ...t, start_date: e.target.value })} />
              <TextField label="End Date" type="date" fullWidth slotProps={{ inputLabel: { shrink: true } }}
                value={editTarget?.end_date ?? ''}
                onChange={(e) => setEditTarget((t) => t && { ...t, end_date: e.target.value })} />
            </Box>
            {isAdmin && (
              <TextField select fullWidth label="Assign Auditor"
                value={editTarget?.assigned_to ?? ''}
                onChange={(e) => setEditTarget((t) => t && { ...t, assigned_to: e.target.value ? Number(e.target.value) : undefined })}>
                <MenuItem value=""><em>No auditor assigned</em></MenuItem>
                {auditors.map((u) => <MenuItem key={u.id} value={u.id}>{u.full_name} — {u.email}</MenuItem>)}
              </TextField>
            )}
            <TextField label="Scope" fullWidth multiline rows={2} value={editTarget?.scope ?? ''}
              onChange={(e) => setEditTarget((t) => t && { ...t, scope: e.target.value })} />
            <TextField label="Description" fullWidth multiline rows={2} value={editTarget?.description ?? ''}
              onChange={(e) => setEditTarget((t) => t && { ...t, description: e.target.value })} />
          </DialogContent>
          <DialogActions sx={{ p: 2.5 }}>
            <Button onClick={() => setEditTarget(null)}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={updateMutation.isPending}
              startIcon={updateMutation.isPending ? <CircularProgress size={18} color="inherit" /> : undefined}
              sx={{ bgcolor: C.redDark, '&:hover': { bgcolor: C.red } }}>
              {updateMutation.isPending ? 'Saving…' : 'Save Changes'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* ══ Create Project Modal ══ */}
      <Dialog open={openCreate} onClose={() => setOpenCreate(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Create New VAPT Project</DialogTitle>
        <form onSubmit={handleCreate}>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {createError && <Alert severity="error" sx={{ borderRadius: 2 }}>{createError}</Alert>}
            <TextField label="Project Name" required fullWidth placeholder="e.g. Core Banking System VAPT"
              value={createForm.project_name}
              onChange={(e) => setCreateForm({ ...createForm, project_name: e.target.value })} />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField label="Client Name" required fullWidth value={createForm.client_name}
                onChange={(e) => setCreateForm({ ...createForm, client_name: e.target.value })} />
              <TextField label="Application Name" required fullWidth value={createForm.application_name}
                onChange={(e) => setCreateForm({ ...createForm, application_name: e.target.value })} />
            </Box>
            <TextField label="Application URL" fullWidth placeholder="https://app.example.com"
              value={createForm.application_url}
              onChange={(e) => setCreateForm({ ...createForm, application_url: e.target.value })} />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField label="IP Address" fullWidth placeholder="e.g. 192.0.2.10"
                value={createForm.ip_address}
                onChange={(e) => setCreateForm({ ...createForm, ip_address: e.target.value })} />
              <TextField label="Operating System" fullWidth placeholder="e.g. Ubuntu 24.04"
                value={createForm.operating_system}
                onChange={(e) => setCreateForm({ ...createForm, operating_system: e.target.value })} />
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField label="Language" fullWidth placeholder="e.g. Python, Java"
                value={createForm.language}
                onChange={(e) => setCreateForm({ ...createForm, language: e.target.value })} />
              <TextField label="Web Server" fullWidth placeholder="e.g. Nginx"
                value={createForm.web_server}
                onChange={(e) => setCreateForm({ ...createForm, web_server: e.target.value })} />
            </Box>
            <TextField label="Ports Scanned" fullWidth placeholder="e.g. 22, 80, 443"
              value={createForm.ports_scanned}
              onChange={(e) => setCreateForm({ ...createForm, ports_scanned: e.target.value })} />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField select fullWidth label="Project Type" value={createForm.project_type}
                onChange={(e) => setCreateForm({ ...createForm, project_type: e.target.value })}>
                {PROJECT_TYPES.map((t) => <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>)}
              </TextField>
              <TextField select fullWidth label="Status" value={createForm.status}
                onChange={(e) => setCreateForm({ ...createForm, status: e.target.value })}>
                {PROJECT_STATUSES.map((s) => <MenuItem key={s.value} value={s.value}>{s.label}</MenuItem>)}
              </TextField>
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField label="Start Date" type="date" required fullWidth slotProps={{ inputLabel: { shrink: true } }}
                value={createForm.start_date}
                onChange={(e) => setCreateForm({ ...createForm, start_date: e.target.value })} />
            <TextField label="End Date" type="date" fullWidth slotProps={{ inputLabel: { shrink: true } }}
                value={createForm.end_date}
                onChange={(e) => setCreateForm({ ...createForm, end_date: e.target.value })} />
            </Box>
            {isAdmin && (
              <TextField select fullWidth label="Assign Auditor (optional)" value={createForm.assigned_to ?? ''}
                onChange={(e) => setCreateForm({ ...createForm, assigned_to: e.target.value ? Number(e.target.value) : undefined })}>
                <MenuItem value=""><em>No auditor assigned</em></MenuItem>
                {auditors.map((u) => <MenuItem key={u.id} value={u.id}>{u.full_name} — {u.email}</MenuItem>)}
              </TextField>
            )}
            <TextField label="Scope" fullWidth multiline rows={2} value={createForm.scope}
              onChange={(e) => setCreateForm({ ...createForm, scope: e.target.value })} />
            <TextField label="Description" fullWidth multiline rows={2} value={createForm.description}
              onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })} />
          </DialogContent>
          <DialogActions sx={{ p: 2.5 }}>
            <Button onClick={() => setOpenCreate(false)}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={createMutation.isPending}
              startIcon={createMutation.isPending ? <CircularProgress size={18} color="inherit" /> : undefined}
              sx={{ bgcolor: C.redDark, '&:hover': { bgcolor: C.red } }}>
              {createMutation.isPending ? 'Creating…' : 'Create Project'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

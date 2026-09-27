import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Paper, Button, Chip, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Dialog,
  DialogTitle, DialogContent, DialogActions, TextField,
  MenuItem, CircularProgress, IconButton, Tooltip, Alert, Divider,
  Autocomplete,
} from '@mui/material';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import AddIcon from '@mui/icons-material/Add';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectsApi, PROJECT_TYPES, PROJECT_STATUSES, getProjectTypeLabel, getProjectStatusLabel } from '../api/projects';
import type { ProjectUpdate } from '../api/projects';
import { projectFindingsApi } from '../api/projectFindings';
import { masterVulnerabilitiesApi } from '../api/masterVulnerabilities';
import type { MasterVulnerability } from '../api/masterVulnerabilities';
import { aiApi } from '../api/ai';
import { reportsApi } from '../api/reports';
import { usersApi } from '../api/users';
import { useAuth } from '../context/AuthContext';
import { C } from '../theme';

const SEVERITY_STYLE: Record<string, { bg: string; color: string }> = {
  Critical:      { bg: 'rgba(255,77,94,.14)', color: '#FF8894' },
  High:          { bg: 'rgba(255,119,66,.14)', color: '#FFAA7A' },
  Medium:        { bg: 'rgba(255,176,32,.14)', color: '#FFD07A' },
  Low:           { bg: 'rgba(0,214,143,.13)', color: '#7EEDC1' },
  Informational: { bg: 'rgba(0,217,255,.12)', color: '#78E9FF' },
};

const AI_LOADING_MESSAGES = [
  'Please be patient, we are using our own local LLM.',
  'Patience is important. The model agrees… eventually.',
  'Just five more seconds. Allegedly.',
  'Consulting the local silicon oracle…',
  'Turning electricity into VAPT prose…',
  'Still thinking. Deeply. Possibly too deeply.',
  'Gathering the useful bits…',
  'Almost done this is not a dramatic pause.',
  'Checking the details one more time…',
  'The answer is on its way. No carrier pigeon involved.',
];

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  DRAFT:       { bg: 'rgba(107,140,174,0.12)', color: '#6b8cae' },
  STAGE1:      { bg: 'rgba(0,200,150,0.12)',   color: '#00c896' },
};

const FINDING_STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  OPEN:           { bg: 'rgba(255,68,68,0.12)',   color: '#ff6b6b' },
  VERIFIED:       { bg: 'rgba(239,68,68,0.15)',   color: '#ff7777' },
  FALSE_POSITIVE: { bg: 'rgba(107,114,128,0.12)', color: '#6b8cae' },
  ACCEPTED_RISK:  { bg: 'rgba(245,158,11,0.12)',  color: '#f59e0b' },
  RESOLVED:       { bg: 'rgba(0,200,150,0.12)',   color: '#00c896' },
};

const SEVERITIES = ['Critical', 'High', 'Medium', 'Low', 'Informational'];

const emptyFinding = (projectId: number) => ({
  project_id: projectId,
  master_vulnerability_id: undefined as number | undefined,
  title: '',
  severity: 'High',
  cvss_score: '' as string | number,
  cvss_vector: '',
  cwe: '',
  owasp: '',
  description: '',
  impact: '',
  recommendation: '',
  solution: '',
  references: '',
});

export const ProjectDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const projectId = Number(id);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, isAdmin } = useAuth();

  const [openFindingModal, setOpenFindingModal] = useState(false);
  const [openEditModal, setOpenEditModal]       = useState(false);
  const [generatingPdf, setGeneratingPdf]       = useState(false);
  const [editError, setEditError]               = useState('');
  const [aiLoading, setAiLoading]               = useState(false);
  const [findingError, setFindingError]         = useState('');
  const [aiLoadingMessageIndex, setAiLoadingMessageIndex] = useState(0);

  useEffect(() => {
    if (!aiLoading) {
      setAiLoadingMessageIndex(0);
      return;
    }
    const interval = window.setInterval(() => {
      setAiLoadingMessageIndex((index) => (index + 1) % AI_LOADING_MESSAGES.length);
    }, 3000);
    return () => window.clearInterval(interval);
  }, [aiLoading]);

  const [form, setForm] = useState(emptyFinding(projectId));
  const [editForm, setEditForm] = useState<ProjectUpdate>({});

  // ── Queries ──────────────────────────────────────────────────────────────
  const { data: project } = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => projectsApi.getById(projectId),
    enabled: !isNaN(projectId),
  });

  const { data: findings = [] } = useQuery({
    queryKey: ['findings', projectId],
    queryFn: () => projectFindingsApi.listByProject(projectId),
    enabled: !isNaN(projectId),
  });

  const { data: masterVulns = [] } = useQuery({
    queryKey: ['masterVulnerabilities'],
    queryFn: masterVulnerabilitiesApi.list,
  });

  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: usersApi.list,
    enabled: isAdmin,
  });

  const auditors = users.filter((u) => u.role === 'AUDITOR' && u.is_active);

  // ── Mutations ─────────────────────────────────────────────────────────────
  const updateProjectMutation = useMutation({
    mutationFn: (data: ProjectUpdate) => projectsApi.update(projectId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      setOpenEditModal(false);
      setEditError('');
    },
    onError: (err: any) => setEditError(err.response?.data?.detail ?? 'Failed to update project.'),
  });

  const createFindingMutation = useMutation({
    mutationFn: () => {
      const payload = {
        project_id: form.project_id,
        title: form.title,
        severity: form.severity,
        cvss_score: form.cvss_score !== '' ? Number(form.cvss_score) : undefined,
        cvss_vector: form.cvss_vector || undefined,
        cwe: form.cwe || undefined,
        owasp: form.owasp || undefined,
        description: form.description || undefined,
        impact: form.impact || undefined,
        recommendation: form.recommendation || undefined,
        solution: form.solution || undefined,
        references: form.references || undefined,
      };

      // If sourced from catalog — use from-master endpoint so the link is recorded
      if (form.master_vulnerability_id) {
        return projectFindingsApi.createFromMaster({
          ...payload,
          master_vulnerability_id: form.master_vulnerability_id,
        });
      }
      return projectFindingsApi.createCustom(payload);
    },
    onSuccess: (newFinding) => {
      queryClient.invalidateQueries({ queryKey: ['findings', projectId] });
      setOpenFindingModal(false);
      setForm(emptyFinding(projectId));
      setFindingError('');
      navigate(`/projects/${projectId}/findings/${newFinding.id}`);
    },
    onError: (err: any) => setFindingError(err.response?.data?.detail ?? 'Failed to add finding.'),  });

  const deleteFindingMutation = useMutation({
    mutationFn: projectFindingsApi.delete,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['findings', projectId] }),
  });

  // ── Helpers ───────────────────────────────────────────────────────────────

  // Fill form from a master vulnerability object
  const fillFromMaster = (vuln: MasterVulnerability) => {
    setForm({
      project_id: projectId,
      master_vulnerability_id: vuln.id,
      title: vuln.title ?? '',
      severity: vuln.severity ?? 'High',
      cvss_score: vuln.cvss_score ?? '',
      cvss_vector: vuln.cvss_vector ?? '',
      cwe: vuln.cwe ?? '',
      owasp: vuln.owasp ?? '',
      description: vuln.description ?? '',
      impact: vuln.impact ?? '',
      recommendation: vuln.recommendation ?? '',
      solution: vuln.solution ?? '',
      references: vuln.references ?? '',
    });
  };

  const existingTitles = new Set(
    findings.map((f) => f.title.toLowerCase().trim())
  );

  const handleCatalogSelect = (vulnId: number | '') => {
    if (!vulnId) {
      setForm(emptyFinding(projectId));
      return;
    }
    const vuln = masterVulns.find((v) => v.id === vulnId);
    if (vuln) fillFromMaster(vuln);
  };

  const handleAiGenerate = async () => {
    if (!form.title.trim()) return;
    try {
      setAiLoading(true);
      setFindingError('');
      const res = await aiApi.generateVulnerability(form.title.trim());
      setForm((prev) => {
        const generated = (value: string | number | undefined, fallback: string | number | undefined) =>
          value === undefined || value === null || (typeof value === 'string' && !value.trim())
            ? fallback
            : value;
        return ({
        ...prev,
        master_vulnerability_id: undefined,
        title: generated(res.title, prev.title) as string,
        severity: generated(res.severity, prev.severity) as string,
        cvss_score: generated(res.cvss_score, prev.cvss_score) as number,
        cvss_vector: generated(res.cvss_vector, prev.cvss_vector) as string,
        cwe: generated(res.cwe, prev.cwe) as string,
        owasp: generated(res.owasp, prev.owasp) as string,
        description: generated(res.description, prev.description) as string,
        impact: generated(res.impact, prev.impact) as string,
        recommendation: generated(res.recommendation, prev.recommendation) as string,
        solution: generated(res.solution, prev.solution) as string,
        });
      });
    } catch {
      setFindingError('LLM is not working or not responding. Please try again shortly.');
    } finally {
      setAiLoading(false);
    }
  };

  const handleGeneratePdf = async () => {
    if (!project) return;
    try {
      setGeneratingPdf(true);
      const url = await reportsApi.previewReport(projectId);
      window.open(url, '_blank');
    } catch { alert('Failed to generate PDF report.'); }
    finally { setGeneratingPdf(false); }
  };

  const openEdit = () => {
    if (!project) return;
    setEditForm({
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
    setOpenEditModal(true);
  };

  const saveProjectEdits = () => {
    // An unset optional date is represented as an empty input string in the
    // dialog, but the API expects it to be omitted rather than sent as "".
    updateProjectMutation.mutate({
      ...editForm,
      end_date: editForm.end_date || undefined,
    });
  };

  const canDeleteFinding = (finding: { created_by: number }) =>
    isAdmin || finding.created_by === user?.id;

  if (!project) return <Typography>Loading project…</Typography>;

  const statusStyle = STATUS_COLORS[project.status] ?? STATUS_COLORS.DRAFT;

  return (
    <Box>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/projects')} sx={{ mb: 2, color: '#64748B' }}>
        Back to Projects
      </Button>

      {/* ── Project Header ── */}
      <Paper elevation={0} sx={{ p: { xs: 2.25, sm: 3 }, mb: 2.5, borderRadius: 3, border: '1px solid #1a3a5c' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
              <Chip label={project.project_code} sx={{ bgcolor: 'rgba(239,68,68,0.12)', color: C.redBright, fontWeight: 800 }} />
              <Chip label={getProjectStatusLabel(project.status)} size="small"
                sx={{ bgcolor: statusStyle.bg, color: statusStyle.color, fontWeight: 700 }} />
              <Chip label={getProjectTypeLabel(project.project_type)} size="small" variant="outlined" />
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5 }}>{project.project_name}</Typography>
            <Typography variant="body2" sx={{ color: '#64748B' }}>
              Client: <strong>{project.client_name}</strong> | App: <strong>{project.application_name}</strong>
              {project.assigned_user_name && <> | Auditor: <strong>{project.assigned_user_name}</strong></>}
            </Typography>
            {project.start_date && (
              <Typography variant="caption" sx={{ color: '#94A3B8' }}>
                {project.start_date}{project.end_date ? ` → ${project.end_date}` : ''}
              </Typography>
            )}
          </Box>
          <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
            <TextField
              select
              size="small"
              label="Project Status"
              value={project.status}
              disabled={updateProjectMutation.isPending}
              onChange={(e) => {
                setEditError('');
                updateProjectMutation.mutate({ status: e.target.value });
              }}
              sx={{ minWidth: 160 }}
            >
              {PROJECT_STATUSES.map((status) => (
                <MenuItem key={status.value} value={status.value}>{status.label}</MenuItem>
              ))}
            </TextField>
            <Button variant="outlined" startIcon={<EditIcon />} onClick={openEdit} sx={{ borderRadius: '10px' }}>
              Edit Project
            </Button>
            <Button variant="contained"
              startIcon={generatingPdf ? <CircularProgress size={20} color="inherit" /> : <PictureAsPdfIcon />}
              onClick={handleGeneratePdf} disabled={generatingPdf}
              sx={{ py: 1.2, px: 3, borderRadius: '10px', bgcolor: C.redDark, '&:hover': { bgcolor: C.red }, fontWeight: 700 }}>
              {generatingPdf ? 'Generating…' : 'View PDF Report'}
            </Button>
          </Box>
        </Box>
        {editError && <Alert severity="error" sx={{ borderRadius: 2, mt: 2 }}>{editError}</Alert>}
      </Paper>

      {/* ── Findings Section ── */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          Vulnerability Findings ({findings.length})
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => { setForm(emptyFinding(projectId)); setFindingError(''); setOpenFindingModal(true); }}
          sx={{ borderRadius: '10px', bgcolor: C.redDark, '&:hover': { bgcolor: C.red } }}
        >
          Add Finding
        </Button>
      </Box>

      <TableContainer component={Paper} elevation={0} sx={{ borderRadius: '12px' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Severity</TableCell>
              <TableCell>CVSS</TableCell>
              <TableCell>Evidence</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {findings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4, color: '#94A3B8' }}>
                  No findings yet. Click "Add Finding" to get started.
                </TableCell>
              </TableRow>
            ) : (
              findings.map((finding) => {
                const sevStyle  = SEVERITY_STYLE[finding.severity ?? ''] ?? { bg: '#F1F5F9', color: '#64748B' };
                const fndStatus = FINDING_STATUS_COLORS[finding.status] ?? { bg: '#F1F5F9', color: '#64748B' };
                return (
                  <TableRow key={finding.id} hover
                    onClick={() => navigate(`/projects/${projectId}/findings/${finding.id}`)}
                    sx={{ cursor: 'pointer' }}>
                    <TableCell sx={{ fontWeight: 700 }}>{finding.title}</TableCell>
                    <TableCell>
                      <Chip label={finding.severity ?? 'N/A'} size="small"
                        sx={{ bgcolor: sevStyle.bg, color: sevStyle.color, fontWeight: 700 }} />
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>{finding.cvss_score ?? '—'}</TableCell>
                    <TableCell>
                      {(finding.evidences?.length ?? 0)} screenshot{(finding.evidences?.length ?? 0) !== 1 ? 's' : ''}
                    </TableCell>
                    <TableCell>
                      <Chip label={finding.status} size="small"
                        sx={{ bgcolor: fndStatus.bg, color: fndStatus.color, fontWeight: 600 }} />
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="View / Edit Finding">
                        <IconButton size="small" onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/projects/${projectId}/findings/${finding.id}`);
                        }}>
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      {canDeleteFinding(finding) && (
                        <Tooltip title="Delete Finding">
                          <IconButton size="small" color="error" onClick={(e) => {
                            e.stopPropagation();
                            if (confirm('Delete this finding and all its evidence?'))
                              deleteFindingMutation.mutate(finding.id);
                          }}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* ══════════════════════════════════════════════════════════════════════
          Add Finding Modal — single dialog with catalog select + AI generate
      ══════════════════════════════════════════════════════════════════════ */}
      <Dialog open={openFindingModal} onClose={() => setOpenFindingModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Add Finding</DialogTitle>
        <form onSubmit={(e) => {
          e.preventDefault();
          const trimmed = form.title.trim();
          if (!trimmed) {
            setFindingError('Please enter a finding title.');
            return;
          }
          if (existingTitles.has(trimmed.toLowerCase())) {
            setFindingError(`A finding titled "${trimmed}" already exists in this project.`);
            return;
          }
          createFindingMutation.mutate();
        }}>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>

            {/* ── Searchable catalog picker ── */}
            <Autocomplete
              fullWidth
              options={masterVulns}
              getOptionLabel={(v) => `${v.title}${v.severity ? ` (${v.severity})` : ''}`}
              getOptionDisabled={(v) => existingTitles.has(v.title.toLowerCase().trim())}
              value={masterVulns.find((v) => v.id === form.master_vulnerability_id) ?? null}
              onChange={(_, selected) => handleCatalogSelect(selected ? selected.id : '')}
              filterOptions={(options, { inputValue }) => {
                const q = inputValue.toLowerCase();
                return options.filter(
                  (v) =>
                    v.title.toLowerCase().includes(q) ||
                    (v.cwe ?? '').toLowerCase().includes(q) ||
                    (v.owasp ?? '').toLowerCase().includes(q) ||
                    (v.severity ?? '').toLowerCase().includes(q),
                );
              }}
              renderOption={(props, v) => {
                const sevStyle = SEVERITY_STYLE[v.severity ?? ''] ?? { bg: '#F1F5F9', color: '#64748B' };
                const alreadyAdded = existingTitles.has(v.title.toLowerCase().trim());
                return (
                  <Box component="li" {...props} key={v.id}
                    sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start !important', py: 1.2, opacity: alreadyAdded ? 0.45 : 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>{v.title}</Typography>
                      {alreadyAdded && (
                        <Chip label="Already added" size="small"
                          sx={{ height: 16, fontSize: '0.6rem', bgcolor: 'rgba(239,68,68,0.1)', color: '#DC2626' }} />
                      )}
                    </Box>
                    <Box sx={{ display: 'flex', gap: 0.75, mt: 0.4, flexWrap: 'wrap' }}>
                      {v.severity && (
                        <Chip label={v.severity} size="small"
                          sx={{ height: 18, fontSize: '0.65rem', fontWeight: 700, bgcolor: sevStyle.bg, color: sevStyle.color }} />
                      )}
                      {v.cwe && (
                        <Chip label={v.cwe} size="small" variant="outlined" sx={{ height: 18, fontSize: '0.65rem' }} />
                      )}
                      {v.owasp && (
                        <Chip label={v.owasp} size="small" variant="outlined" sx={{ height: 18, fontSize: '0.65rem' }} />
                      )}
                    </Box>
                  </Box>
                );
              }}
              renderInput={(params) => (
                <TextField {...params} label="Search catalog (title, CWE, OWASP, severity…)" placeholder="Type to search…" />
              )}
              noOptionsText="No vulnerabilities found"
              clearOnEscape
              isOptionEqualToValue={(a, b) => a.id === b.id}
            />

            <Divider sx={{ my: 0.5 }}>
              <Typography variant="caption" sx={{ color: '#94A3B8', px: 1 }}>or fill manually</Typography>
            </Divider>

            {/* ── Title + Generate ── */}
            <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
              <TextField
                label="Finding Title" required fullWidth
                placeholder="e.g. SQL Injection, XSS, SSRF…"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value, master_vulnerability_id: undefined })}
              />
              <Box sx={{ flex: '0 0 190px', textAlign: 'center' }}>
              <Button
                variant="contained"
                onClick={handleAiGenerate}
                disabled={aiLoading || !form.title.trim()}
                startIcon={aiLoading ? <CircularProgress size={16} color="inherit" /> : <AutoAwesomeIcon />}
                sx={{
                  whiteSpace: 'nowrap', mt: 0.5,
                  bgcolor: C.redBright, color: '#FFFFFF', fontWeight: 700,
                  borderRadius: '10px',
                  '&:hover': { bgcolor: C.red },
                  '&:disabled': { opacity: 0.5 },
                }}
              >
                {aiLoading ? 'Generating…' : 'Generate'}
              </Button>
                <Typography
                  variant="caption"
                  sx={{ display: 'block', minHeight: 34, mt: 0.75, color: C.muted, lineHeight: 1.35, visibility: aiLoading ? 'visible' : 'hidden' }}
                >
                  {aiLoading ? AI_LOADING_MESSAGES[aiLoadingMessageIndex] : 'Loading message'}
                </Typography>
              </Box>
            </Box>

            {/* ── Editable fields ── */}
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField select fullWidth label="Severity" value={form.severity}
                onChange={(e) => setForm({ ...form, severity: e.target.value })}>
                {SEVERITIES.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
              </TextField>
              <TextField type="number" fullWidth label="CVSS Score"
                value={form.cvss_score}
                onChange={(e) => setForm({ ...form, cvss_score: e.target.value })}
                slotProps={{ htmlInput: { min: 0, max: 10, step: 0.1 } }} />
            </Box>

            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField fullWidth label="CWE" placeholder="e.g. CWE-89"
                value={form.cwe}
                onChange={(e) => setForm({ ...form, cwe: e.target.value })} />
              <TextField fullWidth label="OWASP" placeholder="e.g. A03:2021"
                value={form.owasp}
                onChange={(e) => setForm({ ...form, owasp: e.target.value })} />
            </Box>

            <TextField fullWidth label="CVSS Vector" placeholder="CVSS:3.1/AV:N/AC:L/…"
              value={form.cvss_vector}
              onChange={(e) => setForm({ ...form, cvss_vector: e.target.value })} />

            <TextField label="Description" multiline rows={3} fullWidth
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })} />
            <TextField label="Business Impact" multiline rows={2} fullWidth
              value={form.impact}
              onChange={(e) => setForm({ ...form, impact: e.target.value })} />
            <TextField label="Recommendation" multiline rows={2} fullWidth
              value={form.recommendation}
              onChange={(e) => setForm({ ...form, recommendation: e.target.value })} />
            <TextField label="Solution / Remediation" multiline rows={2} fullWidth
              value={form.solution}
              onChange={(e) => setForm({ ...form, solution: e.target.value })} />
          </DialogContent>

          <DialogActions sx={{ p: 2.5, flexDirection: 'column', alignItems: 'stretch', gap: 1 }}>
            {findingError && (
              <Alert severity="error" sx={{ borderRadius: 2, mb: 0.5 }}>{findingError}</Alert>
            )}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
              <Button onClick={() => setOpenFindingModal(false)}>Cancel</Button>
              <Button type="submit" variant="contained" disabled={createFindingMutation.isPending}
                startIcon={createFindingMutation.isPending ? <CircularProgress size={18} color="inherit" /> : undefined}
                sx={{ bgcolor: C.redDark, '&:hover': { bgcolor: C.red } }}>
                {createFindingMutation.isPending ? 'Adding…' : 'Add Finding'}
              </Button>
            </Box>
          </DialogActions>
        </form>
      </Dialog>

      {/* ── Edit Project Modal ── */}
      <Dialog open={openEditModal} onClose={() => setOpenEditModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Edit Project</DialogTitle>
        <form onSubmit={(e) => { e.preventDefault(); saveProjectEdits(); }}>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {editError && <Alert severity="error" sx={{ borderRadius: 2 }}>{editError}</Alert>}
            <TextField label="Project Name" required fullWidth value={editForm.project_name ?? ''}
              onChange={(e) => setEditForm({ ...editForm, project_name: e.target.value })} />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField label="Client Name" required fullWidth value={editForm.client_name ?? ''}
                onChange={(e) => setEditForm({ ...editForm, client_name: e.target.value })} />
              <TextField label="Application Name" required fullWidth value={editForm.application_name ?? ''}
                onChange={(e) => setEditForm({ ...editForm, application_name: e.target.value })} />
            </Box>
            <TextField label="Application URL" fullWidth value={editForm.application_url ?? ''}
              onChange={(e) => setEditForm({ ...editForm, application_url: e.target.value })} />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField label="IP Address" fullWidth value={editForm.ip_address ?? ''}
                onChange={(e) => setEditForm({ ...editForm, ip_address: e.target.value })} />
              <TextField label="Operating System" fullWidth value={editForm.operating_system ?? ''}
                onChange={(e) => setEditForm({ ...editForm, operating_system: e.target.value })} />
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField label="Language" fullWidth value={editForm.language ?? ''}
                onChange={(e) => setEditForm({ ...editForm, language: e.target.value })} />
              <TextField label="Web Server" fullWidth value={editForm.web_server ?? ''}
                onChange={(e) => setEditForm({ ...editForm, web_server: e.target.value })} />
            </Box>
            <TextField label="Ports Scanned" fullWidth value={editForm.ports_scanned ?? ''} placeholder="e.g. 22, 80, 443"
              onChange={(e) => setEditForm({ ...editForm, ports_scanned: e.target.value })} />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField select fullWidth label="Project Type" value={editForm.project_type ?? 'WEB'}
                onChange={(e) => setEditForm({ ...editForm, project_type: e.target.value })}>
                {PROJECT_TYPES.map((t) => <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>)}
              </TextField>
              <TextField select fullWidth label="Status" value={editForm.status ?? 'DRAFT'}
                onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}>
                {PROJECT_STATUSES.map((s) => <MenuItem key={s.value} value={s.value}>{s.label}</MenuItem>)}
              </TextField>
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField label="Start Date" type="date" fullWidth slotProps={{ inputLabel: { shrink: true } }}
                value={editForm.start_date ?? ''} onChange={(e) => setEditForm({ ...editForm, start_date: e.target.value })} />
              <TextField label="End Date" type="date" fullWidth slotProps={{ inputLabel: { shrink: true } }}
                value={editForm.end_date ?? ''} onChange={(e) => setEditForm({ ...editForm, end_date: e.target.value })} />
            </Box>
            {isAdmin && (
              <TextField select fullWidth label="Assign Auditor" value={editForm.assigned_to ?? ''}
                onChange={(e) => setEditForm({ ...editForm, assigned_to: e.target.value ? Number(e.target.value) : undefined })}>
                <MenuItem value=""><em>No auditor assigned</em></MenuItem>
                {auditors.map((u) => <MenuItem key={u.id} value={u.id}>{u.full_name} — {u.email}</MenuItem>)}
              </TextField>
            )}
            <TextField label="Scope" fullWidth multiline rows={2} value={editForm.scope ?? ''}
              onChange={(e) => setEditForm({ ...editForm, scope: e.target.value })} />
            <TextField label="Description" fullWidth multiline rows={2} value={editForm.description ?? ''}
              onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} />
          </DialogContent>
          <DialogActions sx={{ p: 2.5 }}>
            <Button onClick={() => setOpenEditModal(false)}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={updateProjectMutation.isPending}
              startIcon={updateProjectMutation.isPending ? <CircularProgress size={18} color="inherit" /> : undefined}
              sx={{ bgcolor: C.redDark, '&:hover': { bgcolor: C.red } }}>
              {updateProjectMutation.isPending ? 'Saving…' : 'Save Changes'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

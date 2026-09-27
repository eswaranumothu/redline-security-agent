import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Paper, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Chip, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, CircularProgress,
  IconButton, Tooltip, Alert, MenuItem, InputAdornment,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import LockIcon from '@mui/icons-material/Lock';
import SearchIcon from '@mui/icons-material/Search';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { masterVulnerabilitiesApi } from '../api/masterVulnerabilities';
import type { MasterVulnerability, MasterVulnerabilityCreate } from '../api/masterVulnerabilities';
import { aiApi } from '../api/ai';
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

const emptyForm = (): MasterVulnerabilityCreate => ({
  title: '', severity: '', cvss_score: undefined,
  cvss_vector: '', cwe: '', owasp: '',
  description: '', impact: '', recommendation: '', solution: '',
});

export const MasterVulnerabilitiesPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { isAdmin } = useAuth();

  const [search, setSearch]         = useState('');
  const [openModal, setOpenModal]   = useState(false);
  const [editingId, setEditingId]   = useState<number | null>(null); // null = create mode
  const [aiLoading, setAiLoading]   = useState(false);
  const [formError, setFormError]   = useState('');
  const [form, setForm]             = useState<MasterVulnerabilityCreate>(emptyForm());
  const [duplicateConfirmationOpen, setDuplicateConfirmationOpen] = useState(false);
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

  const { data: masterVulns = [] } = useQuery({
    queryKey: ['masterVulnerabilities'],
    queryFn: masterVulnerabilitiesApi.list,
  });

  const normalizedSearch = search.trim().toLocaleLowerCase();
  const filtered = masterVulns.filter((v) => {
    if (!normalizedSearch) return true;

    // Search the complete catalog entry, not only the compact table columns.
    // This also handles copied text that contains inconsistent capitalization
    // or accidental leading/trailing spaces.
    const searchableText = [
      v.title,
      v.severity,
      v.cvss_score,
      v.cvss_vector,
      v.cwe,
      v.owasp,
      v.description,
      v.impact,
      v.recommendation,
      v.solution,
      v.references,
    ]
      .filter((value): value is string | number => value !== null && value !== undefined)
      .join(' ')
      .toLocaleLowerCase();

    return searchableText.includes(normalizedSearch);
  });

  // ── Mutations ─────────────────────────────────────────────────────────────

  const createMutation = useMutation({
    mutationFn: ({ data, allowDuplicate }: { data: MasterVulnerabilityCreate; allowDuplicate?: boolean }) =>
      masterVulnerabilitiesApi.create(data, allowDuplicate),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['masterVulnerabilities'] });
      closeModal();
    },
    onError: (err: any) => {
      setFormError(err.response?.data?.detail ?? 'Failed to save vulnerability.');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<MasterVulnerabilityCreate> }) =>
      masterVulnerabilitiesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['masterVulnerabilities'] });
      closeModal();
    },
    onError: (err: any) => {
      setFormError(err.response?.data?.detail ?? 'Failed to update vulnerability.');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: masterVulnerabilitiesApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['masterVulnerabilities'] });
    },
  });

  // ── Helpers ───────────────────────────────────────────────────────────────

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm());
    setFormError('');
    setOpenModal(true);
  };

  const openEdit = (v: MasterVulnerability) => {
    setEditingId(v.id);
    setForm({
      title:          v.title,
      severity:       v.severity ?? '',
      cvss_score:     v.cvss_score ?? undefined,
      cvss_vector:    v.cvss_vector ?? '',
      cwe:            v.cwe ?? '',
      owasp:          v.owasp ?? '',
      description:    v.description ?? '',
      impact:         v.impact ?? '',
      recommendation: v.recommendation ?? '',
      solution:       v.solution ?? '',
    });
    setFormError('');
    setOpenModal(true);
  };

  const closeModal = () => {
    setOpenModal(false);
    setEditingId(null);
    setForm(emptyForm());
    setFormError('');
  };

  const handleAiGenerate = async () => {
    if (!form.title.trim()) return;
    try {
      setAiLoading(true);
      const res = await aiApi.generateVulnerability(form.title.trim());
      // Preserve current values when a local model returns a blank property.
      // Empty strings are valid JavaScript values, so `??` alone is unsafe.
      const generated = (value: string | number | undefined, fallback: string | number | undefined) =>
        value === undefined || value === null || (typeof value === 'string' && !value.trim())
          ? fallback
          : value;
      setForm((prev) => ({
        title:          generated(res.title, prev.title) as string,
        severity:       generated(res.severity, prev.severity) as string,
        cvss_score:     generated(res.cvss_score, prev.cvss_score) as number,
        cvss_vector:    generated(res.cvss_vector, prev.cvss_vector) as string,
        cwe:            generated(res.cwe, prev.cwe) as string,
        owasp:          generated(res.owasp, prev.owasp) as string,
        description:    generated(res.description, prev.description) as string,
        impact:         generated(res.impact, prev.impact) as string,
        recommendation: generated(res.recommendation, prev.recommendation) as string,
        solution:       generated(res.solution, prev.solution) as string,
      }));
      setFormError('');
    } catch {
      setFormError('LLM is not working or not responding. Please try again shortly.');
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (editingId !== null) {
      updateMutation.mutate({ id: editingId, data: form });
    } else {
      const title = form.title.trim().toLocaleLowerCase();
      const hasMatchingTitle = masterVulns.some(
        (vulnerability) => vulnerability.title.trim().toLocaleLowerCase() === title,
      );
      if (hasMatchingTitle) {
        setDuplicateConfirmationOpen(true);
        return;
      }
      createMutation.mutate({ data: form });
    }
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <Box>
      {/* Page header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3, gap: 2, flexWrap: 'wrap' }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800 }}>
            Master Vulnerability Catalog
          </Typography>
          <Typography variant="body2" sx={{ color: '#6b8cae' }}>
            {isAdmin
              ? 'Manage the centralized VAPT vulnerability template library'
              : 'Browse vulnerability templates — read-only access'}
          </Typography>
        </Box>

        {isAdmin ? (
          <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}
            sx={{ bgcolor: C.redDark, borderRadius: '10px', '&:hover': { bgcolor: C.red } }}>
            Add Vulnerability
          </Button>
        ) : (
          <Chip icon={<LockIcon fontSize="small" />} label="Read-Only Access"
            sx={{ bgcolor: `${C.red}18`, color: C.redBright, fontWeight: 700 }} />
        )}
      </Box>

      {/* Search */}
      <Paper elevation={0} sx={{ p: 2, mb: 2, borderRadius: 3, border: `1px solid ${C.border}` }}>
        <TextField fullWidth size="small"
          placeholder="Search vulnerabilities by title, CWE, or OWASP…"
          value={search} onChange={(e) => setSearch(e.target.value)}
          slotProps={{ input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: C.muted }} />
              </InputAdornment>
            ),
          }}}
        />
      </Paper>

      {/* Table */}
      <TableContainer component={Paper} elevation={0} sx={{ borderRadius: '12px' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Severity</TableCell>
              <TableCell>CVSS</TableCell>
              <TableCell>CWE</TableCell>
              <TableCell>OWASP</TableCell>
              {isAdmin && <TableCell align="right">Actions</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={isAdmin ? 6 : 5} align="center" sx={{ py: 4, color: '#94A3B8' }}>
                  {search ? 'No vulnerabilities match your search.' : 'No vulnerability templates in catalog yet.'}
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((v) => {
                const sevStyle = SEVERITY_STYLE[v.severity ?? ''] ?? { bg: '#F1F5F9', color: '#64748B' };
                return (
                  <TableRow key={v.id} hover>
                    <TableCell sx={{ fontWeight: 700 }}>{v.title}</TableCell>
                    <TableCell>
                      <Chip label={v.severity ?? 'N/A'} size="small"
                        sx={{ bgcolor: sevStyle.bg, color: sevStyle.color, fontWeight: 700 }} />
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>{v.cvss_score ?? '—'}</TableCell>
                    <TableCell>{v.cwe ?? '—'}</TableCell>
                    <TableCell>{v.owasp ?? '—'}</TableCell>
                    {isAdmin && (
                      <TableCell align="right">
                        <Tooltip title="Edit">
                          <IconButton size="small" onClick={() => openEdit(v)}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton size="small" color="error"
                            onClick={() => { if (confirm(`Delete "${v.title}"?`)) deleteMutation.mutate(v.id); }}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    )}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add / Edit modal */}
      <Dialog open={openModal} onClose={closeModal} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>
          {editingId !== null ? 'Edit Vulnerability' : 'Add Vulnerability'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {formError && <Alert severity="error" sx={{ borderRadius: 2 }}>{formError}</Alert>}

            {/* Title + Generate */}
            <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
              <TextField label="Vulnerability Title" required fullWidth
                placeholder="e.g. SQL Injection, XSS, SSRF…"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
              <Box sx={{ flex: '0 0 190px', textAlign: 'center' }}>
              <Button variant="contained" onClick={handleAiGenerate}
                disabled={aiLoading || !form.title.trim()}
                startIcon={aiLoading ? <CircularProgress size={16} color="inherit" /> : <AutoAwesomeIcon />}
                sx={{
                  whiteSpace: 'nowrap', mt: 0.5,
                  bgcolor: C.redBright, color: '#FFFFFF', fontWeight: 700,
                  borderRadius: '10px',
                  '&:hover': { bgcolor: C.red },
                  '&:disabled': { opacity: 0.5 },
                }}>
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

            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField select fullWidth label="Severity" value={form.severity}
                onChange={(e) => setForm({ ...form, severity: e.target.value })}>
                <MenuItem value=""><em>Not set</em></MenuItem>
                {['Critical', 'High', 'Medium', 'Low', 'Informational'].map((s) => (
                  <MenuItem key={s} value={s}>{s}</MenuItem>
                ))}
              </TextField>
              <TextField type="number" fullWidth label="CVSS Score"
                value={form.cvss_score ?? ''}
                onChange={(e) => setForm({
                  ...form,
                  cvss_score: e.target.value === '' ? undefined : Number(e.target.value),
                })}
                slotProps={{ htmlInput: { min: 0, max: 10, step: 0.1 } }} />
              <TextField fullWidth label="CWE" value={form.cwe ?? ''}
                onChange={(e) => setForm({ ...form, cwe: e.target.value })} />
              <TextField fullWidth label="OWASP" value={form.owasp ?? ''}
                onChange={(e) => setForm({ ...form, owasp: e.target.value })} />
            </Box>

            <TextField fullWidth label="CVSS Vector" value={form.cvss_vector ?? ''}
              onChange={(e) => setForm({ ...form, cvss_vector: e.target.value })}
              placeholder="CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H" />
            <TextField label="Description" multiline rows={3} fullWidth
              value={form.description ?? ''}
              onChange={(e) => setForm({ ...form, description: e.target.value })} />
            <TextField label="Business Impact" multiline rows={2} fullWidth
              value={form.impact ?? ''}
              onChange={(e) => setForm({ ...form, impact: e.target.value })} />
            <TextField label="Recommendation" multiline rows={2} fullWidth
              value={form.recommendation ?? ''}
              onChange={(e) => setForm({ ...form, recommendation: e.target.value })} />
            <TextField label="Solution / Remediation" multiline rows={3} fullWidth
              value={form.solution ?? ''}
              onChange={(e) => setForm({ ...form, solution: e.target.value })} />
          </DialogContent>

          <DialogActions sx={{ p: 2.5 }}>
            <Button onClick={closeModal}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={isSaving}
              startIcon={isSaving ? <CircularProgress size={18} color="inherit" /> : undefined}
              sx={{ bgcolor: C.redDark, '&:hover': { bgcolor: C.red } }}>
              {isSaving
                ? 'Saving…'
                : editingId !== null
                ? 'Save Changes'
                : 'Save Vulnerability'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      <Dialog
        open={duplicateConfirmationOpen}
        onClose={() => setDuplicateConfirmationOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Vulnerability already exists</DialogTitle>
        <DialogContent>
          <Typography>
            A master vulnerability named “{form.title.trim()}” already exists. Do you still want to add another one?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setDuplicateConfirmationOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            color="warning"
            onClick={() => {
              setDuplicateConfirmationOpen(false);
              createMutation.mutate({ data: form, allowDuplicate: true });
            }}
          >
            Proceed and Add
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

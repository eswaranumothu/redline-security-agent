import React, { useState, useEffect, useRef } from 'react';
import {
  Box, Typography, Paper, Button, TextField, Chip,
  CircularProgress, IconButton, Tooltip, Divider, Tab, Tabs,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import PsychologyIcon from '@mui/icons-material/Psychology';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { projectFindingsApi } from '../api/projectFindings';
import { evidenceApi } from '../api/evidence';
import { memoryApi, type SimilarFinding } from '../api/memory';
import { PastMemoryChatModal } from '../components/memory/PastMemoryChatModal';
import { C } from '../theme';
import type { FindingEvidenceItem } from '../api/projectFindings';

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000';

const SEVERITY_STYLE: Record<string, { bg: string; color: string }> = {
  Critical:      { bg: 'rgba(255,77,94,.14)', color: '#FF8894' },
  High:          { bg: 'rgba(255,119,66,.14)', color: '#FFAA7A' },
  Medium:        { bg: 'rgba(255,176,32,.14)', color: '#FFD07A' },
  Low:           { bg: 'rgba(0,214,143,.13)', color: '#7EEDC1' },
  Informational: { bg: 'rgba(0,217,255,.12)', color: '#78E9FF' },
};

// ─── Single screenshot row ────────────────────────────────────────────────────

interface EvidenceStepProps {
  step: number;
  evidence: FindingEvidenceItem;
  projectId: number;
  findingTitle: string;
  findingDescription?: string;
  findingId?: number;
  onDelete: (id: number) => void;
  onAiGenerate: (id: number) => Promise<void>;
  onSaveCaption: (id: number, caption: string) => Promise<void>;
  aiGeneratingId: number | null;
}

const EvidenceStep: React.FC<EvidenceStepProps> = ({
  step, evidence, projectId, findingTitle, findingDescription, findingId, onDelete, onAiGenerate, onSaveCaption, aiGeneratingId,
}) => {
  const [caption, setCaption] = useState(evidence.caption ?? '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveFailed, setSaveFailed] = useState(false);
  const [similarMemories, setSimilarMemories] = useState<SimilarFinding[]>([]);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const captionRef = useRef(caption);
  const lastSavedCaption = useRef(evidence.caption ?? '');

  useEffect(() => {
    const nextCaption = evidence.caption ?? '';
    setCaption(nextCaption);
    captionRef.current = nextCaption;
    lastSavedCaption.current = nextCaption;
  }, [evidence.caption]);

  // Check similarity against Hindsight memory
  const checkSimilarity = async (currentCaption?: string) => {
    if (!findingTitle || !projectId) return;
    try {
      const res = await memoryApi.checkStepSimilarity(
        projectId,
        findingTitle,
        currentCaption ?? caption,
        findingDescription,
        findingId
      );
      if (res.has_similarity) {
        setSimilarMemories(res.similar_memories);
      } else {
        setSimilarMemories([]);
      }
    } catch {
      // Gracefully ignore network errors
    }
  };

  useEffect(() => {
    void checkSimilarity();
  }, [findingTitle, caption]);

  const imageUrl = evidence.screenshot_path
    ? `${API_BASE}/${evidence.screenshot_path.replace(/\\/g, '/')}`
    : '';

  const saveCaption = async () => {
    const captionToSave = captionRef.current;
    if (captionToSave === lastSavedCaption.current) return;

    setSaving(true);
    setSaveFailed(false);
    try {
      await onSaveCaption(evidence.id, captionToSave);
      lastSavedCaption.current = captionToSave;
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
      void checkSimilarity(captionToSave);
    } catch {
      setSaveFailed(true);
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    if (caption === lastSavedCaption.current) return;
    const timer = window.setTimeout(() => { void saveCaption(); }, 600);
    return () => window.clearTimeout(timer);
  }, [caption]);

  const isAiRunning = aiGeneratingId === evidence.id;

  const handleAnalyzeClick = async () => {
    await onAiGenerate(evidence.id);
    await checkSimilarity();
  };

  return (
    <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
      {/* Thumbnail */}
      {imageUrl ? (
        <Box component="img" src={imageUrl} alt={`Step ${step}`}
          onClick={() => window.open(imageUrl, '_blank')}
          title="Click to view full size"
          sx={{
            width: 80, height: 60, objectFit: 'cover',
            borderRadius: 1.5, border: '1px solid rgba(0,217,255,.22)',
            bgcolor: '#071426', flexShrink: 0, cursor: 'pointer',
          }}
        />
      ) : (
        <Box sx={{
          width: 80, height: 60, borderRadius: 1.5,
          border: '1px dashed rgba(0,217,255,.35)', bgcolor: 'rgba(22,119,255,.05)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <Typography sx={{ color: '#8FA3BF', fontSize: '0.6rem' }}>No image</Typography>
        </Box>
      )}

      {/* Caption + actions */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
          <Typography variant="caption" sx={{ color: C.muted, fontWeight: 600 }}>Step Description</Typography>
          {saving && <Typography variant="caption" sx={{ color: C.amber }}>Saving…</Typography>}
          {saved && <Typography variant="caption" sx={{ color: C.green }}>Saved ✓</Typography>}
          {saveFailed && <Typography variant="caption" sx={{ color: C.redBright }}>Save Failed</Typography>}
        </Box>
        <TextField fullWidth multiline minRows={2} maxRows={5}
          placeholder="Describe what this screenshot shows…"
          value={caption}
          onChange={(e) => {
            captionRef.current = e.target.value;
            setCaption(e.target.value);
            setSaved(false);
            setSaveFailed(false);
          }}
          onBlur={() => { void saveCaption(); }}
          sx={{ mb: 1 }}
        />
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
            <Button size="small" variant="contained"
              onClick={handleAnalyzeClick}
              disabled={isAiRunning || !evidence.screenshot_path}
              startIcon={isAiRunning ? <CircularProgress size={14} color="inherit" /> : <AutoAwesomeIcon fontSize="small" />}
              sx={{ bgcolor: C.redBright, color: '#FFFFFF', fontWeight: 700, fontSize: '0.75rem', borderRadius: '8px', '&:hover': { bgcolor: C.red }, '&:disabled': { opacity: 0.5 } }}>
              {isAiRunning ? 'Analyzing…' : 'Analyze'}
            </Button>

            {/* Highlighted Past Memory Button rendered when similarity is found */}
            {similarMemories.length > 0 && (
              <Button size="small" variant="outlined"
                onClick={() => setIsChatOpen(true)}
                startIcon={<PsychologyIcon fontSize="small" sx={{ color: C.redBright }} />}
                sx={{
                  bgcolor: `${C.red}25`,
                  color: C.white,
                  borderColor: C.redBright,
                  fontWeight: 800,
                  fontSize: '0.75rem',
                  borderRadius: '8px',
                  boxShadow: `0 0 12px ${C.red}66`,
                  '&:hover': { bgcolor: `${C.red}40`, borderColor: C.redBright, boxShadow: `0 0 20px ${C.red}` },
                }}>
                ⚡ Past Memory ({similarMemories.length})
              </Button>
            )}
          </Box>

          <Tooltip title="Delete screenshot">
            <IconButton size="small" color="error" onClick={() => onDelete(evidence.id)}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Contextual Past Memory AI Chat Modal */}
      {isChatOpen && (
        <PastMemoryChatModal
          open={isChatOpen}
          onClose={() => setIsChatOpen(false)}
          findingTitle={findingTitle}
          stepCaption={caption}
          similarMemories={similarMemories}
        />
      )}
    </Box>
  );
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export const FindingDetailsPage: React.FC = () => {
  const { projectId, findingId } = useParams<{ projectId: string; findingId: string }>();
  const fId = Number(findingId);
  const pId = Number(projectId);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState(0);
  const [cases, setCases] = useState<string[]>(['Case 1']);
  const [aiGeneratingId, setAiGeneratingId] = useState<number | null>(null);
  const [addingScreenshot, setAddingScreenshot] = useState(false);

  const { data: finding, isLoading } = useQuery({
    queryKey: ['finding', fId],
    queryFn: () => projectFindingsApi.getById(fId),
    enabled: !isNaN(fId),
  });

  const { data: evidences = [] } = useQuery({
    queryKey: ['evidence', fId],
    queryFn: () => evidenceApi.listByFinding(fId),
    enabled: !isNaN(fId),
  });

  // Sync cases list from server data — only ADD new labels, never reorder or reset tab
  useEffect(() => {
    if (evidences.length === 0) return;
    const fromServer = Array.from(
      evidences.reduce((s, e) => { s.add(e.case_label); return s; }, new Set<string>())
    );
    setCases((prev) => {
      // Add any server labels not already in local list, preserve existing order
      const toAdd = fromServer.filter((l) => !prev.includes(l));
      return toAdd.length > 0 ? [...prev, ...toAdd] : prev;
    });
    // Never touch activeTab here
  }, [evidences]);

  const refresh = () => queryClient.invalidateQueries({ queryKey: ['evidence', fId] });

  const activeCase = cases[Math.min(activeTab, cases.length - 1)] ?? 'Case 1';
  const activeCaseEvidences = evidences.filter((e) => e.case_label === activeCase);

  // ── Add Case ──────────────────────────────────────────────────────────────
  const handleAddCase = () => {
    // Find next available name (Case 1, Case 2, …) that isn't already in list
    let n = 1;
    while (cases.includes(`Case ${n}`)) n++;
    const newLabel = `Case ${n}`;
    const newIndex = cases.length;
    setCases((prev) => [...prev, newLabel]);
    setActiveTab(newIndex);
  };

  // ── Delete Case ───────────────────────────────────────────────────────────
  const handleDeleteCase = async (label: string) => {
    if (!confirm(`Delete "${label}" and all its screenshots?`)) return;
    const toDelete = evidences.filter((e) => e.case_label === label);
    for (const ev of toDelete) await evidenceApi.delete(ev.id);
    setCases((prev) => {
      const next = prev.filter((c) => c !== label);
      return next.length > 0 ? next : ['Case 1'];
    });
    setActiveTab(0);
    refresh();
  };

  // ── Add screenshot to active case ────────────────────────────────────────
  const handleAddScreenshot = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    const file = e.target.files[0];
    try {
      setAddingScreenshot(true);
      const order = activeCaseEvidences.length + 1;
      const newEv = await evidenceApi.create(fId, order, activeCase);
      await evidenceApi.uploadScreenshot(newEv.id, file);
      refresh();
    } catch (err: any) {
      alert(err.response?.data?.detail ?? 'Error uploading screenshot.');
    } finally {
      setAddingScreenshot(false);
      e.target.value = '';
    }
  };

  // ── AI generate ───────────────────────────────────────────────────────────
  const handleAiGenerate = async (evidenceId: number) => {
    try {
      setAiGeneratingId(evidenceId);
      await evidenceApi.generateDescription(evidenceId);
      refresh();
    } catch {
      alert('LLM is not working or not responding. Please try again shortly.');
    } finally {
      setAiGeneratingId(null);
    }
  };

  const handleSaveCaption = async (evidenceId: number, caption: string) => {
    await evidenceApi.update(evidenceId, { caption });
    refresh();
  };

  const handleDeleteEvidence = async (evidenceId: number) => {
    if (!confirm('Delete this screenshot?')) return;
    await evidenceApi.delete(evidenceId);
    refresh();
  };

  if (isLoading || !finding) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  const sevStyle = SEVERITY_STYLE[finding.severity ?? ''] ?? { bg: '#F1F5F9', color: '#64748B' };
  const safeTab = Math.min(activeTab, cases.length - 1);

  return (
    <Box>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(`/projects/${pId}`)}
        sx={{ mb: 2, color: '#64748B' }}>
        Back to Project
      </Button>

      {/* Header */}
      <Paper elevation={0} sx={{ p: { xs: 2, sm: 2.5 }, mb: 2.25, borderRadius: 3, border: `1px solid #1a3a5c` }}>
        <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
          <Chip label={finding.severity ?? 'N/A'} size="small"
            sx={{ bgcolor: sevStyle.bg, color: sevStyle.color, fontWeight: 700 }} />
          <Chip label={finding.is_custom ? 'Custom' : 'From Catalog'} size="small" variant="outlined" />
        </Box>
        <Typography variant="h5" sx={{ fontWeight: 800 }}>{finding.title}</Typography>
      </Paper>

      {/* Evidence panel */}
      <Paper elevation={0} sx={{ p: { xs: 2, sm: 2.5 }, borderRadius: 3, border: `1px solid #1a3a5c` }}>

        {/* Panel header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>Evidence</Typography>
          <Button size="small" variant="outlined" startIcon={<AddIcon />}
            onClick={handleAddCase}
            sx={{ borderRadius: '8px', fontWeight: 600 }}>
            Add Case
          </Button>
        </Box>

        {/* Tabs */}
        <Tabs
          value={safeTab}
          onChange={(_, v) => setActiveTab(v)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            mb: 2.5, minHeight: 36,
            '& .MuiTab-root': { minHeight: 36, py: 0.5, fontWeight: 600, fontSize: '0.82rem' },
            '& .MuiTabs-indicator': { bgcolor: '#00D9FF' },
            borderBottom: '1px solid rgba(117,180,255,.14)',
          }}
        >
          {cases.map((label) => {
            const count = evidences.filter((e) => e.case_label === label).length;
            return (
              <Tab key={label} label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                  <span>{label}</span>
                  <Chip label={count} size="small"
                    sx={{ height: 18, fontSize: '0.65rem', minWidth: 22,
                      bgcolor: 'rgba(0,217,255,.1)', color: '#78E9FF', fontWeight: 700 }} />
                </Box>
              } />
            );
          })}
        </Tabs>

        {/* Case header row */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#8FA3BF' }}>
            {activeCase} — {activeCaseEvidences.length} screenshot{activeCaseEvidences.length !== 1 ? 's' : ''}
          </Typography>
          {cases.length > 1 && (
            <Button size="small" color="error" variant="outlined"
              startIcon={<DeleteIcon fontSize="small" />}
              onClick={() => handleDeleteCase(activeCase)}
              sx={{ borderRadius: '8px', fontSize: '0.72rem' }}>
              Delete Case
            </Button>
          )}
        </Box>

        {/* Screenshots for active case */}
        {activeCaseEvidences.length === 0 ? (
          <Box sx={{
            py: 4, textAlign: 'center', border: '1px dashed rgba(0,217,255,.32)',
            borderRadius: 2, bgcolor: 'rgba(22,119,255,.045)', mb: 2,
          }}>
            <AddPhotoAlternateIcon sx={{ fontSize: 32, color: '#78E9FF', mb: 0.5 }} />
            <Typography variant="caption" sx={{ color: '#8FA3BF', display: 'block' }}>
              No screenshots yet for {activeCase}.
            </Typography>
          </Box>
        ) : (
          <Box sx={{ mb: 2 }}>
            {activeCaseEvidences.map((ev, idx) => (
              <Box key={ev.id}>
                <EvidenceStep
                  step={idx + 1}
                  evidence={ev}
                  projectId={pId}
                  findingTitle={finding.title}
                  findingDescription={finding.description}
                  findingId={fId}
                  onDelete={handleDeleteEvidence}
                  onAiGenerate={handleAiGenerate}
                  onSaveCaption={handleSaveCaption}
                  aiGeneratingId={aiGeneratingId}
                />
                {idx < activeCaseEvidences.length - 1 && <Divider sx={{ my: 2 }} />}
              </Box>
            ))}
          </Box>
        )}

        {/* Add screenshot */}
        <Button fullWidth variant="outlined" component="label" disabled={addingScreenshot}
          startIcon={addingScreenshot ? <CircularProgress size={18} color="inherit" /> : <AddPhotoAlternateIcon />}
          sx={{
            borderRadius: '10px', borderStyle: 'dashed', py: 1.2,
            color: C.redBright, borderColor: C.red,
            '&:hover': { bgcolor: C.redDim },
          }}>
          {addingScreenshot ? 'Uploading…' : 'Add Screenshot'}
          <input type="file" hidden accept="image/png,image/jpeg,image/jpg,image/webp"
            onChange={handleAddScreenshot} />
        </Button>
      </Paper>

    </Box>
  );
};



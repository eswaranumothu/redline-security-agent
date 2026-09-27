import React from 'react';
import {
  Box, Typography, Button, Chip, ButtonBase, Avatar,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import BoltIcon from '@mui/icons-material/Bolt';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import ArticleIcon from '@mui/icons-material/Article';
import GppGoodIcon from '@mui/icons-material/GppGood';
import NoteAddIcon from '@mui/icons-material/NoteAdd';
import PsychologyIcon from '@mui/icons-material/Psychology';
import ChatIcon from '@mui/icons-material/Chat';
import SecurityIcon from '@mui/icons-material/Security';
import BugReportIcon from '@mui/icons-material/BugReport';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { projectsApi, getProjectStatusLabel } from '../api/projects';
import { masterVulnerabilitiesApi } from '../api/masterVulnerabilities';
import { memoryApi } from '../api/memory';
import { useAuth } from '../context/AuthContext';
import { openMemoryChat } from '../components/memory/FloatingMemoryChat';
import { C, glow } from '../theme';

const STATUS_STYLE: Record<string, { bg: string; color: string; border: string }> = {
  DRAFT:       { bg: `${C.muted}18`, color: C.muted,   border: `${C.muted}44` },
  STAGE1:      { bg: `${C.green}18`, color: C.green,   border: `${C.green}44` },
};

const SEV_META = [
  { label: 'Total Templates', sub: 'Catalog vulnerability entries', color: C.blue,     sev: null },
  { label: 'Critical Issues', sub: 'Needs immediate remediation',   color: C.critical, sev: 'Critical' },
  { label: 'High Severity',   sub: 'Important finding priority',    color: C.high,     sev: 'High' },
  { label: 'Medium Severity', sub: 'Review & patch recommended',    color: C.medium,   sev: 'Medium' },
  { label: 'Low Severity',    sub: 'Informational hardening',       color: C.low,      sev: 'Low' },
];

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: rawProjects }    = useQuery({ queryKey: ['projects'],              queryFn: projectsApi.list });
  const { data: rawMasterVulns } = useQuery({ queryKey: ['masterVulnerabilities'], queryFn: masterVulnerabilitiesApi.list });
  const { data: rawMemories }    = useQuery({ queryKey: ['securityMemories'],       queryFn: () => memoryApi.listRecords(100, 0) });

  const projects = Array.isArray(rawProjects) ? rawProjects : [];
  const masterVulns = Array.isArray(rawMasterVulns) ? rawMasterVulns : [];
  const memories = Array.isArray(rawMemories) ? rawMemories : [];

  const generatedReports = projects.filter((p) => p.report_generated_at).length;

  const kpis = [
    { label: 'Active VAPT Projects',  value: projects.length,          icon: <FolderOpenIcon />, color: C.redBright, path: '/projects' },
    { label: 'Security Memories',     value: memories.length,          icon: <PsychologyIcon />, color: C.red,       path: '/security-memory' },
    { label: 'Reports Generated',     value: generatedReports,        icon: <ArticleIcon />,   color: C.amber,     path: '/projects' },
    { label: 'Catalog Templates',     value: masterVulns.length,       icon: <GppGoodIcon />,   color: C.green,     path: '/master-vulnerabilities' },
  ];

  const sevCounts = SEV_META.map(({ sev }) =>
    sev ? masterVulns.filter((v) => v.severity === sev).length : masterVulns.length,
  );

  const recent = [...projects]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 6);

  const quickActions = [
    {
      Icon: NoteAddIcon,
      label: 'New VAPT Project',
      sub: 'Start a new assessment engagement',
      to: '/projects?new=true',
      color: C.redBright,
    },
    {
      Icon: ChatIcon,
      label: 'Memory AI Assistant',
      sub: 'Ask grounded questions on security memory',
      action: openMemoryChat,
      color: C.red,
    },
    {
      Icon: PsychologyIcon,
      label: 'Security Memory',
      sub: 'Inspect retained Hindsight memory records',
      to: '/security-memory',
      color: C.amber,
    },
    {
      Icon: SecurityIcon,
      label: 'Vulnerability Catalog',
      sub: 'Browse master security templates',
      to: '/master-vulnerabilities',
      color: C.green,
    },
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>

      {/* ── Hero Banner ──────────────────────────────────────────────────────── */}
      <Box sx={{
        position: 'relative', overflow: 'hidden',
        borderRadius: '12px',
        border: `1px solid ${C.border}`,
        bgcolor: C.bg1,
        p: { xs: '28px 24px', md: '32px 40px' },
        boxShadow: glow(C.red, 20, 0.1),
      }}>
        {/* Soft crimson radial overlay */}
        <Box sx={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'radial-gradient(circle at 90% 20%, rgba(239, 68, 68, 0.15) 0%, transparent 60%)',
        }} />

        {/* Text content */}
        <Box sx={{ position: 'relative', zIndex: 1, maxWidth: { xs: '100%', md: 620 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <SecurityIcon sx={{ color: C.redBright, fontSize: '1.2rem' }} />
            <Typography sx={{ fontSize: '0.82rem', color: C.muted, fontWeight: 600 }}>
              Analyst Platform &nbsp;|&nbsp; Welcome back, {user?.full_name?.trim() || user?.email || 'Security Analyst'}
            </Typography>
          </Box>
          <Typography sx={{
            color: C.white, fontWeight: 900, mb: 1.25, lineHeight: 1.1,
            fontSize: { xs: '1.6rem', sm: '2rem', md: '2.4rem' },
            letterSpacing: '1px',
          }}>
            RED<Box component="span" sx={{ color: C.redBright }}>LINE</Box>
          </Typography>
          <Typography sx={{
            color: C.muted, fontSize: '0.9rem', mb: 2.75,
            lineHeight: 1.65, maxWidth: 540,
          }}>
            AI-Powered VAPT Reporting with Persistent Security Memory. Retain, recall, and reflect on historical vulnerability findings, remediation notes, and retest outcomes across engagements.
          </Typography>
          <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate('/projects?new=true')}
              sx={{
                fontWeight: 700, px: 2.5, py: 0.9,
                background: `linear-gradient(135deg, ${C.redDark} 0%, ${C.red} 100%)`,
                boxShadow: glow(C.red, 14, 0.4),
                '&:hover': { boxShadow: glow(C.red, 22, 0.55) },
              }}>
              New VAPT Assessment
            </Button>
            <Button
              variant="outlined"
              startIcon={<ChatIcon />}
              onClick={openMemoryChat}
              sx={{
                px: 2.5, py: 0.9,
                borderColor: `${C.border}`,
                color: C.white,
                '&:hover': { borderColor: C.red, color: C.redBright, bgcolor: C.redDim },
              }}>
              Memory AI Chat
            </Button>
          </Box>
        </Box>
      </Box>

      {/* ── KPI Cards ───────────────────────────────────────────────────── */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2,1fr)', sm: 'repeat(4,1fr)' }, gap: 1.5 }}>
        {kpis.map((kpi) => (
          <ButtonBase key={kpi.label} onClick={() => navigate(kpi.path)}
            sx={{ borderRadius: '10px', display: 'block', textAlign: 'left', width: '100%' }}>
            <Box sx={{
              bgcolor: C.bg1, border: `1px solid ${C.border}`, borderRadius: '10px',
              p: '14px 16px',
              transition: 'border-color 0.2s, box-shadow 0.2s',
              '&:hover': { borderColor: `${kpi.color}55`, boxShadow: glow(kpi.color, 14, 0.16) },
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Box sx={{ p: 0.7, borderRadius: '7px', bgcolor: `${kpi.color}18`, color: kpi.color,
                  display: 'inline-flex', '& svg': { fontSize: '1rem' } }}>
                  {kpi.icon}
                </Box>
              </Box>
              <Typography sx={{ fontWeight: 800, lineHeight: 1, fontSize: '1.5rem', color: C.white }}>
                {kpi.value}
              </Typography>
              <Typography sx={{ fontSize: '0.7rem', color: C.muted, mt: 0.35 }}>{kpi.label}</Typography>
            </Box>
          </ButtonBase>
        ))}
      </Box>

      {/* ── Recent Projects ────────────────────────────────── */}
      <Box sx={{ bgcolor: C.bg1, border: `1px solid ${C.border}`, borderRadius: '12px', p: 2.5 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FolderOpenIcon sx={{ color: C.redBright, fontSize: '1.05rem' }} />
            <Typography sx={{ fontWeight: 700, color: C.white, fontSize: '0.92rem' }}>Recent VAPT Projects</Typography>
          </Box>
          <Button size="small" endIcon={<ArrowForwardIcon sx={{ fontSize: '0.75rem !important' }} />}
            onClick={() => navigate('/projects')}
            sx={{ color: C.redBright, fontSize: '0.75rem', p: 0, minWidth: 0,
              '&:hover': { bgcolor: 'transparent', opacity: 0.75 } }}>
            View All Projects
          </Button>
        </Box>

        {recent.length === 0 ? (
          <Box sx={{ py: 4, textAlign: 'center' }}>
            <FolderOpenIcon sx={{ fontSize: 36, color: C.mutedDim, mb: 1 }} />
            <Typography sx={{ color: C.muted, fontSize: '0.82rem', mb: 1.5 }}>No projects yet</Typography>
            <Button variant="contained" size="small" onClick={() => navigate('/projects?new=true')}
              sx={{ bgcolor: C.redDark, fontSize: '0.78rem' }}>Create Project</Button>
          </Box>
        ) : (
          <Box sx={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {['Project Name', 'Code', 'Client', 'Created On', 'Status'].map((h) => (
                    <th key={h} style={{
                      textAlign: 'left', padding: '3px 12px 8px',
                      fontSize: '0.67rem', fontWeight: 700, letterSpacing: '0.6px',
                      color: C.muted, textTransform: 'uppercase',
                      borderBottom: `1px solid ${C.border}`,
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recent.map((p) => {
                  const st = STATUS_STYLE[p.status] ?? STATUS_STYLE.DRAFT;
                  return (
                    <tr key={p.id} onClick={() => navigate(`/projects/${p.id}`)}
                      style={{ cursor: 'pointer', transition: 'background 0.15s' }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = C.bg3)}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}>
                      <td style={{ padding: '10px 12px', borderBottom: `1px solid ${C.border}` }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <FolderOpenIcon sx={{ fontSize: '0.85rem', color: C.redBright, flexShrink: 0 }} />
                          <Typography sx={{ fontSize: '0.82rem', fontWeight: 600, color: C.white }}>
                            {p.project_name}
                          </Typography>
                        </Box>
                      </td>
                      <td style={{ padding: '10px 12px', fontSize: '0.77rem', color: C.redBright,
                        fontWeight: 700, borderBottom: `1px solid ${C.border}`, whiteSpace: 'nowrap' }}>
                        {p.project_code}
                      </td>
                      <td style={{ padding: '10px 12px', fontSize: '0.77rem', color: C.muted,
                        borderBottom: `1px solid ${C.border}` }}>
                        {p.client_name}
                      </td>
                      <td style={{ padding: '10px 12px', fontSize: '0.77rem', color: C.muted,
                        borderBottom: `1px solid ${C.border}`, whiteSpace: 'nowrap' }}>
                        {new Date(p.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td style={{ padding: '10px 12px', borderBottom: `1px solid ${C.border}` }}>
                        <Chip label={getProjectStatusLabel(p.status)} size="small" sx={{
                          bgcolor: st.bg, color: st.color, border: `1px solid ${st.border}`,
                          fontWeight: 600, fontSize: '0.67rem', height: 20,
                        }} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Box>
        )}
      </Box>

      {/* ── Quick Actions + Security Memory Overview ─────────────────── */}
      <Box sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
        gap: 2,
        alignItems: 'stretch',
      }}>

        {/* Quick Actions */}
        <Box sx={{ bgcolor: C.bg1, border: `1px solid ${C.border}`, borderRadius: '12px', p: 2.5,
          display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <BoltIcon sx={{ color: C.redBright, fontSize: '1.05rem' }} />
            <Typography sx={{ fontWeight: 700, color: C.white, fontSize: '0.92rem' }}>Analyst Quick Shortcuts</Typography>
          </Box>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5, flex: 1 }}>
            {quickActions.map(({ Icon, label, sub, to, action, color }: any) => (
              <Box key={label} onClick={() => action ? action() : navigate(to)}
                sx={{
                  p: 2, borderRadius: '10px', cursor: 'pointer',
                  bgcolor: C.bg2, border: `1px solid ${C.border}`,
                  display: 'flex', flexDirection: 'column',
                  transition: 'all 0.18s',
                  '&:hover': {
                    borderColor: `${color}44`, bgcolor: C.bg3,
                    boxShadow: glow(color, 12, 0.1),
                    '& .qa-arrow': { opacity: 1, transform: 'translateX(3px)' },
                  },
                }}>
                <Box sx={{ color, mb: 1, display: 'flex' }}>
                  <Icon sx={{ fontSize: '1.4rem' }} />
                </Box>
                <Typography sx={{ fontWeight: 700, fontSize: '0.81rem', color: C.white, mb: 0.3 }}>
                  {label}
                </Typography>
                <Typography sx={{ fontSize: '0.69rem', color: C.muted, lineHeight: 1.4, flex: 1 }}>
                  {sub}
                </Typography>
                <Box sx={{ mt: 1, display: 'flex', justifyContent: 'flex-end' }}>
                  <ArrowForwardIcon className="qa-arrow"
                    sx={{ fontSize: '0.78rem', color, opacity: 0, transition: 'all 0.18s' }} />
                </Box>
              </Box>
            ))}
          </Box>
        </Box>

        {/* Security Memory Distribution */}
        <Box sx={{ bgcolor: C.bg1, border: `1px solid ${C.border}`, borderRadius: '12px', p: 2.5,
          display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <BugReportIcon sx={{ color: C.redBright, fontSize: '1.05rem' }} />
            <Typography sx={{ fontWeight: 700, color: C.white, fontSize: '0.92rem' }}>
              Vulnerability Catalog Distribution
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, flex: 1 }}>
            {SEV_META.map((s, i) => (
              <Box key={s.label} sx={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                p: '10px 14px', borderRadius: '8px',
                bgcolor: C.bg2, border: `1px solid ${C.border}`,
                flex: 1,
                transition: 'border-color 0.18s',
                '&:hover': { borderColor: `${s.color}44` },
              }}>
                <Box sx={{ flex: 1, minWidth: 0, mr: 1.5 }}>
                  <Typography sx={{ fontSize: '0.81rem', fontWeight: 700, color: C.white, lineHeight: 1.25 }}>
                    {s.label}
                  </Typography>
                  <Typography sx={{ fontSize: '0.65rem', color: C.muted }}>{s.sub}</Typography>
                </Box>
                <Avatar sx={{
                  width: 26, height: 26, fontSize: '0.72rem', fontWeight: 800,
                  bgcolor: `${s.color}22`, color: s.color, flexShrink: 0,
                }}>
                  {sevCounts[i]}
                </Avatar>
              </Box>
            ))}
          </Box>
        </Box>

      </Box>
    </Box>
  );
};


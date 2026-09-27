import React, { useState } from 'react';
import {
  Box, Typography, Paper, Card, CardContent, Chip,
  InputBase, CircularProgress, Button, Alert,
} from '@mui/material';
import PsychologyIcon from '@mui/icons-material/Psychology';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import SecurityIcon from '@mui/icons-material/Security';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import { useQuery } from '@tanstack/react-query';
import { memoryApi } from '../api/memory';
import { C, cardStyle } from '../theme';

export const SecurityMemoryPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const { data: records = [], isLoading, error, refetch } = useQuery({
    queryKey: ['securityMemories'],
    queryFn: () => memoryApi.listRecords(100, 0),
  });

  const filtered = records.filter(r =>
    r.sanitized_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.project_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (r.vulnerability_category ?? '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (r.remediation_notes ?? '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getSeverityColor = (sev?: string) => {
    switch (sev?.toUpperCase()) {
      case 'CRITICAL': return C.critical;
      case 'HIGH':     return C.high;
      case 'MEDIUM':   return C.medium;
      case 'LOW':      return C.low;
      default:         return C.muted;
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
            <PsychologyIcon sx={{ color: C.red, fontSize: '2.2rem', filter: `drop-shadow(0 0 10px ${C.red})` }} />
            <Typography variant="h4" sx={{ fontWeight: 800, color: C.white }}>
              Security Memory Transparency
            </Typography>
          </Box>
          <Typography variant="body2" sx={{ color: C.muted }}>
            Inspection view for persistent cross-session VAPT memories managed by REDLINE Hindsight Engine.
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={() => refetch()}
          sx={{ borderColor: C.border, color: C.white, '&:hover': { borderColor: C.red, color: C.redBright } }}
        >
          Refresh Memory
        </Button>
      </Box>

      {/* Info Banner */}
      <Alert severity="info" icon={<SecurityIcon sx={{ color: C.redBright }} />} sx={{ bgcolor: C.redDim, border: `1px solid ${C.red}44`, color: C.white }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: C.redBright }}>
          Persistent Security Memory System
        </Typography>
        <Typography variant="caption" sx={{ color: C.muted }}>
          Retained records store sanitized vulnerability descriptions, remediation guidance, and verified retest outcomes across authorized engagements. Raw tokens and secrets are automatically redacted prior to retention.
        </Typography>
      </Alert>

      {/* Search Bar */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, bgcolor: C.bg2, border: `1px solid ${C.border}`, borderRadius: 2, px: 2, py: 1 }}>
        <SearchIcon sx={{ color: C.muted }} />
        <InputBase
          placeholder="Filter security memory records by title, project, or category..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ flex: 1, color: C.white, fontSize: '0.9rem' }}
        />
      </Box>

      {/* Content */}
      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress sx={{ color: C.red }} />
        </Box>
      ) : error ? (
        <Alert severity="error">Failed to load security memory records.</Alert>
      ) : filtered.length === 0 ? (
        <Paper sx={{ p: 6, textAlign: 'center', bgcolor: C.bg1, border: `1px solid ${C.border}` }}>
          <PsychologyIcon sx={{ fontSize: '3.5rem', color: C.mutedDim, mb: 1 }} />
          <Typography variant="h6" sx={{ color: C.white, fontWeight: 700 }}>
            {searchTerm ? 'No matching memories found' : 'Security Memory is Currently Empty'}
          </Typography>
          <Typography variant="body2" sx={{ color: C.muted, mt: 0.5, maxWidth: 500, mx: 'auto' }}>
            {searchTerm
              ? 'Try refining your search terms to locate retained historical findings.'
              : 'As findings are created, analyzed, and retested in your VAPT projects, authorized records will be retained here in Hindsight memory.'}
          </Typography>
        </Paper>
      ) : (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
          {filtered.map((record) => (
            <Card key={record.id} sx={{ ...cardStyle, height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, flex: 1 }}>
                {/* Top Bar */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <FolderOpenIcon sx={{ color: C.redBright, fontSize: '1.1rem' }} />
                    <Typography variant="subtitle2" sx={{ color: C.white, fontWeight: 700 }}>
                      {record.project_name} ({record.project_code})
                    </Typography>
                  </Box>
                  <Chip
                    label={record.severity || 'MEDIUM'}
                    size="small"
                    sx={{
                      bgcolor: `${getSeverityColor(record.severity)}22`,
                      color: getSeverityColor(record.severity),
                      border: `1px solid ${getSeverityColor(record.severity)}44`,
                      fontWeight: 700,
                      fontSize: '0.7rem',
                    }}
                  />
                </Box>

                {/* Title */}
                <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 700, color: C.white }}>
                  {record.sanitized_title}
                </Typography>

                {/* Summary */}
                <Typography variant="body2" sx={{ color: C.muted, whiteSpace: 'pre-line', fontSize: '0.85rem' }}>
                  {record.sanitized_summary}
                </Typography>

                {/* Remediation Notes */}
                {record.remediation_notes && (
                  <Box sx={{ bgcolor: C.bg2, p: 1.5, borderRadius: 2, border: `1px solid ${C.border}` }}>
                    <Typography variant="caption" sx={{ color: C.redBright, fontWeight: 700, display: 'block', mb: 0.5 }}>
                      REMEDIATION MEMORY:
                    </Typography>
                    <Typography variant="body2" sx={{ color: C.white, fontSize: '0.8rem' }}>
                      {record.remediation_notes}
                    </Typography>
                  </Box>
                )}

                {/* Footer Stats */}
                <Box sx={{ mt: 'auto', pt: 1.5, borderTop: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <CheckCircleOutlinedIcon sx={{ fontSize: '0.9rem', color: record.retest_outcome === 'PASSED' ? C.green : C.amber }} />
                    <Typography variant="caption" sx={{ color: C.white, fontWeight: 600 }}>
                      Retest: {record.retest_outcome && record.retest_outcome !== 'NOT_TESTED' ? record.retest_outcome : 'Pending'}
                    </Typography>
                  </Box>
                  <Typography variant="caption" sx={{ color: C.mutedDim }}>
                    Retained by {record.retained_by_email}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}
    </Box>
  );
};

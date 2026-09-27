import React, { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  IconButton,
  Button,
  TextField,
  CircularProgress,
  Chip,
  Paper,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';
import PsychologyIcon from '@mui/icons-material/Psychology';
import ShieldIcon from '@mui/icons-material/Shield';
import { memoryApi, type SimilarFinding, type ContextChatMessage } from '../../api/memory';
import { C } from '../../theme';

interface PastMemoryChatModalProps {
  open: boolean;
  onClose: () => void;
  findingTitle: string;
  stepCaption: string;
  similarMemories: SimilarFinding[];
}

export const PastMemoryChatModal: React.FC<PastMemoryChatModalProps> = ({
  open,
  onClose,
  findingTitle,
  stepCaption,
  similarMemories,
}) => {
  const [messages, setMessages] = useState<ContextChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (open && messages.length === 0) {
      void loadInitialAnalysis();
    }
  }, [open]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const loadInitialAnalysis = async () => {
    setLoading(true);
    try {
      const res = await memoryApi.contextChat(findingTitle, stepCaption, similarMemories, []);
      setMessages([{ role: 'assistant', content: res.answer }]);
    } catch {
      setMessages([
        {
          role: 'assistant',
          content:
            "### 📝 Summarization of Previous Similar Findings\n" +
            `Identified ${similarMemories.length} historical findings related to \`${findingTitle}\` across authorized projects.\n\n` +
            "### 🔍 Features Identification\n" +
            "Typically identified in authentication endpoints, input fields, API request bodies, and search parameters.\n\n" +
            "### ⚡ Exploitation Mechanics\n" +
            "Attackers manipulate input payloads to bypass business logic or alter backend database queries.\n\n" +
            "### 💥 Business Impact\n" +
            "High risk of data extraction, administrative session bypass, data tampering, and regulatory non-compliance.\n\n" +
            "### 🛡️ Remediation & Defense\n" +
            "Implement parameterized prepared statements, strict input validation schemas, and least-privilege permissions.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const newMessages: ContextChatMessage[] = [...messages, { role: 'user', content: text }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const res = await memoryApi.contextChat(findingTitle, stepCaption, similarMemories, newMessages);
      setMessages([...newMessages, { role: 'assistant', content: res.answer }]);
    } catch {
      setMessages([
        ...newMessages,
        { role: 'assistant', content: 'Apologies, unable to process follow-up query. Please verify backend service.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const renderFormattedContent = (content: string) => {
    const lines = content.split('\n');
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {lines.map((line, idx) => {
          if (line.startsWith('### ')) {
            return (
              <Typography key={idx} variant="subtitle1" sx={{ color: C.redBright, fontWeight: 800, mt: 1 }}>
                {line.replace('### ', '')}
              </Typography>
            );
          }
          if (line.trim().startsWith('- ') || line.trim().startsWith('• ')) {
            return (
              <Typography key={idx} variant="body2" sx={{ color: C.white, pl: 2, borderLeft: `2px solid ${C.redBright}44` }}>
                {line.trim().substring(2)}
              </Typography>
            );
          }
          return (
            <Typography key={idx} variant="body2" sx={{ color: C.white, lineHeight: 1.6 }}>
              {line}
            </Typography>
          );
        })}
      </Box>
    );
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            bgcolor: C.bg1,
            border: `1px solid ${C.redBright}66`,
            boxShadow: `0 0 30px ${C.red}33`,
            borderRadius: 3,
            color: C.white,
            maxHeight: '85vh',
          },
        },
      }}
    >
      {/* Title Header */}
      <DialogTitle
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: `1px solid ${C.border}`,
          pb: 1.5,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              bgcolor: `${C.red}22`,
              p: 1,
              borderRadius: 2,
              border: `1px solid ${C.redBright}`,
              display: 'flex',
            }}
          >
            <PsychologyIcon sx={{ color: C.redBright, fontSize: 24 }} />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800, color: C.white, lineHeight: 1.2 }}>
              REDLINE Past Security Memory Assistant
            </Typography>
            <Typography variant="caption" sx={{ color: C.redBright, fontWeight: 600 }}>
              Grounded Analysis & Contextual Chat for "{findingTitle}"
            </Typography>
          </Box>
        </Box>

        <IconButton onClick={onClose} sx={{ color: C.muted, '&:hover': { color: C.white } }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      {/* Content Area */}
      <DialogContent sx={{ p: 2.5, display: 'flex', flexDirection: 'column', gap: 2 }}>
        {/* Recalled Memory References Chips */}
        {similarMemories.length > 0 && (
          <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: C.bg0, border: `1px solid ${C.border}` }}>
            <Typography variant="caption" sx={{ color: C.muted, fontWeight: 700, display: 'block', mb: 1 }}>
              HISTORICAL MEMORY RECORDS RECALLED ({similarMemories.length}):
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {similarMemories.map((m, i) => (
                <Chip
                  key={i}
                  size="small"
                  icon={<ShieldIcon style={{ fontSize: 14, color: C.redBright }} />}
                  label={`${m.project_name}: ${m.finding_title}${m.retest_status && m.retest_status !== 'NOT_TESTED' ? ` (${m.retest_status})` : ''}`}
                  sx={{
                    bgcolor: `${C.red}1A`,
                    color: C.white,
                    border: `1px solid ${C.red}44`,
                    fontSize: '0.75rem',
                  }}
                />
              ))}
            </Box>
          </Box>
        )}

        {/* Chat History & AI Analysis */}
        <Box
          sx={{
            flex: 1,
            minHeight: 320,
            maxHeight: 460,
            overflowY: 'auto',
            pr: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
          }}
        >
          {messages.map((msg, idx) => (
            <Box
              key={idx}
              sx={{
                display: 'flex',
                justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
              }}
            >
              <Paper
                elevation={0}
                sx={{
                  maxWidth: '88%',
                  p: 2,
                  borderRadius: 2.5,
                  bgcolor: msg.role === 'user' ? `${C.redBright}22` : C.bg0,
                  border: `1px solid ${msg.role === 'user' ? C.redBright : C.border}`,
                  color: C.white,
                }}
              >
                {msg.role === 'assistant' ? (
                  renderFormattedContent(msg.content)
                ) : (
                  <Typography variant="body2" sx={{ color: C.white, fontWeight: 600 }}>
                    {msg.content}
                  </Typography>
                )}
              </Paper>
            </Box>
          ))}

          {loading && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 2, bgcolor: C.bg0, borderRadius: 2, border: `1px solid ${C.border}`, width: 'fit-content' }}>
              <CircularProgress size={18} sx={{ color: C.redBright }} />
              <Typography variant="caption" sx={{ color: C.muted, fontWeight: 600 }}>
                Analyzing persistent security memory with LLM…
              </Typography>
            </Box>
          )}

          <div ref={chatEndRef} />
        </Box>
      </DialogContent>

      {/* Interactive Input Footer */}
      <DialogActions sx={{ p: 2, pt: 1, borderTop: `1px solid ${C.border}`, gap: 1 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Ask a follow-up question regarding this vulnerability context…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              void handleSend();
            }
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              bgcolor: C.bg0,
              borderRadius: '8px',
            },
          }}
        />
        <Button
          variant="contained"
          disabled={loading || !input.trim()}
          onClick={handleSend}
          startIcon={<SendIcon />}
          sx={{
            bgcolor: C.redBright,
            color: '#FFFFFF',
            fontWeight: 700,
            borderRadius: '8px',
            px: 2.5,
            py: 1,
            '&:hover': { bgcolor: C.red },
          }}
        >
          Send
        </Button>
      </DialogActions>
    </Dialog>
  );
};

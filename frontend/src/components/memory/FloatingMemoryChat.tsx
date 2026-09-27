import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  TextField,
  Button,
  CircularProgress,
  Chip,
  Tooltip,
  Fab,
} from '@mui/material';
import PsychologyIcon from '@mui/icons-material/Psychology';
import ChatIcon from '@mui/icons-material/Chat';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';
import ShieldIcon from '@mui/icons-material/Shield';
import MinimizeIcon from '@mui/icons-material/Minimize';
import SparklesIcon from '@mui/icons-material/AutoAwesome';
import { memoryApi, type ContextChatMessage } from '../../api/memory';
import { C } from '../../theme';

const SUGGESTED_PROMPTS = [
  'I have a search field in my application, what are possible attacks?',
  'How to test for JWT token tampering & weak algorithms?',
  'Summarize past SQL Injection findings from security memory',
];

export const openMemoryChat = () => {
  window.dispatchEvent(new CustomEvent('open-memory-chat'));
};

export const FloatingMemoryChat: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ContextChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleOpen = () => setOpen(true);
    window.addEventListener('open-memory-chat', handleOpen);
    return () => window.removeEventListener('open-memory-chat', handleOpen);
  }, []);

  useEffect(() => {
    if (open) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, loading, open]);

  const handleSend = async (queryText?: string) => {
    const text = (queryText ?? input).trim();
    if (!text || loading) return;

    const userMsg: ContextChatMessage = { role: 'user', content: text };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const res = await memoryApi.floatingChat(text, newMessages);
      setMessages([...newMessages, { role: 'assistant', content: res.answer }]);
    } catch {
      setMessages([
        ...newMessages,
        {
          role: 'assistant',
          content:
            'Unable to process query. Please ensure backend server is active on port 8000.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const renderFormattedContent = (content: string) => {
    const lines = content.split('\n');
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.8 }}>
        {lines.map((line, idx) => {
          if (line.startsWith('### ') || line.startsWith('📌')) {
            return (
              <Typography
                key={idx}
                variant="subtitle2"
                sx={{ color: C.redBright, fontWeight: 800, mt: 1, mb: 0.2 }}
              >
                {line.replace('### ', '')}
              </Typography>
            );
          }
          if (line.startsWith('**') && line.endsWith('**')) {
            return (
              <Typography key={idx} variant="subtitle2" sx={{ color: C.white, fontWeight: 700 }}>
                {line.replace(/\*\*/g, '')}
              </Typography>
            );
          }
          if (line.trim().startsWith('- ') || line.trim().startsWith('• ') || line.trim().startsWith('1. ') || line.trim().startsWith('2. ') || line.trim().startsWith('3. ')) {
            return (
              <Typography
                key={idx}
                variant="body2"
                sx={{ color: C.white, pl: 1.5, borderLeft: `2px solid ${C.redBright}44`, fontSize: '0.82rem' }}
              >
                {line.trim()}
              </Typography>
            );
          }
          return (
            <Typography key={idx} variant="body2" sx={{ color: C.white, fontSize: '0.83rem', lineHeight: 1.55 }}>
              {line}
            </Typography>
          );
        })}
      </Box>
    );
  };

  return (
    <>
      {/* Floating Action Button - Always docked on bottom right */}
      {!open && (
        <Tooltip title="Open REDLINE AI Security Memory Assistant" placement="left">
          <Fab
            onClick={() => setOpen(true)}
            sx={{
              position: 'fixed',
              bottom: 24,
              right: 24,
              zIndex: 1300,
              bgcolor: C.redBright,
              color: '#FFFFFF',
              boxShadow: `0 0 24px ${C.red}88`,
              border: `1px solid ${C.redBright}`,
              '&:hover': {
                bgcolor: C.red,
                transform: 'scale(1.08)',
                boxShadow: `0 0 32px ${C.red}`,
              },
              transition: 'all 0.25s ease-in-out',
            }}
          >
            <Box sx={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
              <PsychologyIcon sx={{ fontSize: 28 }} />
              <Box
                sx={{
                  position: 'absolute',
                  bottom: -5,
                  right: -7,
                  bgcolor: '#06070a',
                  borderRadius: '50%',
                  p: '2px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: `1.5px solid ${C.redBright}`,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.6)',
                }}
              >
                <ChatIcon sx={{ fontSize: 13, color: C.redBright }} />
              </Box>
            </Box>
          </Fab>
        </Tooltip>
      )}

      {/* Floating Chat Drawer Window */}
      {open && (
        <Paper
          elevation={12}
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            width: { xs: 'calc(100vw - 32px)', sm: 410 },
            height: 560,
            maxHeight: 'calc(100vh - 48px)',
            zIndex: 1300,
            bgcolor: C.bg1,
            border: `1px solid ${C.redBright}77`,
            boxShadow: `0 20px 60px rgba(0,0,0,0.9), 0 0 30px ${C.red}33`,
            borderRadius: 3.5,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <Box
            sx={{
              p: 2,
              bgcolor: C.bg0,
              borderBottom: `1px solid ${C.border}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
              <Box
                sx={{
                  bgcolor: `${C.red}25`,
                  p: 0.8,
                  borderRadius: 2,
                  border: `1px solid ${C.redBright}`,
                  display: 'flex',
                }}
              >
                <ShieldIcon sx={{ color: C.redBright, fontSize: 20 }} />
              </Box>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: C.white, lineHeight: 1.2, fontSize: '0.92rem' }}>
                  REDLINE AI Memory Assistant
                </Typography>
                <Typography variant="caption" sx={{ color: C.redBright, fontWeight: 700, fontSize: '0.7rem' }}>
                  ⚡ Connected to Hindsight Memory
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', gap: 0.5 }}>
              <IconButton size="small" onClick={() => setOpen(false)} sx={{ color: C.muted, '&:hover': { color: C.white } }}>
                <MinimizeIcon fontSize="small" />
              </IconButton>
              <IconButton size="small" onClick={() => setOpen(false)} sx={{ color: C.muted, '&:hover': { color: C.white } }}>
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>
          </Box>

          {/* Chat Body */}
          <Box
            sx={{
              flex: 1,
              p: 2,
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: 1.8,
              bgcolor: C.bg0,
            }}
          >
            {messages.length === 0 && (
              <Box sx={{ py: 2, textAling: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5 }}>
                <SparklesIcon sx={{ color: C.redBright, fontSize: 32 }} />
                <Typography variant="body2" sx={{ color: C.white, fontWeight: 700, textAlign: 'center' }}>
                  Ask any security question or query past VAPT findings
                </Typography>
                <Typography variant="caption" sx={{ color: C.muted, textAlign: 'center', px: 2 }}>
                  Answers combine general security knowledge with relevant historical findings from Hindsight memory.
                </Typography>

                <Box sx={{ width: '100%', mt: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Typography variant="caption" sx={{ color: C.muted, fontWeight: 700 }}>
                    SUGGESTED PROMPTS:
                  </Typography>
                  {SUGGESTED_PROMPTS.map((promptText, i) => (
                    <Chip
                      key={i}
                      label={promptText}
                      onClick={() => void handleSend(promptText)}
                      sx={{
                        bgcolor: C.bg1,
                        color: C.white,
                        border: `1px solid ${C.border}`,
                        borderRadius: 2,
                        fontSize: '0.75rem',
                        py: 1.5,
                        justifyContent: 'flex-start',
                        cursor: 'pointer',
                        '&:hover': {
                          bgcolor: `${C.red}25`,
                          borderColor: C.redBright,
                        },
                      }}
                    />
                  ))}
                </Box>
              </Box>
            )}

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
                    p: 1.8,
                    borderRadius: 2.5,
                    bgcolor: msg.role === 'user' ? `${C.redBright}22` : C.bg1,
                    border: `1px solid ${msg.role === 'user' ? C.redBright : C.border}`,
                    color: C.white,
                  }}
                >
                  {msg.role === 'assistant' ? (
                    renderFormattedContent(msg.content)
                  ) : (
                    <Typography variant="body2" sx={{ color: C.white, fontWeight: 600, fontSize: '0.85rem' }}>
                      {msg.content}
                    </Typography>
                  )}
                </Paper>
              </Box>
            ))}

            {loading && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 1.5, bgcolor: C.bg1, borderRadius: 2, border: `1px solid ${C.border}`, width: 'fit-content' }}>
                <CircularProgress size={16} sx={{ color: C.redBright }} />
                <Typography variant="caption" sx={{ color: C.muted, fontWeight: 600 }}>
                  Searching security memory & generating solution…
                </Typography>
              </Box>
            )}

            <div ref={chatEndRef} />
          </Box>

          {/* Input Footer */}
          <Box sx={{ p: 1.5, borderTop: `1px solid ${C.border}`, bgcolor: C.bg0, display: 'flex', gap: 1 }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Ask security question or past finding query…"
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
                  bgcolor: C.bg1,
                  borderRadius: '8px',
                  fontSize: '0.85rem',
                },
              }}
            />
            <Button
              variant="contained"
              disabled={loading || !input.trim()}
              onClick={() => void handleSend()}
              sx={{
                bgcolor: C.redBright,
                color: '#FFFFFF',
                fontWeight: 700,
                borderRadius: '8px',
                minWidth: 46,
                px: 1.5,
                '&:hover': { bgcolor: C.red },
              }}
            >
              <SendIcon fontSize="small" />
            </Button>
          </Box>
        </Paper>
      )}
    </>
  );
};

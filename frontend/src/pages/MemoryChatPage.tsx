import React, { useState, useRef, useEffect } from 'react';
import {
  Box, Typography, Paper, TextField, Button,
  Chip, Avatar, CircularProgress,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import ChatIcon from '@mui/icons-material/Chat';
import SecurityIcon from '@mui/icons-material/Security';
import PersonIcon from '@mui/icons-material/Person';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import { memoryApi } from '../api/memory';
import type { MemoryChatResponse, MemoryCitation } from '../api/memory';
import { C, glow } from '../theme';

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  citations?: MemoryCitation[];
  hasMemories?: boolean;
  timestamp: string;
}

const SAMPLE_PROMPTS = [
  "Have we documented SQL injection findings in previous projects?",
  "Show the remediation and retest outcome for historical findings.",
  "Which previous findings involved authentication or session management?",
  "Summarize documented remediation approaches for similar findings.",
];

export const MemoryChatPage: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: "Welcome to **REDLINE Memory Assistant**. I am connected to your authorized VAPT security memory. Ask me any question about past findings, remediation approaches, or retest outcomes.",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (queryToSend?: string) => {
    const q = (queryToSend || inputQuery).trim();
    if (!q || loading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: q,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!queryToSend) setInputQuery('');
    setLoading(true);

    try {
      const res: MemoryChatResponse = await memoryApi.chat(q);
      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: res.answer,
        citations: res.citations,
        hasMemories: res.has_relevant_memories,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: 'ai',
        text: "Error communicating with REDLINE Security Memory Chat. Please ensure the backend server is active.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 120px)', gap: 2 }}>
      {/* Top Banner */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <ChatIcon sx={{ color: C.red, fontSize: '2.2rem', filter: `drop-shadow(0 0 10px ${C.red})` }} />
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: C.white }}>
            REDLINE Security Memory Chat
          </Typography>
          <Typography variant="body2" sx={{ color: C.muted }}>
            Grounded Retrieval-Augmented Assistant powered by Hindsight Persistent Memory and Gemini LLM.
          </Typography>
        </Box>
      </Box>

      {/* Suggested Questions */}
      <Box sx={{ display: 'flex', gap: 1, overflowX: 'auto', pb: 0.5 }}>
        {SAMPLE_PROMPTS.map((prompt, idx) => (
          <Chip
            key={idx}
            label={prompt}
            onClick={() => handleSend(prompt)}
            disabled={loading}
            sx={{
              bgcolor: C.bg2,
              color: C.white,
              border: `1px solid ${C.border}`,
              cursor: 'pointer',
              fontSize: '0.78rem',
              '&:hover': { bgcolor: C.bg3, borderColor: C.red, color: C.redBright },
            }}
          />
        ))}
      </Box>

      {/* Chat Messages Panel */}
      <Paper sx={{ flex: 1, p: 2.5, bgcolor: C.bg1, border: `1px solid ${C.border}`, borderRadius: 3, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {messages.map((msg) => (
          <Box
            key={msg.id}
            sx={{
              display: 'flex',
              flexDirection: msg.sender === 'user' ? 'row-reverse' : 'row',
              gap: 1.5,
              alignItems: 'flex-start',
            }}
          >
            <Avatar
              sx={{
                bgcolor: msg.sender === 'user' ? C.bg3 : C.redDark,
                color: C.white,
                width: 36,
                height: 36,
                boxShadow: msg.sender === 'ai' ? glow(C.red, 12, 0.3) : 'none',
              }}
            >
              {msg.sender === 'user' ? <PersonIcon fontSize="small" /> : <SecurityIcon fontSize="small" />}
            </Avatar>

            <Box sx={{ maxWidth: '80%', display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Paper
                sx={{
                  p: 2,
                  bgcolor: msg.sender === 'user' ? C.redDark : C.bg2,
                  border: `1px solid ${msg.sender === 'user' ? C.red : C.border}`,
                  borderRadius: 3,
                  color: C.white,
                }}
              >
                <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', fontSize: '0.9rem', lineHeight: 1.6 }}>
                  {msg.text}
                </Typography>

                {/* Grounded Citations */}
                {msg.citations && msg.citations.length > 0 && (
                  <Box sx={{ mt: 2, pt: 1.5, borderTop: `1px solid ${C.border}` }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 1 }}>
                      <MenuBookIcon sx={{ color: C.redBright, fontSize: '0.9rem' }} />
                      <Typography variant="caption" sx={{ color: C.redBright, fontWeight: 700, letterSpacing: '0.5px' }}>
                        RECALLED HISTORICAL REFERENCES:
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                      {msg.citations.map((cit, cIdx) => (
                        <Box key={cIdx} sx={{ bgcolor: C.bg1, p: 1, borderRadius: 1, border: `1px solid ${C.border}` }}>
                          <Typography variant="caption" sx={{ fontWeight: 700, color: C.white, display: 'block' }}>
                            • [{cit.project_name}] {cit.finding_title} ({cit.severity})
                          </Typography>
                          {cit.remediation_summary && (
                            <Typography variant="caption" sx={{ color: C.muted, fontSize: '0.75rem', pl: 1 }}>
                              Remediation: {cit.remediation_summary}
                            </Typography>
                          )}
                        </Box>
                      ))}
                    </Box>
                  </Box>
                )}
              </Paper>
              <Typography variant="caption" sx={{ color: C.mutedDim, px: 1, alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start' }}>
                {msg.timestamp}
              </Typography>
            </Box>
          </Box>
        ))}

        {loading && (
          <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
            <Avatar sx={{ bgcolor: C.redDark, width: 36, height: 36 }}>
              <AutoAwesomeIcon fontSize="small" sx={{ color: C.white }} />
            </Avatar>
            <Paper sx={{ p: 1.5, bgcolor: C.bg2, border: `1px solid ${C.border}`, borderRadius: 3, display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <CircularProgress size={18} sx={{ color: C.red }} />
              <Typography variant="body2" sx={{ color: C.muted }}>
                Recalling authorized Hindsight memory & generating grounded answer...
              </Typography>
            </Paper>
          </Box>
        )}
        <div ref={messagesEndRef} />
      </Paper>

      {/* Input Form */}
      <Paper component="form" onSubmit={(e) => { e.preventDefault(); handleSend(); }} sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 1, bgcolor: C.bg1, border: `1px solid ${C.border}`, borderRadius: 3 }}>
        <TextField
          fullWidth
          placeholder="Ask REDLINE Memory Assistant about historical findings, evidence, or remediations..."
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          disabled={loading}
          size="small"
          sx={{
            '& .MuiOutlinedInput-root': { bgcolor: C.bg2 },
          }}
        />
        <Button
          variant="contained"
          type="submit"
          disabled={!inputQuery.trim() || loading}
          endIcon={<SendIcon />}
          sx={{ px: 3, height: 40 }}
        >
          Ask
        </Button>
      </Paper>
    </Box>
  );
};

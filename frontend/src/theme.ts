import { createTheme, alpha } from '@mui/material/styles';

// ── REDLINE Design tokens ───────────────────────────────────────────────────
export const C = {
  bg0:        '#050609',             // dark base under red grid
  bg1:        'rgba(10, 12, 20, 0.45)', // translucent glass panel background
  bg2:        'rgba(14, 16, 26, 0.38)', // translucent glass card / input background
  bg3:        'rgba(239, 68, 68, 0.16)',// translucent red hover state
  border:     'rgba(239, 68, 68, 0.32)',// crimson glowing glass border
  borderGlow: 'rgba(239, 68, 68, 0.65)',// red glow
  red:        '#ef4444',   // vivid red primary accent
  redDark:    '#dc2626',   // dark red button gradient target
  redBright:  '#ff5555',   // bright highlight red
  redDim:     'rgba(239, 68, 68, 0.15)',// subtle red highlight fill
  white:      '#f8fafc',   // clean white primary text
  muted:      '#94a3b8',   // muted gray secondary text
  mutedDim:   '#475569',   // dark gray disabled/caption text

  // Severity Colors
  critical: '#ef4444',
  high:     '#f97316',
  medium:   '#eab308',
  low:      '#3b82f6',
  info:     '#8b5cf6',

  // Status Colors
  green:  '#10b981',
  amber:  '#f59e0b',
  blue:   '#3b82f6',
};

export const glow = (color: string, size = 20, opacity = 0.25) =>
  `0 0 ${size}px ${alpha(color, opacity)}`;

export const cardStyle = {
  bgcolor: C.bg1,
  backdropFilter: 'blur(16px) saturate(180%)',
  border: `1px solid ${C.border}`,
  borderRadius: 3,
  transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
  '&:hover': {
    borderColor: C.borderGlow,
    boxShadow: glow(C.red, 20, 0.25),
  },
};

// ── MUI Theme ─────────────────────────────────────────────────────────────────
export const theme = createTheme({
  palette: {
    mode: 'dark',
    background: { default: C.bg0, paper: C.bg1 },
    primary:   { main: C.red,      light: C.redBright, dark: C.redDark },
    secondary: { main: '#dc2626',  light: '#f87171',   dark: '#991b1b' },
    error:     { main: C.red },
    warning:   { main: C.amber },
    success:   { main: C.green },
    text: {
      primary:   C.white,
      secondary: C.muted,
      disabled:  C.mutedDim,
    },
    divider: C.border,
  },

  typography: {
    fontFamily: "'Inter', sans-serif",
    h1: { fontWeight: 800 },
    h2: { fontWeight: 800 },
    h3: { fontWeight: 700 },
    h4: { fontWeight: 700 },
    h5: { fontWeight: 700 },
    h6: { fontWeight: 700 },
    subtitle1: { fontWeight: 600, color: C.white },
    subtitle2: { fontWeight: 600, color: C.muted },
    body1:  { color: C.white },
    body2:  { color: C.muted },
    caption: { color: C.mutedDim },
  },

  shape: { borderRadius: 10 },

  components: {
    // ── Paper ──────────────────────────────────────────────────────────────
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: C.bg1,
          backdropFilter: 'blur(16px) saturate(180%)',
          WebkitBackdropFilter: 'blur(16px) saturate(180%)',
          border: `1px solid ${C.border}`,
        },
      },
    },

    // ── Button ─────────────────────────────────────────────────────────────
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: 8,
          transition: 'all 0.2s ease',
          '&.MuiButton-containedPrimary': {
            background: `linear-gradient(135deg, ${C.redDark} 0%, ${C.red} 100%)`,
            boxShadow: glow(C.red, 16, 0.3),
            '&:hover': {
              background: `linear-gradient(135deg, ${C.red} 0%, ${C.redBright} 100%)`,
              boxShadow: glow(C.red, 24, 0.45),
            },
          },
          '&.MuiButton-containedSecondary': {
            background: `linear-gradient(135deg, #1e293b 0%, #334155 100%)`,
            color: C.white,
            border: `1px solid ${C.mutedDim}`,
            '&:hover': {
              backgroundColor: C.bg3,
              borderColor: C.red,
            },
          },
          '&.MuiButton-outlined': {
            borderColor: C.border,
            color: C.white,
            '&:hover': {
              borderColor: C.red,
              color: C.redBright,
              backgroundColor: C.redDim,
              boxShadow: glow(C.red, 12, 0.15),
            },
          },
          '&.MuiButton-text': {
            color: C.muted,
            '&:hover': { color: C.redBright, backgroundColor: C.redDim },
          },
        },
      },
    },

    // ── TextField ──────────────────────────────────────────────────────────
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          backgroundColor: C.bg2,
          borderRadius: 8,
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: C.border,
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: C.mutedDim,
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: C.red,
            boxShadow: glow(C.red, 8, 0.2),
          },
        },
        input: { color: C.white },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          color: C.muted,
          '&.Mui-focused': { color: C.redBright },
        },
      },
    },

    // ── Select ─────────────────────────────────────────────────────────────
    MuiSelect: {
      styleOverrides: {
        icon: { color: C.muted },
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: {
          backgroundColor: C.bg2,
          border: `1px solid ${C.border}`,
          boxShadow: `0 8px 32px rgba(0,0,0,0.8), ${glow(C.red, 20, 0.1)}`,
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          color: C.white,
          '&:hover': { backgroundColor: C.bg3, color: C.redBright },
          '&.Mui-selected': { backgroundColor: `${C.red}22` },
        },
      },
    },

    // ── Table ──────────────────────────────────────────────────────────────
    MuiTable: {
      styleOverrides: {
        root: {
          tableLayout: 'auto',
          width: '100%',
          borderCollapse: 'collapse',
        },
      },
    },
    MuiTableContainer: {
      styleOverrides: {
        root: {
          backgroundColor: C.bg1,
          border: `1px solid ${C.border}`,
          borderRadius: 12,
          overflow: 'hidden',
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          '& .MuiTableCell-head': {
            backgroundColor: C.bg2,
            color: C.muted,
            fontWeight: 700,
            fontSize: '0.73rem',
            textTransform: 'uppercase',
            letterSpacing: '0.6px',
            borderBottom: `1px solid ${C.border}`,
            padding: '10px 16px',
            whiteSpace: 'nowrap',
            lineHeight: 1.4,
          },
          '& tr th:first-of-type': { borderTopLeftRadius: 12 },
          '& tr th:last-of-type':  { borderTopRightRadius: 12 },
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:hover': { backgroundColor: `${C.bg3} !important` },
          '& .MuiTableCell-body': {
            borderBottom: `1px solid ${C.border}44`,
            color: C.white,
            backgroundColor: 'transparent',
            padding: '12px 16px',
            verticalAlign: 'middle',
          },
          '&:last-of-type .MuiTableCell-body': {
            borderBottom: 'none',
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderColor: `${C.border}44`,
          backgroundColor: 'transparent',
          padding: '12px 16px',
        },
      },
    },

    // ── Dialog ─────────────────────────────────────────────────────────────
    MuiDialog: {
      styleOverrides: {
        paper: {
          backgroundColor: C.bg1,
          backgroundImage: 'none',
          border: `1px solid ${C.border}`,
          boxShadow: `0 24px 80px rgba(0,0,0,0.9), ${glow(C.red, 40, 0.1)}`,
        },
      },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: { color: C.white, fontWeight: 700 },
      },
    },

    // ── Chip ───────────────────────────────────────────────────────────────
    MuiChip: {
      styleOverrides: {
        root: { fontWeight: 600 },
      },
    },

    // ── Tabs ───────────────────────────────────────────────────────────────
    MuiTabs: {
      styleOverrides: {
        root: { borderBottom: `1px solid ${C.border}` },
        indicator: { backgroundColor: C.red, height: 2 },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          color: C.muted,
          fontWeight: 600,
          textTransform: 'none',
          '&.Mui-selected': { color: C.redBright },
        },
      },
    },

    // ── Divider ────────────────────────────────────────────────────────────
    MuiDivider: {
      styleOverrides: {
        root: { borderColor: C.border },
      },
    },

    // ── Autocomplete ───────────────────────────────────────────────────────
    MuiAutocomplete: {
      styleOverrides: {
        paper: {
          backgroundColor: C.bg2,
          border: `1px solid ${C.border}`,
        },
        option: {
          color: C.white,
          '&:hover': { backgroundColor: C.bg3, color: C.redBright },
          '&[aria-selected="true"]': { backgroundColor: `${C.red}22` },
        },
        noOptions: { color: C.muted },
      },
    },

    // ── Alert ──────────────────────────────────────────────────────────────
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          '&.MuiAlert-colorError': { backgroundColor: `${C.red}18`, color: '#ff8080', border: `1px solid ${C.red}44` },
          '&.MuiAlert-colorWarning': { backgroundColor: `${C.amber}18`, color: '#fbbf24', border: `1px solid ${C.amber}44` },
          '&.MuiAlert-colorSuccess': { backgroundColor: `${C.green}18`, color: '#34d399', border: `1px solid ${C.green}44` },
          '&.MuiAlert-colorInfo': { backgroundColor: `${C.redDim}`, color: C.white, border: `1px solid ${C.red}44` },
        },
      },
    },

    // ── Switch ─────────────────────────────────────────────────────────────
    MuiSwitch: {
      styleOverrides: {
        track: { backgroundColor: C.border },
        switchBase: {
          '&.Mui-checked': { color: C.red },
          '&.Mui-checked + .MuiSwitch-track': { backgroundColor: `${C.red}66` },
        },
      },
    },

    // ── Tooltip ────────────────────────────────────────────────────────────
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: C.bg2,
          border: `1px solid ${C.border}`,
          color: C.white,
          fontSize: '0.75rem',
        },
      },
    },
  },
});


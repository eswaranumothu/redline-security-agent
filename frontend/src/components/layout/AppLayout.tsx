import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Box, Drawer, AppBar, Toolbar, Typography, Divider,
  IconButton, Avatar, Menu, MenuItem, Tooltip,
  ListItemIcon, InputBase, Paper,
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import GppGoodIcon from '@mui/icons-material/GppGood';
import LogoutIcon from '@mui/icons-material/Logout';
import MenuIcon from '@mui/icons-material/Menu';
import SearchIcon from '@mui/icons-material/Search';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import CloseIcon from '@mui/icons-material/Close';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import { projectsApi } from '../../api/projects';
import { masterVulnerabilitiesApi } from '../../api/masterVulnerabilities';
import { FloatingMemoryChat } from '../memory/FloatingMemoryChat';
import { RedGridBackground } from '../common/RedGridBackground';
import { C, glow } from '../../theme';

const DRAWER_W        = 220;
const NAV_ACCENT      = '#ef4444';
const NAV_BG          = 'rgba(12, 13, 20, 0.65)';
const NAV_HOVER       = 'rgba(239, 68, 68, 0.15)';
const NAV_TEXT        = '#94a3b8';


// ── Main layout ────────────────────────────────────────────────────────────────
export const AppLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const [mobileOpen,  setMobileOpen]  = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [anchorEl,    setAnchorEl]    = useState<null | HTMLElement>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen,  setSearchOpen]  = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const effectiveWidth = sidebarOpen ? DRAWER_W : 0;

  const { data: allProjects = [] } = useQuery({ queryKey: ['projects'],              queryFn: projectsApi.list });
  const { data: allVulns    = [] } = useQuery({ queryKey: ['masterVulnerabilities'], queryFn: masterVulnerabilitiesApi.list });

  const q = searchQuery.trim().toLowerCase();
  const matchedProjects = useMemo(() => q.length < 2 ? [] : allProjects.filter(p =>
    p.project_name.toLowerCase().includes(q) ||
    p.project_code.toLowerCase().includes(q) ||
    p.client_name.toLowerCase().includes(q)
  ).slice(0, 5), [q, allProjects]);

  const matchedVulns = useMemo(() => q.length < 2 ? [] : allVulns.filter(v =>
    v.title.toLowerCase().includes(q) ||
    (v.cwe ?? '').toLowerCase().includes(q) ||
    (v.owasp ?? '').toLowerCase().includes(q)
  ).slice(0, 4), [q, allVulns]);

  const hasResults = matchedProjects.length > 0 || matchedVulns.length > 0;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node))
        setSearchOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => { setAnchorEl(null); logout(); navigate('/login'); };

  const navItems: { text: string; icon: React.ReactElement; path: string; subtext?: string }[] = [
    { text: 'Dashboard',              icon: <DashboardIcon fontSize="small" />,    path: '/' },
    { text: 'Projects',               icon: <FolderOpenIcon fontSize="small" />,   path: '/projects' },
    { text: 'Master Vulnerabilities', icon: <GppGoodIcon fontSize="small" />,      path: '/master-vulnerabilities' },
  ];

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    if (path === '/projects') return location.pathname === '/projects' || location.pathname.startsWith('/projects/');
    return location.pathname.startsWith(path);
  };

  // ── Sidebar content ──────────────────────────────────────────────────────────
  const sidebar = (
    <Box sx={{
      height: '100%', display: 'flex', flexDirection: 'column',
      bgcolor: NAV_BG, borderRight: `1px solid ${C.border}`, overflow: 'hidden',
    }}>
      {/* Brand Wordmark Header */}
      <Box sx={{ px: 2.5, pt: 3, pb: 2, display: 'flex', flexDirection: 'column', gap: 0.5, cursor: 'pointer' }}
        onClick={() => navigate('/')}>
        <Typography sx={{
          fontFamily: "'Inter', sans-serif",
          fontWeight: 900,
          fontSize: '1.4rem',
          letterSpacing: '1.5px',
          color: C.white,
          lineHeight: 1,
          display: 'flex',
          alignItems: 'center',
          gap: '2px',
        }}>
          RED<Box component="span" sx={{ color: C.red }}>LINE</Box>
        </Typography>
        <Typography sx={{
          fontSize: '0.62rem',
          fontWeight: 700,
          color: C.muted,
          letterSpacing: '1px',
          textTransform: 'uppercase',
        }}>
          Security That Remembers
        </Typography>
      </Box>

      <Divider sx={{ borderColor: `${C.border}`, mx: 2, mb: 2 }} />

      {/* Nav items */}
      <Box sx={{ flex: 1, px: 1.5, overflowY: 'auto' }}>
        {navItems.map((item) => {
          const active = isActive(item.path);
          return (
            <Box key={item.text}
              onClick={() => { navigate(item.path); setMobileOpen(false); }}
              sx={{
                display: 'flex', alignItems: 'center', gap: 1.5,
                px: 2, py: 1.1, mb: 0.5, borderRadius: '8px', cursor: 'pointer',
                bgcolor: active ? C.redDark : 'transparent',
                boxShadow: active ? glow(C.red, 12, 0.4) : 'none',
                transition: 'all 0.15s ease',
                '&:hover': { bgcolor: active ? C.redDark : NAV_HOVER },
              }}>
              <Box sx={{ color: active ? '#fff' : (item.path.includes('memory') ? C.redBright : NAV_TEXT), display: 'flex', flexShrink: 0,
                '& svg': { fontSize: '1.1rem' } }}>
                {item.icon}
              </Box>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography sx={{ fontSize: '0.85rem', fontWeight: active ? 700 : 500,
                  color: active ? '#fff' : C.white, lineHeight: 1.2 }}>
                  {item.text}
                </Typography>
                {item.subtext && (
                  <Typography sx={{ fontSize: '0.55rem', color: active ? '#ffaaaa' : NAV_ACCENT,
                    letterSpacing: '0.8px', textTransform: 'uppercase', fontWeight: 700 }}>
                    {item.subtext}
                  </Typography>
                )}
              </Box>
            </Box>
          );
        })}
      </Box>

      {/* User card */}
      <Box sx={{ p: 1.5, borderTop: `1px solid ${C.border}` }}>
        <Box sx={{
          display: 'flex', alignItems: 'center', gap: 1.25,
          p: 1.25, borderRadius: '8px',
          bgcolor: 'rgba(255,255,255,0.02)', border: `1px solid ${C.border}`,
        }}>
          <Box sx={{ position: 'relative', flexShrink: 0 }}>
            <Avatar sx={{ bgcolor: C.redDark, width: 34, height: 34, fontSize: '0.85rem', fontWeight: 800 }}>
              {user?.full_name?.charAt(0)?.toUpperCase() ?? user?.email?.charAt(0)?.toUpperCase()}
            </Avatar>
            <Box sx={{ position: 'absolute', bottom: 0, right: 0, width: 9, height: 9,
              bgcolor: C.green, borderRadius: '50%', border: `2px solid ${NAV_BG}` }} />
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography noWrap sx={{ fontWeight: 700, fontSize: '0.82rem', color: C.white }}>
              {user?.full_name ?? 'Analyst'}
            </Typography>
            <Typography noWrap sx={{ fontSize: '0.68rem', color: NAV_TEXT }}>
              {user?.email}
            </Typography>
          </Box>
          <Tooltip title="Logout">
            <IconButton size="small" onClick={handleLogout}
              sx={{ color: NAV_TEXT, '&:hover': { color: C.red } }}>
              <LogoutIcon sx={{ fontSize: '1rem' }} />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: C.bg0 }}>

      {/* Background glowing red grid & animated laser lines */}
      <RedGridBackground />

      {/* AppBar */}
      <AppBar position="fixed" elevation={0} sx={{
        width: { sm: `calc(100% - ${effectiveWidth}px)` },
        ml: { sm: `${effectiveWidth}px` },
        bgcolor: `${C.bg1}f0`, backdropFilter: 'blur(12px)',
        borderBottom: `1px solid ${C.border}`,
        transition: 'width 0.25s ease, margin-left 0.25s ease',
        zIndex: (theme) => theme.zIndex.drawer + 1,
      }}>
        <Toolbar sx={{ gap: 2, minHeight: '56px' }}>
          <IconButton color="inherit" onClick={() => setMobileOpen(true)}
            sx={{ display: { sm: 'none' }, color: NAV_TEXT }}>
            <MenuIcon />
          </IconButton>
          <IconButton color="inherit" onClick={() => setSidebarOpen(p => !p)}
            sx={{ display: { xs: 'none', sm: 'inline-flex' }, color: NAV_TEXT }}>
            <MenuIcon fontSize="small" />
          </IconButton>

          {/* Live search */}
          <Box ref={searchRef} sx={{ flex: 1, maxWidth: 360, mx: 'auto', position: 'relative' }}>
            <Box sx={{
              display: 'flex', alignItems: 'center', gap: 1,
              bgcolor: C.bg2, border: `1px solid ${searchOpen ? C.red : C.border}`,
              borderRadius: '8px', px: 1.5, py: 0.5,
              boxShadow: searchOpen ? glow(C.red, 8, 0.18) : 'none',
              transition: 'all 0.2s',
            }}>
              <SearchIcon sx={{ fontSize: '0.9rem', color: NAV_TEXT, flexShrink: 0 }} />
              <InputBase
                placeholder="Search projects, vulnerabilities, memory…"
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setSearchOpen(true); }}
                onFocus={() => setSearchOpen(true)}
                sx={{ flex: 1, fontSize: '0.82rem', color: C.white,
                  '& input::placeholder': { color: NAV_TEXT, opacity: 1 } }}
              />
              {searchQuery && (
                <IconButton size="small"
                  onClick={() => { setSearchQuery(''); setSearchOpen(false); }}
                  sx={{ color: NAV_TEXT, p: 0.2, '&:hover': { color: C.white } }}>
                  <CloseIcon sx={{ fontSize: '0.85rem' }} />
                </IconButton>
              )}
            </Box>

            {searchOpen && searchQuery.length >= 2 && (
              <Paper elevation={0} sx={{
                position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0,
                bgcolor: C.bg2, border: `1px solid ${C.border}`, borderRadius: '10px',
                zIndex: 9999, boxShadow: `0 12px 40px rgba(0,0,0,0.8)`,
                overflow: 'hidden', maxHeight: 380, overflowY: 'auto',
              }}>
                {!hasResults ? (
                  <Box sx={{ px: 2, py: 2.5, textAlign: 'center' }}>
                    <Typography sx={{ fontSize: '0.82rem', color: NAV_TEXT }}>
                      No results for "{searchQuery}"
                    </Typography>
                  </Box>
                ) : (
                  <Box>
                    {matchedProjects.length > 0 && (
                      <Box>
                        <Box sx={{ px: 2, pt: 1.5, pb: 0.5 }}>
                          <Typography sx={{ fontSize: '0.65rem', fontWeight: 700,
                            color: NAV_TEXT, textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                            Projects
                          </Typography>
                        </Box>
                        {matchedProjects.map(p => (
                          <Box key={p.id}
                            onClick={() => { navigate(`/projects/${p.id}`); setSearchOpen(false); setSearchQuery(''); }}
                            sx={{ display: 'flex', alignItems: 'center', gap: 1.5,
                              px: 2, py: 1.1, cursor: 'pointer',
                              '&:hover': { bgcolor: C.bg3 }, transition: 'background 0.15s' }}>
                            <FolderOpenIcon sx={{ fontSize: '0.95rem', color: C.redBright, flexShrink: 0 }} />
                            <Box sx={{ minWidth: 0 }}>
                              <Typography sx={{ fontSize: '0.82rem', fontWeight: 600, color: C.white }} noWrap>
                                {p.project_name}
                              </Typography>
                              <Typography sx={{ fontSize: '0.68rem', color: NAV_TEXT }}>
                                {p.project_code} · {p.client_name}
                              </Typography>
                            </Box>
                          </Box>
                        ))}
                      </Box>
                    )}
                    {matchedVulns.length > 0 && (
                      <Box>
                        <Divider sx={{ borderColor: `${C.border}`, my: 0.5 }} />
                        <Box sx={{ px: 2, pt: 1, pb: 0.5 }}>
                          <Typography sx={{ fontSize: '0.65rem', fontWeight: 700,
                            color: NAV_TEXT, textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                            Vulnerabilities
                          </Typography>
                        </Box>
                        {matchedVulns.map(v => (
                          <Box key={v.id}
                            onClick={() => { navigate('/master-vulnerabilities'); setSearchOpen(false); setSearchQuery(''); }}
                            sx={{ display: 'flex', alignItems: 'center', gap: 1.5,
                              px: 2, py: 1.1, cursor: 'pointer',
                              '&:hover': { bgcolor: C.bg3 }, transition: 'background 0.15s' }}>
                            <GppGoodIcon sx={{ fontSize: '0.95rem', color: '#f59e0b', flexShrink: 0 }} />
                            <Box sx={{ minWidth: 0 }}>
                              <Typography sx={{ fontSize: '0.82rem', fontWeight: 600, color: C.white }} noWrap>
                                {v.title}
                              </Typography>
                              <Typography sx={{ fontSize: '0.68rem', color: NAV_TEXT }}>
                                {v.severity ?? 'N/A'}{v.cwe ? ` · ${v.cwe}` : ''}
                              </Typography>
                            </Box>
                          </Box>
                        ))}
                      </Box>
                    )}
                    <Box sx={{ height: 6 }} />
                  </Box>
                )}
              </Paper>
            )}
          </Box>

          {/* Right side */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Tooltip title="Notifications">
              <IconButton size="small" sx={{ color: NAV_TEXT, '&:hover': { color: C.white } }}>
                <NotificationsNoneIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Box onClick={(e) => setAnchorEl(e.currentTarget)}
              sx={{ display: 'flex', alignItems: 'center', gap: 0.75, cursor: 'pointer',
                p: 0.5, borderRadius: '8px', '&:hover': { bgcolor: NAV_HOVER } }}>
              <Avatar sx={{ bgcolor: C.redDark, width: 28, height: 28, fontSize: '0.78rem', fontWeight: 800 }}>
                {user?.email?.charAt(0).toUpperCase()}
              </Avatar>
              <Typography sx={{ fontSize: '0.82rem', color: C.white, fontWeight: 600,
                display: { xs: 'none', sm: 'block' } }}>
                {user?.full_name?.split(' ')[0] ?? 'Analyst'}
              </Typography>
              <KeyboardArrowDownIcon sx={{ fontSize: '0.9rem', color: NAV_TEXT }} />
            </Box>
            <Menu anchorEl={anchorEl} open={!!anchorEl} onClose={() => setAnchorEl(null)}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}>
              <MenuItem disabled>
                <Typography variant="caption" sx={{ color: NAV_TEXT }}>{user?.email}</Typography>
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleLogout} sx={{ color: C.redBright, gap: 1 }}>
                <ListItemIcon sx={{ color: C.redBright, minWidth: 'auto' }}>
                  <LogoutIcon fontSize="small" />
                </ListItemIcon>
                Logout
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Sidebar drawers */}
      <Box component="nav" sx={{ width: { sm: effectiveWidth }, flexShrink: { sm: 0 }, transition: 'width 0.25s ease' }}>
        <Drawer variant="temporary" open={mobileOpen} onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{ display: { xs: 'block', sm: 'none' }, '& .MuiDrawer-paper': { width: DRAWER_W, border: 'none' } }}>
          {sidebar}
        </Drawer>
        <Drawer variant="permanent"
          sx={{ display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { width: DRAWER_W, border: 'none',
              transform: sidebarOpen ? 'translateX(0)' : `translateX(-${DRAWER_W}px)`,
              transition: 'transform 0.25s ease', overflow: 'hidden' } }}
          open>
          {sidebar}
        </Drawer>
      </Box>

      {/* Main content */}
      <Box component="main" sx={{
        flexGrow: 1, minHeight: '100vh', bgcolor: 'transparent',
        pt: '56px',
        width: { sm: `calc(100% - ${effectiveWidth}px)` },
        transition: 'width 0.25s ease',
        display: 'flex', flexDirection: 'column',
        position: 'relative',
        zIndex: 1,
      }}>
        <Box sx={{ flex: 1, p: { xs: 2, sm: 3 } }}>
          <Outlet />
        </Box>

        {/* Footer */}
        <Box sx={{ px: 3, py: 1.5, borderTop: `1px solid ${C.border}`,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          flexWrap: 'wrap', gap: 1 }}>
          <Typography sx={{ fontSize: '0.72rem', color: NAV_TEXT }}>
            REDLINE &nbsp;|&nbsp; Security That Remembers &nbsp;|&nbsp; Persistent AI-Powered VAPT Reporting
          </Typography>
          <Typography sx={{ fontSize: '0.72rem', color: NAV_TEXT }}>
            Enterprise Security Analyst Platform &nbsp;|&nbsp; 2026 &nbsp;|&nbsp; Confidential
          </Typography>
        </Box>
      </Box>

      {/* Floating AI Security Memory Chat Widget */}
      <FloatingMemoryChat />
    </Box>
  );
};

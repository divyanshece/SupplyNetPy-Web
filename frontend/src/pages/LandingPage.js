import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Menu, MenuItem, Avatar, ListItemIcon, ListItemText } from '@mui/material'
import { Logout as LogoutIcon, Person as PersonIcon } from '@mui/icons-material'
import { useAuth } from '../contexts/AuthContext'
import LoginModal from '../components/LoginModal'

import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  AppBar,
  Toolbar,
  IconButton,
  Stack,
  Chip,
  Divider,
  Link,
} from '@mui/material'
import {
  AccountTree as NetworkIcon,
  Speed as SimulationIcon,
  Analytics as AnalyticsIcon,
  LocalShipping as SupplierIcon,
  Factory as FactoryIcon,
  Store as RetailerIcon,
  Inventory as InventoryIcon,
  GitHub as GitHubIcon,
  LinkedIn as LinkedInIcon,
  LightMode as LightModeIcon,
  DarkMode as DarkModeIcon,
  TrendingUp as OptimizeIcon,
  Insights as InsightsIcon,
  Share as ShareIcon,
  Timer as TimerIcon,
  Engineering as EngineeringIcon,
  AssessmentOutlined as ReportIcon,
  PictureAsPdf as PdfIcon,
} from '@mui/icons-material'
import { createTheme, ThemeProvider } from '@mui/material/styles'


const LandingPage = () => {
  const navigate = useNavigate()
  const [darkMode, setDarkMode] = useState(false)
  const { user, signOut } = useAuth() // ← Add this
  const [anchorEl, setAnchorEl] = useState(null)
  const menuOpen = Boolean(anchorEl)
  const [loginModalOpen, setLoginModalOpen] = useState(false)
  const [loginModalTab, setLoginModalTab] = useState('signin')

  const handleMenuOpen = event => {
    setAnchorEl(event.currentTarget)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
  }

  const handleLogout = async () => {
  try {
    await signOut()
    handleMenuClose()
    
    // Force navigation after logout
    window.location.href = '/'
  } catch (error) {
    console.error('Logout error:', error)
    // Force cleanup and redirect anyway
    localStorage.clear()
    sessionStorage.clear()
    window.location.href = '/'
  }
}

  const handleGoToApp = () => {
    handleMenuClose()
    navigate('/app')
  }

  const handleGetStarted = () => {
    if (user) {
      navigate('/app')
    } else {
      localStorage.setItem('redirectAfterLogin', '/app')
      setLoginModalTab('signup') // Open signup tab
      setLoginModalOpen(true)
    }
  }

  const handleSignIn = () => {
    if (user) {
      navigate('/app')
    } else {
      localStorage.setItem('redirectAfterLogin', '/')
      setLoginModalTab('signin') // Open signin tab
      setLoginModalOpen(true)
    }
  }

  const theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      primary: { main: '#3b82f6' },
      background: {
        default: darkMode ? '#0f172a' : '#ffffff',
        paper: darkMode ? '#1e293b' : '#ffffff',
      },
    },
  })

  useEffect(() => {
    document.documentElement.style.scrollBehavior = 'smooth'
  }, [])

  const features = [
    {
      icon: <NetworkIcon />,
      title: 'Visual Network Builder',
      description: 'Design multi-tier supply chains with drag-and-drop interface.',
      color: '#3b82f6',
    },
    {
      icon: <SimulationIcon />,
      title: 'Discrete-Event Simulation',
      description: 'Run sophisticated simulations powered by SupplyNetPy.',
      color: '#10b981',
    },
    {
      icon: <AnalyticsIcon />,
      title: 'Real-Time Analytics',
      description: 'Track inventory, costs, and service levels with charts.',
      color: '#f59e0b',
    },
    {
      icon: <OptimizeIcon />,
      title: 'Policy Optimization',
      description: 'Compare (s,S) and (R,Q) policies for optimal strategies.',
      color: '#ef4444',
    },
    {
      icon: <InsightsIcon />,
      title: 'Performance Insights',
      description: 'Analyze fill rates and costs with recommendations.',
      color: '#8b5cf6',
    },
    {
      icon: <ShareIcon />,
      title: 'Collaborate & Share',
      description: 'Save scenarios to cloud and share with your team.',
      color: '#06b6d4',
    },
  ]

  const nodeTypes = [
    { icon: <SupplierIcon />, name: 'Suppliers', color: '#10b981' },
    { icon: <FactoryIcon />, name: 'Factories', color: '#f59e0b' },
    { icon: <InventoryIcon />, name: 'Distributors', color: '#3b82f6' },
    { icon: <RetailerIcon />, name: 'Retailers', color: '#8b5cf6' },
  ]

  const stats = [
    { icon: <TimerIcon />, value: '< 3s', label: 'Simulation' },
    { icon: <EngineeringIcon />, value: '4+', label: 'Nodes' },
    { icon: <ReportIcon />, value: '15+', label: 'Metrics' },
  ]

  const steps = [
    {
      num: '1',
      title: 'Build Network',
      desc: 'Drag nodes to create topology',
      icon: <NetworkIcon />,
    },
    {
      num: '2',
      title: 'Configure',
      desc: 'Set policies and parameters',
      icon: <EngineeringIcon />,
    },
    {
      num: '3',
      title: 'Run & Analyze',
      desc: 'Execute and review analytics',
      icon: <AnalyticsIcon />,
    },
    { num: '4', title: 'Export PDF', desc: 'Download professional reports', icon: <PdfIcon /> },
  ]

  const scrollToSection = id => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          minHeight: '100vh',
          bgcolor: 'background.default',
          transition: 'background-color 0.3s ease',
        }}
      >
        {/* Header */}
        <AppBar
          position="sticky"
          elevation={0}
          sx={{
            background: darkMode
              ? 'linear-gradient(180deg, rgba(15,23,42,0.95) 0%, rgba(30,41,59,0.85) 100%)'
              : 'linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.85) 100%)',
            backdropFilter: 'blur(20px)',
            boxShadow: darkMode ? '0 8px 32px rgba(0,0,0,0.4)' : '0 8px 32px rgba(0,0,0,0.08)',
            transition: 'all 0.3s ease',
          }}
        >
          <Container maxWidth="lg">
            <Toolbar sx={{ px: 0, py: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
                <Box
                  onClick={() => navigate('/')}
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: 2,
                    background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mr: 1.5,
                    cursor: 'pointer',
                    transition: 'transform 0.3s ease',
                    '&:hover': {
                      transform: 'scale(1.1)',
                    },
                  }}
                >
                  <NetworkIcon sx={{ fontSize: 24, color: 'white' }} />
                </Box>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  SupplyNet Web
                </Typography>
              </Box>

              <Stack direction="row" spacing={2} alignItems="center">
                <Stack direction="row" spacing={2} sx={{ display: { xs: 'none', md: 'flex' } }}>
                  <Button
                    sx={{
                      color: darkMode ? '#e2e8f0' : '#475569',
                      fontWeight: 600,
                      textTransform: 'none',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        color: '#3b82f6',
                        transform: 'translateY(-1px)',
                      },
                    }}
                    onClick={() => scrollToSection('features')}
                  >
                    Features
                  </Button>
                  <Button
                    sx={{
                      color: darkMode ? '#e2e8f0' : '#475569',
                      fontWeight: 600,
                      textTransform: 'none',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        color: '#3b82f6',
                        transform: 'translateY(-1px)',
                      },
                    }}
                    onClick={() => scrollToSection('how-it-works')}
                  >
                    How It Works
                  </Button>
                  <Button
                    sx={{
                      color: darkMode ? '#e2e8f0' : '#475569',
                      fontWeight: 600,
                      textTransform: 'none',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        color: '#3b82f6',
                        transform: 'translateY(-1px)',
                      },
                    }}
                    onClick={() => scrollToSection('about')}
                  >
                    About
                  </Button>
                </Stack>

                <IconButton
                  onClick={() => setDarkMode(!darkMode)}
                  sx={{
                    bgcolor: darkMode ? '#1e293b' : '#f1f5f9',
                    color: darkMode ? '#fbbf24' : '#3b82f6',
                    transition: 'all 0.5s ease',
                    '&:hover': {
                      transform: 'rotate(180deg)',
                      bgcolor: darkMode ? '#334155' : '#e2e8f0',
                    },
                  }}
                >
                  {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
                </IconButton>

                {user ? (
                  // User is logged in - show avatar menu
                  <>
                    <IconButton
                      onClick={handleMenuOpen}
                      sx={{
                        bgcolor: darkMode ? '#1e293b' : '#f1f5f9',
                        border: '2px solid',
                        borderColor: '#3b82f6',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'scale(1.1)',
                          borderColor: '#8b5cf6',
                        },
                      }}
                    >
                      <Avatar
                        sx={{
                          width: 32,
                          height: 32,
                          background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                          fontSize: '0.875rem',
                          fontWeight: 700,
                          color: '#fff',
                        }}
                      >
                        {user.email?.charAt(0).toUpperCase()}
                      </Avatar>
                    </IconButton>

                    <Menu
                      anchorEl={anchorEl}
                      open={menuOpen}
                      onClose={handleMenuClose}
                      sx={{ mt: 1 }}
                      transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                      anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                      PaperProps={{
                        sx: {
                          bgcolor: darkMode ? '#1e293b' : '#fff',
                          border: darkMode ? '1px solid #334155' : '1px solid #e2e8f0',
                          boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                          minWidth: 220,
                        },
                      }}
                    >
                      <Box sx={{ px: 2, py: 1.5 }}>
                        <Typography
                          variant="body2"
                          fontWeight={600}
                          sx={{ color: darkMode ? '#fff' : '#0f172a' }}
                        >
                          {user.user_metadata?.full_name || user.email?.split('@')[0]}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{ color: darkMode ? '#94a3b8' : '#64748b' }}
                        >
                          {user.email}
                        </Typography>
                      </Box>
                      <Divider />
                      <MenuItem
                        onClick={handleGoToApp}
                        sx={{
                          py: 1.5,
                          '&:hover': { bgcolor: darkMode ? '#334155' : '#f8fafc' },
                        }}
                      >
                        <ListItemIcon>
                          <NetworkIcon fontSize="small" sx={{ color: '#3b82f6' }} />
                        </ListItemIcon>
                        <ListItemText>Go to Workspace</ListItemText>
                      </MenuItem>
                      <MenuItem
                        onClick={handleLogout}
                        sx={{
                          py: 1.5,
                          '&:hover': { bgcolor: darkMode ? '#334155' : '#f8fafc' },
                        }}
                      >
                        <ListItemIcon>
                          <LogoutIcon fontSize="small" sx={{ color: '#ef4444' }} />
                        </ListItemIcon>
                        <ListItemText>Logout</ListItemText>
                      </MenuItem>
                    </Menu>
                  </>
                ) : (
                  // User not logged in - show Sign In button
                  <Button
                    variant="contained"
                    onClick={handleSignIn}
                    sx={{
                      background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                      fontWeight: 600,
                      px: 2.5,
                      py: 1,
                      textTransform: 'none',
                      boxShadow: '0 4px 12px rgba(59,130,246,0.4)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 6px 16px rgba(59,130,246,0.5)',
                      },
                    }}
                  >
                    Sign In
                  </Button>
                )}
              </Stack>
            </Toolbar>
          </Container>
        </AppBar>

        {/* Hero Section */}
        <Box
          sx={{
            background: darkMode
              ? 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)'
              : 'linear-gradient(180deg, #f8fafc 0%, #fff 100%)',
            py: { xs: 6, md: 10 },
            transition: 'background 0.3s ease',
          }}
        >
          <Container maxWidth="lg">
            <Box
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', md: 'row' },
                gap: 6,
                alignItems: 'center',
              }}
            >
              {/* Left Content */}
              <Box sx={{ flex: 1 }}>
                <Chip
                  label="Powered by SupplyNetPy"
                  size="small"
                  sx={{
                    mb: 2,
                    bgcolor: darkMode ? '#1e3a8a' : '#eff6ff',
                    color: '#3b82f6',
                    fontWeight: 600,
                    border: darkMode ? '1px solid #1e40af' : '1px solid #dbeafe',
                    transition: 'all 0.3s ease',
                  }}
                />

                <Typography
                  variant="h2"
                  sx={{
                    fontWeight: 800,
                    mb: 2,
                    fontSize: { xs: '2rem', md: '3rem' },
                    lineHeight: 1.1,
                    color: darkMode ? '#fff' : '#0f172a',
                    transition: 'color 0.3s ease',
                  }}
                >
                  Design & Simulate
                  <br />
                  <span
                    style={{
                      background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}
                  >
                    Supply Chain Networks
                  </span>
                </Typography>

                <Typography
                  variant="body1"
                  sx={{
                    mb: 3,
                    color: darkMode ? '#e2e8f0' : '#64748b',
                    lineHeight: 1.6,
                    maxWidth: 500,
                    transition: 'color 0.3s ease',
                  }}
                >
                  Build, optimize, and analyze complex supply chain networks with our intuitive
                  visual platform. Run powerful simulations in seconds.
                </Typography>

                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 4 }}>
                  <Button
                    variant="contained"
                    size="large"
                    onClick={handleGetStarted}
                    sx={{
                      background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                      fontWeight: 600,
                      px: 4,
                      py: 1.5,
                      textTransform: 'none',
                      boxShadow: '0 6px 16px rgba(59,130,246,0.4)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 8px 20px rgba(59,130,246,0.5)',
                      },
                    }}
                  >
                    Get Started Free
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    onClick={() => scrollToSection('features')}
                    sx={{
                      borderWidth: 2,
                      borderColor: darkMode ? '#475569' : '#cbd5e1',
                      color: darkMode ? '#e2e8f0' : '#475569',
                      fontWeight: 600,
                      px: 4,
                      py: 1.5,
                      textTransform: 'none',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        borderWidth: 2,
                        borderColor: '#3b82f6',
                        bgcolor: darkMode ? 'rgba(59,130,246,0.1)' : 'rgba(59,130,246,0.05)',
                        transform: 'translateY(-2px)',
                      },
                    }}
                  >
                    Learn More
                  </Button>
                </Stack>

                <Box sx={{ display: 'flex', gap: 4 }}>
                  {stats.map((stat, i) => (
                    <Box key={i}>
                      {React.cloneElement(stat.icon, {
                        sx: { fontSize: 24, color: '#3b82f6', mb: 0.5 },
                      })}
                      <Typography
                        variant="h6"
                        fontWeight={700}
                        sx={{ color: darkMode ? '#fff' : '#0f172a', transition: 'color 0.3s ease' }}
                      >
                        {stat.value}
                      </Typography>
                      <Typography
                        variant="caption"
                        color={darkMode ? '#94a3b8' : '#64748b'}
                        sx={{ transition: 'color 0.3s ease' }}
                      >
                        {stat.label}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Box>

              {/* Right - Node Cards */}
              <Box sx={{ flex: '0 0 auto', width: { xs: '100%', md: 440 } }}>
                <Box
                  sx={{
                    bgcolor: darkMode ? 'rgba(30,41,59,0.7)' : 'rgba(248,250,252,0.9)',
                    borderRadius: 4,
                    p: 3,
                    border: darkMode ? '1px solid #334155' : '1px solid #e2e8f0',
                    backdropFilter: 'blur(10px)',
                    boxShadow: darkMode
                      ? '0 12px 32px rgba(0,0,0,0.45)'
                      : '0 12px 32px rgba(0,0,0,0.12)',
                    transition: 'all 0.3s ease',
                  }}
                >
                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: 3,
                    }}
                  >
                    {nodeTypes.map((node, i) => (
                      <Box
                        key={i}
                        sx={{
                          bgcolor: darkMode ? '#1e293b' : '#fff',
                          p: 3,
                          height: 150,
                          borderRadius: 3,
                          border: darkMode ? '2px solid #334155' : '2px solid #f1f5f9',
                          textAlign: 'center',
                          cursor: 'pointer',
                          transition: 'all 0.35s ease',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'center',
                          '&:hover': {
                            transform: 'translateY(-6px)',
                            borderColor: node.color,
                            boxShadow: `${node.color}40 0px 10px 24px`,
                          },
                        }}
                      >
                        <Box
                          sx={{
                            width: 60,
                            height: 60,
                            borderRadius: 2.5,
                            bgcolor: darkMode ? `${node.color}30` : `${node.color}15`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mx: 'auto',
                            mb: 1.5,
                            transition: 'all 0.3s ease',
                          }}
                        >
                          {React.cloneElement(node.icon, {
                            sx: {
                              fontSize: 32,
                              color: node.color,
                              filter: darkMode ? 'brightness(1.1)' : 'none',
                            },
                          })}
                        </Box>

                        <Typography
                          variant="body1"
                          fontWeight={700}
                          sx={{
                            color: darkMode ? '#fff' : '#0f172a',
                            transition: 'color 0.3s ease',
                          }}
                        >
                          {node.name}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </Box>
              </Box>
            </Box>
          </Container>
        </Box>

        {/* Features Section */}
        <Box
          id="features"
          sx={{
            py: { xs: 6, md: 10 },
            bgcolor: darkMode ? '#0f172a' : '#fff',
            transition: 'background-color 0.3s ease',
          }}
        >
          <Container maxWidth="lg">
            <Box sx={{ textAlign: 'center', mb: 6 }}>
              <Typography
                variant="h3"
                fontWeight={700}
                sx={{
                  mb: 2,
                  color: darkMode ? '#fff' : '#0f172a',
                  transition: 'color 0.3s ease',
                }}
              >
                Powerful Features
              </Typography>
              <Typography
                variant="body1"
                color={darkMode ? '#94a3b8' : '#64748b'}
                sx={{ transition: 'color 0.3s ease' }}
              >
                Everything you need to design, simulate, and optimize supply chains
              </Typography>
            </Box>

            <Box
              sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3 }}
            >
              {features.map((f, i) => (
                <Card
                  key={i}
                  elevation={0}
                  sx={{
                    bgcolor: darkMode ? '#1e293b' : '#fff',
                    border: darkMode ? '2px solid #334155' : '2px solid #e2e8f0',
                    borderRadius: 3,
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-6px)',
                      borderColor: f.color,
                      boxShadow: `0 12px 24px ${f.color}20`,
                      '& .icon': { color: f.color, transform: 'scale(1.1)' },
                    },
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Box
                      className="icon"
                      sx={{
                        mb: 2,
                        color: darkMode ? '#e2e8f0' : '#64748b',
                        transition: 'all 0.3s ease',
                      }}
                    >
                      {React.cloneElement(f.icon, { sx: { fontSize: 40 } })}
                    </Box>
                    <Typography
                      variant="h6"
                      fontWeight={700}
                      sx={{
                        mb: 1,
                        color: darkMode ? '#fff' : '#0f172a',
                        transition: 'color 0.3s ease',
                      }}
                    >
                      {f.title}
                    </Typography>
                    <Typography
                      variant="body2"
                      color={darkMode ? '#94a3b8' : '#64748b'}
                      sx={{ lineHeight: 1.6, transition: 'color 0.3s ease' }}
                    >
                      {f.description}
                    </Typography>
                  </CardContent>
                </Card>
              ))}
            </Box>
          </Container>
        </Box>

        {/* How It Works Section */}
        <Box
          id="how-it-works"
          sx={{
            py: { xs: 6, md: 10 },
            bgcolor: darkMode ? '#1e293b' : '#f8fafc',
            transition: 'background-color 0.3s ease',
          }}
        >
          <Container maxWidth="lg">
            <Box sx={{ textAlign: 'center', mb: 6 }}>
              <Typography
                variant="h3"
                fontWeight={700}
                sx={{
                  mb: 2,
                  color: darkMode ? '#fff' : '#0f172a',
                  transition: 'color 0.3s ease',
                }}
              >
                How It Works
              </Typography>
              <Typography
                variant="body1"
                color={darkMode ? '#94a3b8' : '#64748b'}
                sx={{ transition: 'color 0.3s ease' }}
              >
                Get started in four simple steps
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                  gap: 4,
                  maxWidth: '800px',
                  width: '100%',
                }}
              >
                {steps.map((s, i) => (
                  <Box
                    key={i}
                    sx={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 2,
                      mx: 'auto',
                      width: '100%',
                      maxWidth: 360,
                    }}
                  >
                    <Box
                      sx={{
                        width: 64,
                        height: 64,
                        flexShrink: 0,
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                        color: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.5rem',
                        fontWeight: 700,
                        boxShadow: '0 4px 12px rgba(59,130,246,0.3)',
                      }}
                    >
                      {s.num}
                    </Box>

                    <Box>
                      {React.cloneElement(s.icon, {
                        sx: {
                          fontSize: 26,
                          color: darkMode ? '#e2e8f0' : '#64748b',
                          mb: 0.5,
                          transition: 'color 0.3s ease',
                        },
                      })}
                      <Typography
                        variant="h6"
                        fontWeight={700}
                        sx={{
                          mb: 0.5,
                          color: darkMode ? '#fff' : '#0f172a',
                          transition: 'color 0.3s ease',
                        }}
                      >
                        {s.title}
                      </Typography>
                      <Typography
                        variant="body2"
                        color={darkMode ? '#94a3b8' : '#64748b'}
                        sx={{ lineHeight: 1.5, transition: 'color 0.3s ease' }}
                      >
                        {s.desc}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            </Box>
          </Container>
        </Box>

        {/* CTA Section */}
        <Box
          id="about"
          sx={{
            py: { xs: 6, md: 10 },
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          }}
        >
          <Container maxWidth="md">
            <Box sx={{ textAlign: 'center', color: '#fff' }}>
              <Typography variant="h3" fontWeight={700} sx={{ mb: 2, color: '#fff' }}>
                Built for Supply Chain Professionals
              </Typography>
              <Typography variant="body1" sx={{ mb: 3, opacity: 0.95, lineHeight: 1.7 }}>
                SupplyNet Web brings discrete-event simulation to your browser. Design visually, run
                simulations, and make data-driven decisions with confidence.
              </Typography>
              <Button
                variant="contained"
                size="large"
                onClick={handleGetStarted}
                sx={{
                  bgcolor: '#fff',
                  color: '#667eea',
                  fontWeight: 700,
                  px: 5,
                  py: 1.5,
                  textTransform: 'none',
                  boxShadow: '0 6px 16px rgba(255,255,255,0.3)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    bgcolor: '#f8fafc',
                    transform: 'translateY(-2px) scale(1.02)',
                    boxShadow: '0 8px 20px rgba(255,255,255,0.4)',
                  },
                }}
              >
                Start Building Now
              </Button>
            </Box>
          </Container>
        </Box>

        {/* Footer */}
        <Box component="footer" sx={{ py: 6, bgcolor: '#0f172a', color: '#fff' }}>
          <Container maxWidth="lg">
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: '2fr 1fr 1fr 2fr' },
                gap: 4,
                mb: 4,
              }}
            >
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <NetworkIcon sx={{ fontSize: 28, color: '#3b82f6', mr: 1 }} />
                  <Typography variant="h6" fontWeight={700} sx={{ color: '#fff' }}>
                    SupplyNet Web
                  </Typography>
                </Box>
                <Typography variant="body2" color="#94a3b8" sx={{ lineHeight: 1.6 }}>
                  Professional supply chain simulation platform powered by SupplyNetPy
                </Typography>
              </Box>

              <Box>
                <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1.5, color: '#fff' }}>
                  Product
                </Typography>
                <Stack spacing={1}>
                  <Link
                    href="#features"
                    color="inherit"
                    underline="hover"
                    sx={{
                      color: '#94a3b8',
                      fontSize: '0.875rem',
                      transition: 'color 0.3s ease',
                      '&:hover': { color: '#3b82f6' },
                    }}
                  >
                    Features
                  </Link>
                  <Link
                    href="https://supplychainsimulation.github.io/SupplyNetPy/"
                    target="_blank"
                    color="inherit"
                    underline="hover"
                    sx={{
                      color: '#94a3b8',
                      fontSize: '0.875rem',
                      transition: 'color 0.3s ease',
                      '&:hover': { color: '#3b82f6' },
                    }}
                  >
                    Documentation
                  </Link>
                </Stack>
              </Box>

              <Box>
                <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1.5, color: '#fff' }}>
                  Company
                </Typography>
                <Stack spacing={1}>
                  <Link
                    href="#about"
                    color="inherit"
                    underline="hover"
                    sx={{
                      color: '#94a3b8',
                      fontSize: '0.875rem',
                      transition: 'color 0.3s ease',
                      '&:hover': { color: '#3b82f6' },
                    }}
                  >
                    About Us
                  </Link>
                  <Link
                    href="#"
                    color="inherit"
                    underline="hover"
                    sx={{
                      color: '#94a3b8',
                      fontSize: '0.875rem',
                      transition: 'color 0.3s ease',
                      '&:hover': { color: '#3b82f6' },
                    }}
                  >
                    Contact
                  </Link>
                </Stack>
              </Box>

              <Box>
                <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1.5, color: '#fff' }}>
                  Connect With Me
                </Typography>
                <Stack direction="row" spacing={1.5}>
                  <IconButton
                    sx={{
                      bgcolor: '#1e293b',
                      color: '#fff',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        color: '#3b82f6',
                        bgcolor: '#334155',
                        transform: 'translateY(-2px)',
                      },
                    }}
                    onClick={() => window.open('https://github.com/divyanshece', '_blank')}
                  >
                    <GitHubIcon />
                  </IconButton>
                  <IconButton
                    sx={{
                      bgcolor: '#1e293b',
                      color: '#fff',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        color: '#0077b5',
                        bgcolor: '#334155',
                        transform: 'translateY(-2px)',
                      },
                    }}
                    onClick={() =>
                      window.open('https://www.linkedin.com/in/divyanshece/', '_blank')
                    }
                  >
                    <LinkedInIcon />
                  </IconButton>
                </Stack>
              </Box>
            </Box>

            <Divider sx={{ borderColor: '#1e293b', mb: 3 }} />
            <Typography
              variant="body2"
              color="#64748b"
              sx={{ textAlign: 'center', fontSize: '0.875rem' }}
            >
              © {new Date().getFullYear()} SupplyNet Web. All rights reserved.
            </Typography>
          </Container>
        </Box>
      </Box>
      <LoginModal
        open={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        defaultTab={loginModalTab}
      />
    </ThemeProvider>
  )
}

export default LandingPage

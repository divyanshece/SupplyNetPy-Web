import { createTheme } from '@mui/material/styles';

export const getTheme = (mode) => createTheme({
  palette: {
    mode,
    ...(mode === 'light'
      ? {
          // Light Mode - Soft, Modern, Easy on Eyes
          primary: {
            main: '#667eea',
            light: '#8b9dff',
            dark: '#5568d3',
          },
          secondary: {
            main: '#764ba2',
            light: '#9d6ec8',
            dark: '#5e3a82',
          },
          background: {
            default: '#f7f8fc',
            paper: '#ffffff',
            elevated: '#fafbff',
          },
          text: {
            primary: '#1a1d29',
            secondary: '#6b7280',
            disabled: '#9ca3af',
          },
          divider: '#e5e7eb',
          action: {
            hover: 'rgba(102, 126, 234, 0.04)',
            selected: 'rgba(102, 126, 234, 0.08)',
          },
          success: {
            main: '#10b981',
            light: '#34d399',
            dark: '#059669',
          },
          error: {
            main: '#ef4444',
            light: '#f87171',
            dark: '#dc2626',
          },
          warning: {
            main: '#f59e0b',
            light: '#fbbf24',
            dark: '#d97706',
          },
          info: {
            main: '#3b82f6',
            light: '#60a5fa',
            dark: '#2563eb',
          },
        }
      : {
          // Dark Mode - Sleek, Elegant, High Contrast
          primary: {
            main: '#818cf8',
            light: '#a5b4fc',
            dark: '#6366f1',
          },
          secondary: {
            main: '#a78bfa',
            light: '#c4b5fd',
            dark: '#8b5cf6',
          },
          background: {
            default: '#0f1117',
            paper: '#1a1d29',
            elevated: '#232633',
          },
          text: {
            primary: '#f3f4f6',
            secondary: '#9ca3af',
            disabled: '#6b7280',
          },
          divider: '#2d3142',
          action: {
            hover: 'rgba(129, 140, 248, 0.08)',
            selected: 'rgba(129, 140, 248, 0.16)',
          },
          success: {
            main: '#34d399',
            light: '#6ee7b7',
            dark: '#10b981',
          },
          error: {
            main: '#f87171',
            light: '#fca5a5',
            dark: '#ef4444',
          },
          warning: {
            main: '#fbbf24',
            light: '#fcd34d',
            dark: '#f59e0b',
          },
          info: {
            main: '#60a5fa',
            light: '#93c5fd',
            dark: '#3b82f6',
          },
        }),
  },
  typography: {
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif',
    h6: {
      fontWeight: 700,
      letterSpacing: '-0.5px',
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 12,
  },
  shadows: mode === 'light' 
    ? [
        'none',
        '0 1px 2px 0 rgba(0, 0, 0, 0.03)',
        '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
        '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
        '0 10px 15px -3px rgba(0, 0, 0, 0.05)',
        '0 20px 25px -5px rgba(0, 0, 0, 0.05)',
        '0 25px 50px -12px rgba(0, 0, 0, 0.1)',
        ...Array(18).fill('none'),
      ]
    : [
        'none',
        '0 1px 2px 0 rgba(0, 0, 0, 0.4)',
        '0 1px 3px 0 rgba(0, 0, 0, 0.5)',
        '0 4px 6px -1px rgba(0, 0, 0, 0.5)',
        '0 10px 15px -3px rgba(0, 0, 0, 0.5)',
        '0 20px 25px -5px rgba(0, 0, 0, 0.6)',
        '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
        ...Array(18).fill('none'),
      ],
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          padding: '8px 16px',
          boxShadow: 'none',
          transition: 'all 0.2s ease',
          '&:hover': {
            boxShadow: mode === 'light' 
              ? '0 4px 12px rgba(102, 126, 234, 0.15)'
              : '0 4px 12px rgba(129, 140, 248, 0.25)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          transition: 'all 0.2s ease',
        },
      },
    },
  },
});
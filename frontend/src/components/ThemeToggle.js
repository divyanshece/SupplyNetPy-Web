import React from 'react';
import { IconButton, Tooltip } from '@mui/material';
import { styled } from '@mui/material/styles';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';

const AnimatedIconButton = styled(IconButton)(({ theme }) => ({
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    transform: 'rotate(15deg) scale(1.1)',
  },
  '& svg': {
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  },
}));

function ThemeToggle({ mode, onToggle }) {
  return (
    <Tooltip title={mode === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}>
      <AnimatedIconButton
        onClick={onToggle}
        sx={{
          color: mode === 'light' ? '#f59e0b' : '#fbbf24',
          bgcolor: mode === 'light' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(251, 191, 36, 0.1)',
          '&:hover': {
            bgcolor: mode === 'light' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(251, 191, 36, 0.2)',
          },
        }}
      >
        {mode === 'light' ? (
          <LightModeIcon 
            sx={{ 
              fontSize: 20,
              animation: 'spin 20s linear infinite',
              '@keyframes spin': {
                '0%': { transform: 'rotate(0deg)' },
                '100%': { transform: 'rotate(360deg)' },
              },
            }} 
          />
        ) : (
          <DarkModeIcon 
            sx={{ 
              fontSize: 20,
              animation: 'pulse 2s ease-in-out infinite',
              '@keyframes pulse': {
                '0%, 100%': { opacity: 1 },
                '50%': { opacity: 0.7 },
              },
            }} 
          />
        )}
      </AnimatedIconButton>
    </Tooltip>
  );
}

export default ThemeToggle;
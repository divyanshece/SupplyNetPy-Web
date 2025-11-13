import React from 'react';
import { Box, Typography, CircularProgress, Chip } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

function SaveIndicator({ status }) {
  // status: 'saved', 'saving', 'error', 'unsaved'

  const getDisplay = () => {
    switch (status) {
      case 'saving':
        return {
          icon: <CircularProgress size={14} sx={{ color: 'primary.main' }} />,
          text: 'Saving...',
          color: 'primary.main',
          bgcolor: 'rgba(102, 126, 234, 0.1)',
        };
      case 'saved':
        return {
          icon: <CheckCircleIcon sx={{ fontSize: 16, color: 'success.main' }} />,
          text: 'Saved',
          color: 'success.main',
          bgcolor: 'rgba(16, 185, 129, 0.1)',
        };
      case 'error':
        return {
          icon: null,
          text: 'Save failed',
          color: 'error.main',
          bgcolor: 'rgba(239, 68, 68, 0.1)',
        };
      case 'unsaved':
        return {
          icon: <CloudUploadIcon sx={{ fontSize: 16, color: 'warning.main' }} />,
          text: 'Unsaved',
          color: 'warning.main',
          bgcolor: 'rgba(245, 158, 11, 0.1)',
        };
      default:
        return null;
    }
  };

  const display = getDisplay();
  if (!display) return null;

  return (
    <Chip
      icon={display.icon}
      label={display.text}
      size="small"
      sx={{
        height: 28,
        fontSize: '0.75rem',
        fontWeight: 600,
        color: display.color,
        bgcolor: display.bgcolor,
        border: 'none',
        '& .MuiChip-icon': {
          marginLeft: '8px',
        },
      }}
    />
  );
}

export default SaveIndicator;
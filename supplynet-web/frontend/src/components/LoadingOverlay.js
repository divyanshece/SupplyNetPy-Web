import React from 'react';
import { Box, CircularProgress, Typography, Stack, useTheme } from '@mui/material';

function LoadingOverlay({ message = 'Loading...', subMessage = null }) {
  const theme = useTheme();

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        bgcolor: theme.palette.mode === 'light' 
          ? 'rgba(255, 255, 255, 0.9)' 
          : 'rgba(0, 0, 0, 0.9)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        backdropFilter: 'blur(4px)',
      }}
    >
      <Stack spacing={3} alignItems="center">
        <CircularProgress size={60} thickness={4} />
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary', mb: 0.5 }}>
            {message}
          </Typography>
          {subMessage && (
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {subMessage}
            </Typography>
          )}
        </Box>
      </Stack>
    </Box>
  );
}

export default LoadingOverlay;
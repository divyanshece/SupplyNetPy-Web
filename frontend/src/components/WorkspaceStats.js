import React from 'react';
import { Box, Paper, Stack, Typography, useTheme } from '@mui/material';
import CircleIcon from '@mui/icons-material/Circle';

function WorkspaceStats({ stats }) {
  const theme = useTheme();

  if (stats.nodes === 0 && stats.links === 0 && stats.demands === 0) {
    return null; // Hide when empty
  }

  return (
    <Paper
      elevation={3}
      sx={{
        position: 'absolute',
        top: 16,
        left: 16,
        zIndex: 5,
        bgcolor: theme.palette.mode === 'light' 
          ? 'rgba(255, 255, 255, 0.95)' 
          : 'rgba(26, 29, 41, 0.95)',
        backdropFilter: 'blur(10px)',
        borderRadius: 2,
        border: `1px solid ${theme.palette.divider}`,
        px: 2,
        py: 1,
        transition: 'all 0.3s ease',
      }}
    >
      <Stack direction="row" spacing={2.5}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
          <CircleIcon sx={{ fontSize: 8, color: 'primary.main' }} />
          <Typography
            variant="caption"
            sx={{ color: 'text.primary', fontSize: '0.8rem', fontWeight: 600 }}
          >
            {stats.nodes}
          </Typography>
          <Typography
            variant="caption"
            sx={{ color: 'text.secondary', fontSize: '0.75rem', fontWeight: 500 }}
          >
            nodes
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
          <CircleIcon sx={{ fontSize: 8, color: 'secondary.main' }} />
          <Typography
            variant="caption"
            sx={{ color: 'text.primary', fontSize: '0.8rem', fontWeight: 600 }}
          >
            {stats.links}
          </Typography>
          <Typography
            variant="caption"
            sx={{ color: 'text.secondary', fontSize: '0.75rem', fontWeight: 500 }}
          >
            links
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
          <CircleIcon sx={{ fontSize: 8, color: 'info.main' }} />
          <Typography
            variant="caption"
            sx={{ color: 'text.primary', fontSize: '0.8rem', fontWeight: 600 }}
          >
            {stats.demands}
          </Typography>
          <Typography
            variant="caption"
            sx={{ color: 'text.secondary', fontSize: '0.75rem', fontWeight: 500 }}
          >
            demands
          </Typography>
        </Box>
      </Stack>
    </Paper>
  );
}

export default WorkspaceStats;
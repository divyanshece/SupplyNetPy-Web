import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  IconButton,
  Chip,
  Stack,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import FolderIcon from '@mui/icons-material/Folder';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';

function SavedNetworks({ savedNetworks, onClose, onLoadNetwork, onDeleteNetwork }) {
  const formatDate = (isoDate) => {
    const date = new Date(isoDate);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Paper
      elevation={8}
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 999,
        bgcolor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
      }}
      onClick={onClose}
    >
      <Paper
        elevation={16}
        sx={{
          width: '90%',
          maxWidth: 1200,
          maxHeight: '90vh',
          overflow: 'auto',
          bgcolor: 'white',
          borderRadius: 2,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <Box
          sx={{
            p: 2,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'sticky',
            top: 0,
            zIndex: 10,
          }}
        >
          <Stack direction="row" spacing={2} alignItems="center">
            <FolderIcon />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Saved Networks
            </Typography>
            <Chip
              label={`${savedNetworks.length} Networks`}
              size="small"
              sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', fontWeight: 600 }}
            />
          </Stack>
          <IconButton size="small" sx={{ color: 'white' }} onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Content */}
        <Box sx={{ p: 3 }}>
          {savedNetworks.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <FolderIcon sx={{ fontSize: 80, color: '#ccc', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No saved networks yet
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Create a network and click the save icon to save it here
              </Typography>
            </Box>
          ) : (
            <Grid container spacing={3}>
              {savedNetworks.map((network) => (
                <Grid item xs={12} md={6} lg={4} key={network.id}>
                  <Card
                    elevation={2}
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                      },
                    }}
                  >
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Stack spacing={2}>
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                          <Typography variant="h6" sx={{ fontWeight: 700, flexGrow: 1 }}>
                            {network.name}
                          </Typography>
                          <IconButton 
                            size="small" 
                            color="error"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (window.confirm(`Delete "${network.name}"?`)) {
                                onDeleteNetwork(network.id);
                              }
                            }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>

                        <Stack direction="row" spacing={1} alignItems="center">
                          <CalendarTodayIcon sx={{ fontSize: 16, color: '#666' }} />
                          <Typography variant="caption" color="text.secondary">
                            {formatDate(network.savedAt)}
                          </Typography>
                        </Stack>

                        {network.description && (
                          <Typography variant="body2" color="text.secondary">
                            {network.description}
                          </Typography>
                        )}

                        <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ pt: 1 }}>
                          <Chip
                            label={`${network.config.nodes.length} Nodes`}
                            size="small"
                            variant="outlined"
                            color="primary"
                          />
                          <Chip
                            label={`${network.config.edges.length} Links`}
                            size="small"
                            variant="outlined"
                            color="primary"
                          />
                          <Chip
                            label={`${network.config.demands.length} Demands`}
                            size="small"
                            variant="outlined"
                            color="primary"
                          />
                        </Stack>
                      </Stack>
                    </CardContent>
                    <CardActions sx={{ p: 2, pt: 0 }}>
                      <Button
                        variant="contained"
                        fullWidth
                        startIcon={<PlayArrowIcon />}
                        onClick={() => onLoadNetwork(network)}
                        sx={{
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          fontWeight: 600,
                          '&:hover': {
                            background: 'linear-gradient(135deg, #5568d3 0%, #6a3f8f 100%)',
                          },
                        }}
                      >
                        Load Network
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      </Paper>
    </Paper>
  );
}

export default SavedNetworks;
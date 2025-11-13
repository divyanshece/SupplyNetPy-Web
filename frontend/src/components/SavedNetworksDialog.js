import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Box,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemSecondaryAction,
  Chip,
  Stack,
  Divider,
  Button,
  TextField,
  useTheme,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import EditIcon from '@mui/icons-material/Edit';
import CheckIcon from '@mui/icons-material/Check';

function SavedNetworksDialog({ open, onClose, networks, onLoad, onDelete, onRename }) {
  const theme = useTheme();
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');

  const handleStartEdit = (network) => {
    setEditingId(network.id);
    setEditName(network.name);
  };

  const handleSaveEdit = async (networkId) => {
    if (editName.trim()) {
      await onRename(networkId, editName.trim());
    }
    setEditingId(null);
    setEditName('');
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  if (!networks || networks.length === 0) {
    return (
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            bgcolor: 'background.paper',
          }
        }}
      >
        <DialogTitle sx={{ 
          borderBottom: `1px solid ${theme.palette.divider}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          py: 2,
        }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <FolderOpenIcon color="primary" />
            <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1.1rem' }}>
              My Networks
            </Typography>
          </Stack>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ py: 4, textAlign: 'center' }}>
          <FolderOpenIcon sx={{ fontSize: 80, color: 'text.disabled', mb: 2, opacity: 0.3 }} />
          <Typography variant="h6" sx={{ color: 'text.secondary', mb: 1 }}>
            No saved networks yet
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.disabled' }}>
            Create and save your first supply chain network
          </Typography>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          bgcolor: 'background.paper',
          maxHeight: '80vh',
        }
      }}
    >
      <DialogTitle sx={{ 
        borderBottom: `1px solid ${theme.palette.divider}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        py: 2,
      }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <FolderOpenIcon color="primary" />
          <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1.1rem' }}>
            My Networks
          </Typography>
          <Chip 
            label={networks.length} 
            size="small" 
            sx={{ 
              bgcolor: 'primary.main',
              color: 'white',
              fontWeight: 600,
              height: 24,
            }}
          />
        </Stack>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        <List sx={{ py: 0 }}>
          {networks.map((network, index) => (
            <React.Fragment key={network.id}>
              <ListItem
                sx={{
                  py: 2,
                  px: 3,
                  '&:hover': {
                    bgcolor: 'action.hover',
                  },
                }}
              >
                <ListItemButton
                  onClick={() => {
                    onLoad(network.id);
                    onClose();
                  }}
                  sx={{
                    borderRadius: 2,
                    p: 2,
                    '&:hover': {
                      bgcolor: 'action.selected',
                    },
                  }}
                >
                  {editingId === network.id ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
                      <TextField
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        size="small"
                        autoFocus
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') handleSaveEdit(network.id);
                        }}
                        sx={{ flex: 1 }}
                      />
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSaveEdit(network.id);
                        }}
                      >
                        <CheckIcon />
                      </IconButton>
                    </Box>
                  ) : (
                    <ListItemText
                      primary={
                        <Typography variant="body1" sx={{ fontWeight: 600, mb: 0.5 }}>
                          {network.name}
                        </Typography>
                      }
                      secondary={
                        <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
                          <Chip
                            label={`${network.nodes?.length || 0} nodes`}
                            size="small"
                            sx={{ 
                              height: 20,
                              fontSize: '0.7rem',
                              bgcolor: 'primary.light',
                              color: 'primary.dark',
                            }}
                          />
                          <Chip
                            label={`${network.edges?.length || 0} links`}
                            size="small"
                            sx={{ 
                              height: 20,
                              fontSize: '0.7rem',
                              bgcolor: 'secondary.light',
                              color: 'secondary.dark',
                            }}
                          />
                          <Chip
                            label={`${network.demands?.length || 0} demands`}
                            size="small"
                            sx={{ 
                              height: 20,
                              fontSize: '0.7rem',
                              bgcolor: 'info.light',
                              color: 'info.dark',
                            }}
                          />
                          <Stack direction="row" spacing={0.5} alignItems="center" sx={{ ml: 1 }}>
                            <AccessTimeIcon sx={{ fontSize: 12, color: 'text.disabled' }} />
                            <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: '0.7rem' }}>
                              {formatDate(network.updated_at)}
                            </Typography>
                          </Stack>
                        </Stack>
                      }
                    />
                  )}
                </ListItemButton>

                {editingId !== network.id && (
                  <ListItemSecondaryAction>
                    <IconButton
                      edge="end"
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStartEdit(network);
                      }}
                      sx={{ mr: 1 }}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      edge="end"
                      size="small"
                      color="error"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm(`Delete "${network.name}"?`)) {
                          onDelete(network.id);
                        }
                      }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </ListItemSecondaryAction>
                )}
              </ListItem>
              {index < networks.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </List>
      </DialogContent>
    </Dialog>
  );
}

export default SavedNetworksDialog;
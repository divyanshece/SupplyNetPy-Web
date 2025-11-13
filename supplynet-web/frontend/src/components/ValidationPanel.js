import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Collapse,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Divider,
  Button,
  Stack,
  Alert,
  useTheme,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ErrorIcon from '@mui/icons-material/Error';
import WarningIcon from '@mui/icons-material/Warning';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CloseIcon from '@mui/icons-material/Close';
function ValidationPanel({ validation, onClose }) {
  const theme = useTheme();
  const [expandedSections, setExpandedSections] = useState({
    errors: true,
    warnings: true,
    suggestions: false,
  });

  const { errors, warnings, suggestions, isValid } = validation;

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical':
      case 'high':
        return 'error.main';
      case 'medium':
        return 'warning.main';
      case 'low':
        return 'info.main';
      default:
        return 'text.secondary';
    }
  };

  if (errors.length === 0 && warnings.length === 0 && suggestions.length === 0) {
    return (
      <Paper
    elevation={3}
    sx={{
      position: 'fixed',
      bottom: 20,
      right: 20,
      width: 420,
      maxHeight: '80vh',
      overflow: 'auto',
      borderRadius: 3,
      bgcolor: 'background.paper',
      border: `1px solid ${theme.palette.divider}`,
      zIndex: 1000,
    }}
  >
        <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <CheckCircleIcon sx={{ color: 'success.main', fontSize: 28 }} />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              All Good! ✨
            </Typography>
          </Stack>
          <IconButton size="small" onClick={onClose}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
        <Divider />
        <Box sx={{ p: 2 }}>
          <Alert severity="success" sx={{ borderRadius: 2 }}>
            Your network configuration is ready for simulation!
          </Alert>
        </Box>
      </Paper>
    );
  }

  return (
    <Paper
      elevation={3}
      sx={{
        position: 'fixed',
        bottom: 20,
        right: 20,
        width: 420,
        maxHeight: '80vh',
        overflow: 'auto',
        borderRadius: 3,
        bgcolor: 'background.paper',
        border: `1px solid ${theme.palette.divider}`,
        zIndex: 1000,
      }}
    >
      {/* Header */}
      <Box 
        sx={{ 
          p: 2, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          borderBottom: `1px solid ${theme.palette.divider}`,
          bgcolor: errors.length > 0 ? 'rgba(239, 68, 68, 0.05)' : 'rgba(245, 158, 11, 0.05)',
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center">
          {errors.length > 0 ? (
            <ErrorIcon sx={{ color: 'error.main', fontSize: 24 }} />
          ) : (
            <WarningIcon sx={{ color: 'warning.main', fontSize: 24 }} />
          )}
          <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1.1rem' }}>
            Validation Report
          </Typography>
        </Stack>
        <IconButton size="small" onClick={onClose}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      {/* Summary */}
      <Box sx={{ p: 2, bgcolor: 'action.hover' }}>
        <Stack direction="row" spacing={2} justifyContent="center">
          {errors.length > 0 && (
            <Chip
              label={`${errors.length} Error${errors.length > 1 ? 's' : ''}`}
              color="error"
              size="small"
              sx={{ fontWeight: 600 }}
            />
          )}
          {warnings.length > 0 && (
            <Chip
              label={`${warnings.length} Warning${warnings.length > 1 ? 's' : ''}`}
              color="warning"
              size="small"
              sx={{ fontWeight: 600 }}
            />
          )}
          {suggestions.length > 0 && (
            <Chip
              label={`${suggestions.length} Suggestion${suggestions.length > 1 ? 's' : ''}`}
              color="info"
              size="small"
              sx={{ fontWeight: 600 }}
            />
          )}
        </Stack>
      </Box>

      {/* Errors Section */}
      {errors.length > 0 && (
        <>
          <Box
            sx={{
              p: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              '&:hover': { bgcolor: 'action.hover' },
            }}
            onClick={() => toggleSection('errors')}
          >
            <Stack direction="row" spacing={1} alignItems="center">
              <ErrorIcon sx={{ color: 'error.main', fontSize: 20 }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                Errors ({errors.length})
              </Typography>
            </Stack>
            <IconButton size="small">
              {expandedSections.errors ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
          </Box>
          <Collapse in={expandedSections.errors}>
            <List sx={{ py: 0 }}>
              {errors.map((error, idx) => (
                <ListItem
                  key={idx}
                  sx={{
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    borderLeft: `3px solid`,
                    borderColor: getSeverityColor(error.severity),
                    bgcolor: 'rgba(239, 68, 68, 0.03)',
                    mb: 0.5,
                    mx: 1,
                    borderRadius: 1,
                  }}
                >
                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                    {error.message}
                  </Typography>
                  {error.details && (
                    <Typography variant="caption" sx={{ color: 'text.secondary', mb: 0.5 }}>
                      {error.details}
                    </Typography>
                  )}
                  <Chip
                    label={error.action}
                    size="small"
                    sx={{
                      mt: 0.5,
                      height: 24,
                      fontSize: '0.7rem',
                      bgcolor: 'error.main',
                      color: 'white',
                    }}
                  />
                </ListItem>
              ))}
            </List>
          </Collapse>
          <Divider />
        </>
      )}

      {/* Warnings Section */}
      {warnings.length > 0 && (
        <>
          <Box
            sx={{
              p: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              '&:hover': { bgcolor: 'action.hover' },
            }}
            onClick={() => toggleSection('warnings')}
          >
            <Stack direction="row" spacing={1} alignItems="center">
              <WarningIcon sx={{ color: 'warning.main', fontSize: 20 }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                Warnings ({warnings.length})
              </Typography>
            </Stack>
            <IconButton size="small">
              {expandedSections.warnings ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
          </Box>
          <Collapse in={expandedSections.warnings}>
            <List sx={{ py: 0 }}>
              {warnings.map((warning, idx) => (
                <ListItem
                  key={idx}
                  sx={{
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    borderLeft: `3px solid`,
                    borderColor: getSeverityColor(warning.severity),
                    bgcolor: 'rgba(245, 158, 11, 0.03)',
                    mb: 0.5,
                    mx: 1,
                    borderRadius: 1,
                  }}
                >
                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                    {warning.message}
                  </Typography>
                  {warning.details && (
                    <Typography variant="caption" sx={{ color: 'text.secondary', mb: 0.5 }}>
                      {warning.details}
                    </Typography>
                  )}
                  <Chip
                    label={warning.action}
                    size="small"
                    sx={{
                      mt: 0.5,
                      height: 24,
                      fontSize: '0.7rem',
                      bgcolor: 'warning.main',
                      color: 'white',
                    }}
                  />
                </ListItem>
              ))}
            </List>
          </Collapse>
          <Divider />
        </>
      )}

      {/* Suggestions Section */}
      {suggestions.length > 0 && (
        <>
          <Box
            sx={{
              p: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              '&:hover': { bgcolor: 'action.hover' },
            }}
            onClick={() => toggleSection('suggestions')}
          >
            <Stack direction="row" spacing={1} alignItems="center">
              <LightbulbIcon sx={{ color: 'info.main', fontSize: 20 }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                Optimization Tips ({suggestions.length})
              </Typography>
            </Stack>
            <IconButton size="small">
              {expandedSections.suggestions ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
          </Box>
          <Collapse in={expandedSections.suggestions}>
            <List sx={{ py: 0 }}>
              {suggestions.map((suggestion, idx) => (
                <ListItem
                  key={idx}
                  sx={{
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    borderLeft: `3px solid`,
                    borderColor: 'info.main',
                    bgcolor: 'rgba(59, 130, 246, 0.03)',
                    mb: 0.5,
                    mx: 1,
                    borderRadius: 1,
                  }}
                >
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                    <Typography sx={{ fontSize: '1.2rem' }}>{suggestion.icon}</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {suggestion.message}
                    </Typography>
                  </Stack>
                  <Chip
                    label={suggestion.action}
                    size="small"
                    sx={{
                      mt: 0.5,
                      height: 24,
                      fontSize: '0.7rem',
                      bgcolor: 'info.main',
                      color: 'white',
                    }}
                  />
                </ListItem>
              ))}
            </List>
          </Collapse>
        </>
      )}
    </Paper>
  );
}

export default ValidationPanel;
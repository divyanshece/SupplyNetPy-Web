import React, { useState, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Stack,
  LinearProgress,
  IconButton,
  Tooltip,
  Divider,
  Alert,
  useTheme,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import WarningIcon from '@mui/icons-material/Warning';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import InfoIcon from '@mui/icons-material/Info';
import { generateInsights } from '../utils/insightsEngine';

function InsightsPanel({ simulationResults, nodes, edges, demands }) {
  const theme = useTheme();
  const [expanded, setExpanded] = useState('summary');

  const insights = useMemo(() => {
    if (!simulationResults) return null;
    return generateInsights(simulationResults, nodes, edges, demands);
  }, [simulationResults, nodes, edges, demands]);

  if (!insights) return null;

  const handleChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'info';
      default: return 'default';
    }
  };

  return (
    <Paper
      elevation={3}
      sx={{
        height: '100%',
        overflow: 'auto',
        bgcolor: 'background.paper',
        borderRadius: 2,
        border: `1px solid ${theme.palette.divider}`,
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 2.5,
          background: theme.palette.mode === 'light'
            ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
            : 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
          color: 'white',
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Stack direction="row" spacing={1.5} alignItems="center">
          <LightbulbIcon sx={{ fontSize: 28 }} />
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1.1rem' }}>
              Performance Insights
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.9 }}>
              AI-powered recommendations for optimization
            </Typography>
          </Box>
        </Stack>
      </Box>

      <Box sx={{ p: 2 }}>
        {/* Overall Health Score */}
        <Accordion 
          expanded={expanded === 'summary'} 
          onChange={handleChange('summary')}
          sx={{ mb: 1 }}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Stack direction="row" spacing={2} alignItems="center" sx={{ width: '100%' }}>
              <Typography sx={{ fontWeight: 600 }}>Overall Health</Typography>
              <Chip
                label={insights.summary.overallHealth.label}
                size="small"
                sx={{
                  bgcolor: insights.summary.overallHealth.color,
                  color: 'white',
                  fontWeight: 600,
                }}
              />
            </Stack>
          </AccordionSummary>
          <AccordionDetails>
            <Box sx={{ mb: 2 }}>
              <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
                <Typography variant="body2">Health Score</Typography>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                  {insights.summary.overallHealth.score}/100
                </Typography>
              </Stack>
              <LinearProgress
                variant="determinate"
                value={insights.summary.overallHealth.score}
                sx={{
                  height: 8,
                  borderRadius: 1,
                  bgcolor: 'action.hover',
                  '& .MuiLinearProgress-bar': {
                    bgcolor: insights.summary.overallHealth.color,
                  },
                }}
              />
            </Box>

            <Divider sx={{ my: 2 }} />

            <Stack spacing={1.5}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="text.secondary">
                  Warnings
                </Typography>
                <Chip label={insights.summary.totalWarnings} size="small" color="warning" />
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="text.secondary">
                  Recommendations
                </Typography>
                <Chip label={insights.summary.totalRecommendations} size="small" color="info" />
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="text.secondary">
                  Optimizations
                </Typography>
                <Chip label={insights.summary.totalOptimizations} size="small" color="success" />
              </Box>
              {insights.summary.potentialSavings > 0 && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">
                    Potential Savings
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: 'success.main' }}>
                    ${insights.summary.potentialSavings.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </Typography>
                </Box>
              )}
            </Stack>
          </AccordionDetails>
        </Accordion>

        {/* Warnings */}
        {insights.warnings.length > 0 && (
          <Accordion 
            expanded={expanded === 'warnings'} 
            onChange={handleChange('warnings')}
            sx={{ mb: 1 }}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <WarningIcon color="warning" />
                <Typography sx={{ fontWeight: 600 }}>
                  Warnings ({insights.warnings.length})
                </Typography>
              </Stack>
            </AccordionSummary>
            <AccordionDetails>
              <Stack spacing={2}>
                {insights.warnings.map((warning, index) => (
                  <Alert 
                    key={index} 
                    severity={getSeverityColor(warning.severity)}
                    sx={{ 
                      '& .MuiAlert-message': { width: '100%' },
                      borderRadius: 2,
                    }}
                  >
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
                      {warning.title}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1, fontSize: '0.85rem' }}>
                      {warning.description}
                    </Typography>
                    <Typography variant="body2" sx={{ fontSize: '0.85rem', fontStyle: 'italic' }}>
                      💡 {warning.recommendation}
                    </Typography>
                  </Alert>
                ))}
              </Stack>
            </AccordionDetails>
          </Accordion>
        )}

        {/* Optimizations */}
        {insights.optimizations.length > 0 && (
          <Accordion 
            expanded={expanded === 'optimizations'} 
            onChange={handleChange('optimizations')}
            sx={{ mb: 1 }}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <TrendingUpIcon color="success" />
                <Typography sx={{ fontWeight: 600 }}>
                  Optimizations ({insights.optimizations.length})
                </Typography>
              </Stack>
            </AccordionSummary>
            <AccordionDetails>
              <Stack spacing={2}>
                {insights.optimizations.map((opt, index) => (
                  <Paper
                    key={index}
                    sx={{
                      p: 2,
                      bgcolor: 'success.light',
                      color: 'success.dark',
                      borderRadius: 2,
                      border: `1px solid`,
                      borderColor: 'success.main',
                    }}
                  >
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
                      {opt.title}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1, fontSize: '0.85rem' }}>
                      {opt.description}
                    </Typography>
                    <Typography variant="body2" sx={{ fontSize: '0.85rem', fontStyle: 'italic', mb: 1 }}>
                      💡 {opt.recommendation}
                    </Typography>
                    {opt.potentialSavings > 0 && (
                      <Chip
                        label={`Save $${opt.potentialSavings.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
                        size="small"
                        sx={{
                          bgcolor: 'success.main',
                          color: 'white',
                          fontWeight: 600,
                        }}
                      />
                    )}
                  </Paper>
                ))}
              </Stack>
            </AccordionDetails>
          </Accordion>
        )}

        {/* Recommendations */}
        {insights.recommendations.length > 0 && (
          <Accordion 
            expanded={expanded === 'recommendations'} 
            onChange={handleChange('recommendations')}
            sx={{ mb: 1 }}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <InfoIcon color="info" />
                <Typography sx={{ fontWeight: 600 }}>
                  Recommendations ({insights.recommendations.length})
                </Typography>
              </Stack>
            </AccordionSummary>
            <AccordionDetails>
              <Stack spacing={2}>
                {insights.recommendations.map((rec, index) => (
                  <Alert 
                    key={index} 
                    severity="info"
                    sx={{ 
                      '& .MuiAlert-message': { width: '100%' },
                      borderRadius: 2,
                    }}
                  >
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
                      {rec.title}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1, fontSize: '0.85rem' }}>
                      {rec.description}
                    </Typography>
                    <Typography variant="body2" sx={{ fontSize: '0.85rem', fontStyle: 'italic' }}>
                      💡 {rec.recommendation}
                    </Typography>
                  </Alert>
                ))}
              </Stack>
            </AccordionDetails>
          </Accordion>
        )}

        {/* Key Metrics */}
        {insights.keyMetrics.length > 0 && (
          <Accordion 
            expanded={expanded === 'metrics'} 
            onChange={handleChange('metrics')}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <CheckCircleIcon color="success" />
                <Typography sx={{ fontWeight: 600 }}>
                  Key Metrics ({insights.keyMetrics.length})
                </Typography>
              </Stack>
            </AccordionSummary>
            <AccordionDetails>
              <Stack spacing={1.5}>
                {insights.keyMetrics.map((metric, index) => (
                  <Box
                    key={index}
                    sx={{
                      p: 1.5,
                      bgcolor: 'action.hover',
                      borderRadius: 2,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {metric.metric}
                    </Typography>
                    <Chip
                      label={metric.value}
                      size="small"
                      color="success"
                      sx={{ fontWeight: 600 }}
                    />
                  </Box>
                ))}
              </Stack>
            </AccordionDetails>
          </Accordion>
        )}
      </Box>
    </Paper>
  );
}

export default InsightsPanel;
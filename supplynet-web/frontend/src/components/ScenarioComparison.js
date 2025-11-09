import React from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Stack,
  Button,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';

function ScenarioComparison({ scenarios, onClose, onDelete, onLoad }) {
  if (scenarios.length === 0) {
    return null;
  }

  const getBestValue = (metric, scenarios) => {
    const values = scenarios.map(s => s.results.metrics[metric] || 0);
    return Math.max(...values);
  };

  const isHighlighted = (value, metric, scenarios) => {
    const best = getBestValue(metric, scenarios);
    return value === best && best > 0;
  };

  return (
    <Paper
      elevation={8}
      sx={{
        position: 'fixed',
        top: 70,
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
            background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Stack direction="row" spacing={2} alignItems="center">
            <CompareArrowsIcon />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Scenario Comparison
            </Typography>
            <Chip
              label={`${scenarios.length} Scenarios`}
              size="small"
              sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', fontWeight: 600 }}
            />
          </Stack>
          <IconButton size="small" sx={{ color: 'white' }} onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Comparison Table */}
        <Box sx={{ p: 2 }}>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, bgcolor: '#f5f5f5' }}>Metric</TableCell>
                  {scenarios.map((scenario) => (
                    <TableCell key={scenario.id} align="center" sx={{ fontWeight: 700, bgcolor: '#f5f5f5' }}>
                      <Stack spacing={1} alignItems="center">
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                          {scenario.name}
                        </Typography>
                        <Stack direction="row" spacing={0.5}>
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<PlayArrowIcon />}
                            onClick={() => onLoad(scenario)}
                            sx={{ fontSize: '0.7rem', py: 0.3 }}
                          >
                            Load
                          </Button>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => onDelete(scenario.id)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Stack>
                      </Stack>
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {/* Financial Metrics */}
                <TableRow>
                  <TableCell colSpan={scenarios.length + 1} sx={{ bgcolor: '#e3f2fd', fontWeight: 600 }}>
                    💰 Financial
                  </TableCell>
                </TableRow>
                <TableRow hover>
                  <TableCell>Profit</TableCell>
                  {scenarios.map((scenario) => {
                    const value = scenario.results.metrics.profit;
                    const highlighted = isHighlighted(value, 'profit', scenarios);
                    return (
                      <TableCell
                        key={scenario.id}
                        align="center"
                        sx={{
                          fontWeight: highlighted ? 700 : 400,
                          bgcolor: highlighted ? '#d1fae5' : 'transparent',
                          color: highlighted ? '#10b981' : 'inherit',
                        }}
                      >
                        ${value?.toLocaleString()}
                      </TableCell>
                    );
                  })}
                </TableRow>
                <TableRow hover>
                  <TableCell>Revenue</TableCell>
                  {scenarios.map((scenario) => {
                    const value = scenario.results.metrics.revenue;
                    const highlighted = isHighlighted(value, 'revenue', scenarios);
                    return (
                      <TableCell
                        key={scenario.id}
                        align="center"
                        sx={{
                          fontWeight: highlighted ? 700 : 400,
                          bgcolor: highlighted ? '#d1fae5' : 'transparent',
                        }}
                      >
                        ${value?.toLocaleString()}
                      </TableCell>
                    );
                  })}
                </TableRow>
                <TableRow hover>
                  <TableCell>Total Cost</TableCell>
                  {scenarios.map((scenario) => (
                    <TableCell key={scenario.id} align="center">
                      ${scenario.results.metrics.total_cost?.toFixed(2)}
                    </TableCell>
                  ))}
                </TableRow>

                {/* Inventory Metrics */}
                <TableRow>
                  <TableCell colSpan={scenarios.length + 1} sx={{ bgcolor: '#f3e5f5', fontWeight: 600 }}>
                    📦 Inventory
                  </TableCell>
                </TableRow>
                <TableRow hover>
                  <TableCell>Available Inventory</TableCell>
                  {scenarios.map((scenario) => (
                    <TableCell key={scenario.id} align="center">
                      {scenario.results.metrics.available_inv}
                    </TableCell>
                  ))}
                </TableRow>
                <TableRow hover>
                  <TableCell>Avg Available Inventory</TableCell>
                  {scenarios.map((scenario) => (
                    <TableCell key={scenario.id} align="center">
                      {scenario.results.metrics.avg_available_inv?.toFixed(0)}
                    </TableCell>
                  ))}
                </TableRow>

                {/* Demand Metrics */}
                <TableRow>
                  <TableCell colSpan={scenarios.length + 1} sx={{ bgcolor: '#fff3e0', fontWeight: 600 }}>
                    📊 Demand & Supply
                  </TableCell>
                </TableRow>
                <TableRow hover>
                  <TableCell>Total Demand (Units)</TableCell>
                  {scenarios.map((scenario) => (
                    <TableCell key={scenario.id} align="center">
                      {scenario.results.metrics.total_demand?.[1] || 0}
                    </TableCell>
                  ))}
                </TableRow>
                <TableRow hover>
                  <TableCell>Shortage (Units)</TableCell>
                  {scenarios.map((scenario) => (
                    <TableCell key={scenario.id} align="center">
                      {scenario.results.metrics.shortage?.[1] || 0}
                    </TableCell>
                  ))}
                </TableRow>
                <TableRow hover>
                  <TableCell>Backorders (Units)</TableCell>
                  {scenarios.map((scenario) => (
                    <TableCell key={scenario.id} align="center">
                      {scenario.results.metrics.backorders?.[1] || 0}
                    </TableCell>
                  ))}
                </TableRow>

                {/* Configuration */}
                <TableRow>
                  <TableCell colSpan={scenarios.length + 1} sx={{ bgcolor: '#e8f5e9', fontWeight: 600 }}>
                    ⚙️ Configuration
                  </TableCell>
                </TableRow>
                <TableRow hover>
                  <TableCell>Simulation Days</TableCell>
                  {scenarios.map((scenario) => (
                    <TableCell key={scenario.id} align="center">
                      {scenario.config.simTime}
                    </TableCell>
                  ))}
                </TableRow>
                <TableRow hover>
                  <TableCell>Nodes</TableCell>
                  {scenarios.map((scenario) => (
                    <TableCell key={scenario.id} align="center">
                      {scenario.config.nodes.length}
                    </TableCell>
                  ))}
                </TableRow>
                <TableRow hover>
                  <TableCell>Demands</TableCell>
                  {scenarios.map((scenario) => (
                    <TableCell key={scenario.id} align="center">
                      {scenario.config.demands.length}
                    </TableCell>
                  ))}
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Paper>
    </Paper>
  );
}

export default ScenarioComparison;
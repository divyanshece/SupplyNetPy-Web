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
  useTheme,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import InventoryIcon from '@mui/icons-material/Inventory';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import SpeedIcon from '@mui/icons-material/Speed';

function ScenarioComparison({ scenarios, onClose, onDelete }) {
  const theme = useTheme();

  if (scenarios.length === 0) {
    return null;
  }

  const getBestValue = (metric, scenarios) => {
    const values = scenarios.map(s => s.metrics?.[metric] || 0);
    return Math.max(...values);
  };

  const isHighlighted = (value, metric, scenarios) => {
    const best = getBestValue(metric, scenarios);
    return value === best && best > 0;
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
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
        bgcolor: 'rgba(0,0,0,0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
        backdropFilter: 'blur(4px)',
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
          bgcolor: 'background.paper',
          borderRadius: 3,
          border: `1px solid ${theme.palette.divider}`,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <Box
          sx={{
            p: 2.5,
            background: theme.palette.mode === 'light'
              ? 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)'
              : 'linear-gradient(135deg, #0d47a1 0%, #01579b 100%)',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: `1px solid ${theme.palette.divider}`,
          }}
        >
          <Stack direction="row" spacing={2} alignItems="center">
            <CompareArrowsIcon sx={{ fontSize: 28 }} />
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Scenario Comparison
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.9 }}>
                Compare performance across {scenarios.length} scenarios
              </Typography>
            </Box>
          </Stack>
          <IconButton size="small" sx={{ color: 'white' }} onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Comparison Table */}
        <Box sx={{ p: 2.5 }}>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell 
                    sx={{ 
                      fontWeight: 700, 
                      bgcolor: 'action.hover',
                      borderBottom: `2px solid ${theme.palette.divider}`,
                      py: 2,
                    }}
                  >
                    Metric
                  </TableCell>
                  {scenarios.map((scenario) => (
                    <TableCell 
                      key={scenario.id} 
                      align="center" 
                      sx={{ 
                        fontWeight: 700, 
                        bgcolor: 'action.hover',
                        borderBottom: `2px solid ${theme.palette.divider}`,
                        py: 2,
                      }}
                    >
                      <Stack spacing={1} alignItems="center">
                        <Chip
                          label={scenario.name}
                          size="small"
                          color="primary"
                          sx={{ fontWeight: 600, fontSize: '0.8rem' }}
                        />
                        <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem' }}>
                          {formatDate(scenario.timestamp)}
                        </Typography>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => onDelete(scenario.id)}
                          sx={{ mt: 0.5 }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Stack>
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {/* Financial Metrics */}
                <TableRow>
                  <TableCell 
                    colSpan={scenarios.length + 1} 
                    sx={{ 
                      bgcolor: theme.palette.mode === 'light' ? '#e3f2fd' : 'rgba(25, 118, 210, 0.15)',
                      fontWeight: 700,
                      py: 1.5,
                    }}
                  >
                    <Stack direction="row" spacing={1} alignItems="center">
                      <AttachMoneyIcon sx={{ fontSize: 18, color: 'primary.main' }} />
                      <Typography sx={{ fontWeight: 700 }}>Financial Metrics</Typography>
                    </Stack>
                  </TableCell>
                </TableRow>
                <TableRow hover>
                  <TableCell sx={{ pl: 4 }}>Profit</TableCell>
                  {scenarios.map((scenario) => {
                    const value = scenario.metrics?.profit || 0;
                    const highlighted = isHighlighted(value, 'profit', scenarios);
                    return (
                      <TableCell
                        key={scenario.id}
                        align="center"
                        sx={{
                          fontWeight: highlighted ? 700 : 500,
                          bgcolor: highlighted 
                            ? (theme.palette.mode === 'light' ? '#d1fae5' : 'rgba(16, 185, 129, 0.15)')
                            : 'transparent',
                          color: highlighted ? 'success.main' : 'inherit',
                        }}
                      >
                        ${value?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </TableCell>
                    );
                  })}
                </TableRow>
                <TableRow hover>
                  <TableCell sx={{ pl: 4 }}>Revenue</TableCell>
                  {scenarios.map((scenario) => {
                    const value = scenario.metrics?.revenue || 0;
                    const highlighted = isHighlighted(value, 'revenue', scenarios);
                    return (
                      <TableCell
                        key={scenario.id}
                        align="center"
                        sx={{
                          fontWeight: highlighted ? 700 : 500,
                          bgcolor: highlighted 
                            ? (theme.palette.mode === 'light' ? '#d1fae5' : 'rgba(16, 185, 129, 0.15)')
                            : 'transparent',
                          color: highlighted ? 'success.main' : 'inherit',
                        }}
                      >
                        ${value?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </TableCell>
                    );
                  })}
                </TableRow>
                <TableRow hover>
                  <TableCell sx={{ pl: 4 }}>Total Cost</TableCell>
                  {scenarios.map((scenario) => (
                    <TableCell key={scenario.id} align="center">
                      ${(scenario.metrics?.total_cost || 0)?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </TableCell>
                  ))}
                </TableRow>
                <TableRow hover>
                  <TableCell sx={{ pl: 4 }}>Inventory Carry Cost</TableCell>
                  {scenarios.map((scenario) => (
                    <TableCell key={scenario.id} align="center">
                      ${(scenario.metrics?.inventory_carry_cost || 0)?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </TableCell>
                  ))}
                </TableRow>
                <TableRow hover>
                  <TableCell sx={{ pl: 4 }}>Transportation Cost</TableCell>
                  {scenarios.map((scenario) => (
                    <TableCell key={scenario.id} align="center">
                      ${(scenario.metrics?.transportation_cost || 0)?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </TableCell>
                  ))}
                </TableRow>

                {/* Inventory Metrics */}
                <TableRow>
                  <TableCell 
                    colSpan={scenarios.length + 1} 
                    sx={{ 
                      bgcolor: theme.palette.mode === 'light' ? '#f3e5f5' : 'rgba(156, 39, 176, 0.15)',
                      fontWeight: 700,
                      py: 1.5,
                    }}
                  >
                    <Stack direction="row" spacing={1} alignItems="center">
                      <InventoryIcon sx={{ fontSize: 18, color: 'secondary.main' }} />
                      <Typography sx={{ fontWeight: 700 }}>Inventory Metrics</Typography>
                    </Stack>
                  </TableCell>
                </TableRow>
                <TableRow hover>
                  <TableCell sx={{ pl: 4 }}>Available Inventory</TableCell>
                  {scenarios.map((scenario) => (
                    <TableCell key={scenario.id} align="center">
                      {(scenario.metrics?.available_inv || 0).toLocaleString()}
                    </TableCell>
                  ))}
                </TableRow>
                <TableRow hover>
                  <TableCell sx={{ pl: 4 }}>Avg Available Inventory</TableCell>
                  {scenarios.map((scenario) => (
                    <TableCell key={scenario.id} align="center">
                      {(scenario.metrics?.avg_available_inv || 0)?.toFixed(0)}
                    </TableCell>
                  ))}
                </TableRow>

                {/* Demand Metrics */}
                <TableRow>
                  <TableCell 
                    colSpan={scenarios.length + 1} 
                    sx={{ 
                      bgcolor: theme.palette.mode === 'light' ? '#fff3e0' : 'rgba(255, 152, 0, 0.15)',
                      fontWeight: 700,
                      py: 1.5,
                    }}
                  >
                    <Stack direction="row" spacing={1} alignItems="center">
                      <ShowChartIcon sx={{ fontSize: 18, color: 'warning.main' }} />
                      <Typography sx={{ fontWeight: 700 }}>Demand & Supply</Typography>
                    </Stack>
                  </TableCell>
                </TableRow>
                <TableRow hover>
                  <TableCell sx={{ pl: 4 }}>Total Demand (Orders)</TableCell>
                  {scenarios.map((scenario) => (
                    <TableCell key={scenario.id} align="center">
                      {scenario.metrics?.total_demand?.[0] || 0}
                    </TableCell>
                  ))}
                </TableRow>
                <TableRow hover>
                  <TableCell sx={{ pl: 4 }}>Total Demand (Units)</TableCell>
                  {scenarios.map((scenario) => (
                    <TableCell key={scenario.id} align="center">
                      {(scenario.metrics?.total_demand?.[1] || 0).toLocaleString()}
                    </TableCell>
                  ))}
                </TableRow>
                <TableRow hover>
                  <TableCell sx={{ pl: 4 }}>Shortage (Orders)</TableCell>
                  {scenarios.map((scenario) => (
                    <TableCell key={scenario.id} align="center">
                      {scenario.metrics?.shortage?.[0] || 0}
                    </TableCell>
                  ))}
                </TableRow>
                <TableRow hover>
                  <TableCell sx={{ pl: 4 }}>Shortage (Units)</TableCell>
                  {scenarios.map((scenario) => (
                    <TableCell key={scenario.id} align="center">
                      {(scenario.metrics?.shortage?.[1] || 0).toLocaleString()}
                    </TableCell>
                  ))}
                </TableRow>
                <TableRow hover>
                  <TableCell sx={{ pl: 4 }}>Backorders (Orders)</TableCell>
                  {scenarios.map((scenario) => (
                    <TableCell key={scenario.id} align="center">
                      {scenario.metrics?.backorders?.[0] || 0}
                    </TableCell>
                  ))}
                </TableRow>
                <TableRow hover>
                  <TableCell sx={{ pl: 4 }}>Backorders (Units)</TableCell>
                  {scenarios.map((scenario) => (
                    <TableCell key={scenario.id} align="center">
                      {(scenario.metrics?.backorders?.[1] || 0).toLocaleString()}
                    </TableCell>
                  ))}
                </TableRow>
                <TableRow hover>
                  <TableCell sx={{ pl: 4 }}>Fulfillment Received (Units)</TableCell>
                  {scenarios.map((scenario) => (
                    <TableCell key={scenario.id} align="center">
                      {(scenario.metrics?.fulfillment_received_by_customers?.[1] || 0).toLocaleString()}
                    </TableCell>
                  ))}
                </TableRow>

                {/* Efficiency Metrics */}
                <TableRow>
                  <TableCell 
                    colSpan={scenarios.length + 1} 
                    sx={{ 
                      bgcolor: theme.palette.mode === 'light' ? '#e8f5e9' : 'rgba(76, 175, 80, 0.15)',
                      fontWeight: 700,
                      py: 1.5,
                    }}
                  >
                    <Stack direction="row" spacing={1} alignItems="center">
                      <SpeedIcon sx={{ fontSize: 18, color: 'success.main' }} />
                      <Typography sx={{ fontWeight: 700 }}>Efficiency</Typography>
                    </Stack>
                  </TableCell>
                </TableRow>
                <TableRow hover>
                  <TableCell sx={{ pl: 4 }}>Avg Cost per Order</TableCell>
                  {scenarios.map((scenario) => (
                    <TableCell key={scenario.id} align="center">
                      ${(scenario.metrics?.avg_cost_per_order || 0)?.toFixed(2)}
                    </TableCell>
                  ))}
                </TableRow>
                <TableRow hover>
                  <TableCell sx={{ pl: 4 }}>Avg Cost per Item</TableCell>
                  {scenarios.map((scenario) => (
                    <TableCell key={scenario.id} align="center">
                      ${(scenario.metrics?.avg_cost_per_item || 0)?.toFixed(2)}
                    </TableCell>
                  ))}
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>

          {/* Summary */}
          <Box 
            sx={{ 
              mt: 3, 
              p: 2.5, 
              bgcolor: 'action.hover',
              borderRadius: 2,
              border: `1px solid ${theme.palette.divider}`,
            }}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2, color: 'primary.main' }}>
              Summary
            </Typography>
            <Stack spacing={1.5}>
              {(() => {
                const profitValues = scenarios.map(s => s.metrics?.profit || 0);
                const bestProfit = Math.max(...profitValues);
                const worstProfit = Math.min(...profitValues);
                const bestScenario = scenarios[profitValues.indexOf(bestProfit)];
                const worstScenario = scenarios[profitValues.indexOf(worstProfit)];
                
                return (
                  <>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <TrendingUpIcon sx={{ fontSize: 18, color: 'success.main' }} />
                      <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                        <strong>Best Profit:</strong> {bestScenario.name} with ${bestProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <TrendingDownIcon sx={{ fontSize: 18, color: 'error.main' }} />
                      <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                        <strong>Lowest Profit:</strong> {worstScenario.name} with ${worstProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CompareArrowsIcon sx={{ fontSize: 18, color: 'primary.main' }} />
                      <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                        <strong>Profit Difference:</strong> ${(bestProfit - worstProfit).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </Typography>
                    </Box>
                  </>
                );
              })()}
            </Stack>
          </Box>
        </Box>
      </Paper>
    </Paper>
  );
}

export default ScenarioComparison;
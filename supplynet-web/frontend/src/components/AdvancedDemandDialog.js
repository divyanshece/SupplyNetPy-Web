import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Grid,
  Card,
  CardContent,
  Stack,
  Divider,
  Chip,
  useTheme,
} from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { demandPatterns, getPatternPreview } from './DemandPatternService';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ShowChartIcon from '@mui/icons-material/ShowChart';

function AdvancedDemandDialog({ open, onClose, onSave, demand, nodes }) {
  const theme = useTheme();
  const [demandData, setDemandData] = useState(demand || {
    id: `demand_${Date.now()}`,
    name: 'New Demand',
    target_node: nodes.find(n => n.data.nodeType === 'distributor')?.id || nodes[0]?.id,
    pattern: 'constant',
    patternParams: { interval: 1 },
    quantityPattern: 'fixed',
    order_quantity: 400,
    quantityParams: {},
    delivery_cost: 10,
    lead_time: 5,
  });

  const [previewData, setPreviewData] = useState([]);

  React.useEffect(() => {
    if (demandData.pattern) {
      const preview = getPatternPreview(demandData.pattern, demandData.patternParams);
      setPreviewData(preview);
    }
  }, [demandData.pattern, demandData.patternParams]);

  const handlePatternChange = (newPattern) => {
    const defaultParams = {
      constant: { interval: 1 },
      random: { avgInterval: 1, variance: 0.2 },
      seasonal: { baseInterval: 1, amplitude: 0.5, period: 10 },
      trending: { startInterval: 1, endInterval: 2, duration: 30 },
      burst: { normalInterval: 1, burstInterval: 0.2, burstFrequency: 5 },
    };

    setDemandData({
      ...demandData,
      pattern: newPattern,
      patternParams: defaultParams[newPattern] || {},
    });
  };

  const handleParamChange = (param, value) => {
    setDemandData({
      ...demandData,
      patternParams: {
        ...demandData.patternParams,
        [param]: parseFloat(value) || 0,
      },
    });
  };

  const handleSave = () => {
    const backendDemand = {
      ...demandData,
      arrival_interval: demandData.patternParams.interval || 
                       demandData.patternParams.avgInterval || 
                       demandData.patternParams.baseInterval || 1,
    };
    onSave(backendDemand);
    onClose();
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: 'background.paper',
          borderRadius: 2,
          maxHeight: '85vh',
        }
      }}
    >
      <DialogTitle sx={{ 
        borderBottom: `1px solid ${theme.palette.divider}`,
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        py: 2,
      }}>
        <TrendingUpIcon color="primary" sx={{ fontSize: 24 }} />
        <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1.1rem' }}>
          {demand ? 'Edit Demand Pattern' : 'Create Advanced Demand'}
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ py: 2.5, px: 3 }}>
        <Grid container spacing={2.5}>
          {/* Basic Info */}
          <Grid item xs={12} md={6}>
            <TextField
              label="Demand Name"
              value={demandData.name}
              onChange={(e) => setDemandData({ ...demandData, name: e.target.value })}
              fullWidth
              size="small"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth size="small">
              <InputLabel>Target Node</InputLabel>
              <Select
                value={demandData.target_node}
                label="Target Node"
                onChange={(e) => setDemandData({ ...demandData, target_node: e.target.value })}
              >
                {nodes.map((node) => (
                  <MenuItem key={node.id} value={node.id}>
                    {node.data.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <Divider />
          </Grid>

          {/* Arrival Pattern */}
          <Grid item xs={12}>
            <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', display: 'block', mb: 1.5 }}>
              ARRIVAL PATTERN
            </Typography>
            <Grid container spacing={1.5}>
              {Object.values(demandPatterns).map((pattern) => (
                <Grid item xs={6} sm={4} md={2.4} key={pattern.id}>
                  <Card
                    sx={{
                      cursor: 'pointer',
                      border: `2px solid ${
                        demandData.pattern === pattern.id 
                          ? theme.palette.primary.main 
                          : theme.palette.divider
                      }`,
                      bgcolor: demandData.pattern === pattern.id 
                        ? 'action.selected' 
                        : 'background.paper',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        borderColor: 'primary.main',
                        transform: 'translateY(-2px)',
                      },
                    }}
                    onClick={() => handlePatternChange(pattern.id)}
                  >
                    <CardContent sx={{ textAlign: 'center', p: 1.5, '&:last-child': { pb: 1.5 } }}>
                      <Typography variant="h5" sx={{ mb: 0.5, fontSize: '1.5rem' }}>
                        {pattern.icon}
                      </Typography>
                      <Typography variant="caption" sx={{ fontWeight: 600, fontSize: '0.7rem', display: 'block', mb: 0.3 }}>
                        {pattern.name}
                      </Typography>
                      <Typography variant="caption" sx={{ fontSize: '0.65rem', color: 'text.secondary', lineHeight: 1.2 }}>
                        {pattern.description}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Grid>

          {/* Pattern Parameters */}
          <Grid item xs={12}>
            <Box sx={{ p: 2, bgcolor: 'action.hover', borderRadius: 1.5 }}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', display: 'block', mb: 1.5 }}>
                PATTERN PARAMETERS
              </Typography>
              <Grid container spacing={1.5}>
                {demandData.pattern === 'constant' && (
                  <Grid item xs={12}>
                    <TextField
                      label="Interval (days)"
                      type="number"
                      value={demandData.patternParams.interval || 1}
                      onChange={(e) => handleParamChange('interval', e.target.value)}
                      fullWidth
                      size="small"
                      inputProps={{ step: '0.1', min: 0.1 }}
                    />
                  </Grid>
                )}

                {demandData.pattern === 'random' && (
                  <>
                    <Grid item xs={6}>
                      <TextField
                        label="Average Interval"
                        type="number"
                        value={demandData.patternParams.avgInterval || 1}
                        onChange={(e) => handleParamChange('avgInterval', e.target.value)}
                        fullWidth
                        size="small"
                        inputProps={{ step: '0.1', min: 0.1 }}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        label="Variance"
                        type="number"
                        value={demandData.patternParams.variance || 0.2}
                        onChange={(e) => handleParamChange('variance', e.target.value)}
                        fullWidth
                        size="small"
                        inputProps={{ step: '0.1', min: 0, max: 1 }}
                      />
                    </Grid>
                  </>
                )}

                {demandData.pattern === 'seasonal' && (
                  <>
                    <Grid item xs={4}>
                      <TextField
                        label="Base Interval"
                        type="number"
                        value={demandData.patternParams.baseInterval || 1}
                        onChange={(e) => handleParamChange('baseInterval', e.target.value)}
                        fullWidth
                        size="small"
                        inputProps={{ step: '0.1', min: 0.1 }}
                      />
                    </Grid>
                    <Grid item xs={4}>
                      <TextField
                        label="Amplitude"
                        type="number"
                        value={demandData.patternParams.amplitude || 0.5}
                        onChange={(e) => handleParamChange('amplitude', e.target.value)}
                        fullWidth
                        size="small"
                        inputProps={{ step: '0.1', min: 0 }}
                      />
                    </Grid>
                    <Grid item xs={4}>
                      <TextField
                        label="Period (days)"
                        type="number"
                        value={demandData.patternParams.period || 10}
                        onChange={(e) => handleParamChange('period', e.target.value)}
                        fullWidth
                        size="small"
                        inputProps={{ step: '1', min: 1 }}
                      />
                    </Grid>
                  </>
                )}

                {demandData.pattern === 'trending' && (
                  <>
                    <Grid item xs={4}>
                      <TextField
                        label="Start Interval"
                        type="number"
                        value={demandData.patternParams.startInterval || 1}
                        onChange={(e) => handleParamChange('startInterval', e.target.value)}
                        fullWidth
                        size="small"
                        inputProps={{ step: '0.1', min: 0.1 }}
                      />
                    </Grid>
                    <Grid item xs={4}>
                      <TextField
                        label="End Interval"
                        type="number"
                        value={demandData.patternParams.endInterval || 2}
                        onChange={(e) => handleParamChange('endInterval', e.target.value)}
                        fullWidth
                        size="small"
                        inputProps={{ step: '0.1', min: 0.1 }}
                      />
                    </Grid>
                    <Grid item xs={4}>
                      <TextField
                        label="Duration (days)"
                        type="number"
                        value={demandData.patternParams.duration || 30}
                        onChange={(e) => handleParamChange('duration', e.target.value)}
                        fullWidth
                        size="small"
                        inputProps={{ step: '1', min: 1 }}
                      />
                    </Grid>
                  </>
                )}

                {demandData.pattern === 'burst' && (
                  <>
                    <Grid item xs={4}>
                      <TextField
                        label="Normal Interval"
                        type="number"
                        value={demandData.patternParams.normalInterval || 1}
                        onChange={(e) => handleParamChange('normalInterval', e.target.value)}
                        fullWidth
                        size="small"
                        inputProps={{ step: '0.1', min: 0.1 }}
                      />
                    </Grid>
                    <Grid item xs={4}>
                      <TextField
                        label="Burst Interval"
                        type="number"
                        value={demandData.patternParams.burstInterval || 0.2}
                        onChange={(e) => handleParamChange('burstInterval', e.target.value)}
                        fullWidth
                        size="small"
                        inputProps={{ step: '0.1', min: 0.1 }}
                      />
                    </Grid>
                    <Grid item xs={4}>
                      <TextField
                        label="Burst Frequency"
                        type="number"
                        value={demandData.patternParams.burstFrequency || 5}
                        onChange={(e) => handleParamChange('burstFrequency', e.target.value)}
                        fullWidth
                        size="small"
                        inputProps={{ step: '1', min: 1 }}
                      />
                    </Grid>
                  </>
                )}
              </Grid>
            </Box>
          </Grid>

          {/* Pattern Preview */}
          <Grid item xs={12}>
            <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 1.5, border: `1px solid ${theme.palette.divider}` }}>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
                <ShowChartIcon color="primary" sx={{ fontSize: 18 }} />
                <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>
                  PATTERN PREVIEW
                </Typography>
              </Stack>
              <ResponsiveContainer width="100%" height={120}>
                <LineChart data={previewData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                  <XAxis 
                    dataKey="x" 
                    tick={{ fontSize: 10, fill: theme.palette.text.secondary }}
                  />
                  <YAxis 
                    tick={{ fontSize: 10, fill: theme.palette.text.secondary }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: theme.palette.background.paper,
                      border: `1px solid ${theme.palette.divider}`,
                      borderRadius: '6px',
                      fontSize: '11px',
                    }}
                  />
                  <Line type="monotone" dataKey="y" stroke={theme.palette.primary.main} strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </Grid>

          <Grid item xs={12}>
            <Divider />
          </Grid>

          {/* Order Details */}
          <Grid item xs={12}>
            <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', display: 'block', mb: 1.5 }}>
              ORDER DETAILS
            </Typography>
            <Grid container spacing={1.5}>
              <Grid item xs={12} sm={4}>
                <TextField
                  label="Order Quantity"
                  type="number"
                  value={demandData.order_quantity}
                  onChange={(e) => setDemandData({ ...demandData, order_quantity: parseInt(e.target.value) })}
                  fullWidth
                  size="small"
                  inputProps={{ min: 1 }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  label="Delivery Cost ($)"
                  type="number"
                  value={demandData.delivery_cost}
                  onChange={(e) => setDemandData({ ...demandData, delivery_cost: parseFloat(e.target.value) })}
                  fullWidth
                  size="small"
                  inputProps={{ step: '0.01', min: 0 }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  label="Lead Time (days)"
                  type="number"
                  value={demandData.lead_time}
                  onChange={(e) => setDemandData({ ...demandData, lead_time: parseFloat(e.target.value) })}
                  fullWidth
                  size="small"
                  inputProps={{ step: '0.1', min: 0 }}
                />
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
        <Button onClick={onClose} sx={{ textTransform: 'none' }}>
          Cancel
        </Button>
        <Button 
          onClick={handleSave} 
          variant="contained" 
          sx={{ textTransform: 'none', fontWeight: 600 }}
        >
          Save Pattern
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default AdvancedDemandDialog;
import React, { useState } from 'react'
import {
  TextField,
  Typography,
  Box,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Paper,
  IconButton,
  Chip,
  Stack,
  Divider,
  Button,
} from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import SettingsIcon from '@mui/icons-material/Settings'
import LocalShippingIcon from '@mui/icons-material/LocalShipping'
import LinkIcon from '@mui/icons-material/Link'
import AdvancedDemandDialog from './AdvancedDemandDialog'
import SaveIndicator from './SaveIndicator'

function ConfigPanel({
  selectedNode,
  updateNodeData,
  selectedEdge,
  updateEdgeData,
  demands,
  updateDemand,
  deleteDemand,
  nodes,
  currentNetworkName,
  saveStatus,
  onRenameNetwork,
}) {
  const [showAdvancedDemand, setShowAdvancedDemand] = useState(false)
  const [editingDemand, setEditingDemand] = useState(null)

  const handleAdvancedEdit = demand => {
    setEditingDemand(demand)
    setShowAdvancedDemand(true)
  }

  const handleSaveAdvanced = demandData => {
    updateDemand(demandData.id, demandData)
    setShowAdvancedDemand(false)
  }

  if (!selectedNode && !selectedEdge && demands.length === 0) {
    return (
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: 'background.default' }}>
        {/* Network Header - Always Show */}
        <Box
          sx={{
            px: 2.5,
            py: 2,
            borderBottom: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.paper',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Box sx={{ flex: 1 }}>
            <Typography
              variant="body2"
              sx={{
                color: 'text.primary',
                fontSize: '0.9rem',
                fontWeight: 600,
                mb: 0.3,
                cursor: 'pointer',
                '&:hover': { color: 'primary.main' },
              }}
              onClick={onRenameNetwork}
              title="Click to rename"
            >
              {currentNetworkName}
            </Typography>
            <SaveIndicator status={saveStatus} />
          </Box>
        </Box>

        {/* Empty State */}
        <Box
          sx={{
            flex: 1,
            p: 3,
            textAlign: 'center',
            color: 'text.secondary',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <SettingsIcon sx={{ fontSize: 80, color: '#1976d2', mb: 2, opacity: 0.3 }} />
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
            Configuration Panel
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Select a node, link, or add demands to configure
          </Typography>
        </Box>
      </Box>
    )
  }

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: 'background.default' }}>
      {/* Network Header */}
      <Box
        sx={{
          px: 2.5,
          py: 2,
          borderBottom: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Box sx={{ flex: 1 }}>
          <Typography
            variant="body2"
            sx={{
              color: 'text.primary',
              fontSize: '0.9rem',
              fontWeight: 600,
              mb: 0.3,
              cursor: 'pointer',
              '&:hover': { color: 'primary.main' },
            }}
            onClick={onRenameNetwork}
            title="Click to rename"
          >
            {currentNetworkName}
          </Typography>
          <SaveIndicator status={saveStatus} />
        </Box>
      </Box>

      {/* Scrollable Content */}
      <Box sx={{ flex: 1, overflow: 'auto', p: 2.5 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 700, color: '#1976d2', mb: 3 }}>
          ⚙️ Configuration
        </Typography>

        {/* Link Configuration */}
        {selectedEdge && (
          <Paper
            elevation={3}
            sx={{ mb: 3, p: 2.5, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2.5 }}>
              <LinkIcon sx={{ color: '#1976d2', mr: 1.5 }} />
              <Typography
                variant="subtitle1"
                sx={{ fontWeight: 600, flexGrow: 1, fontSize: '1.1rem' }}
              >
                Link Configuration
              </Typography>
              <Chip label="Connection" size="small" color="primary" sx={{ fontWeight: 600 }} />
            </Box>

            <Typography variant="caption" sx={{ color: '#666', display: 'block', mb: 1.5 }}>
              {nodes.find(n => n.id === selectedEdge.source)?.data.label || 'Source'}
              {' → '}
              {nodes.find(n => n.id === selectedEdge.target)?.data.label || 'Target'}
            </Typography>

            <Stack spacing={2}>
              <TextField
                label="Transportation Cost ($)"
                type="number"
                value={selectedEdge.data?.cost ?? ''}
                onChange={e => {
                  const val = e.target.value;
                  if (val !== '') {
                    updateEdgeData(selectedEdge.id, { cost: parseFloat(val) || 0 });
                  }
                }}
                onBlur={e => {
                  if (e.target.value === '' || isNaN(parseFloat(e.target.value))) {
                    updateEdgeData(selectedEdge.id, { cost: 10 });
                  }
                }}
                fullWidth
                size="small"
                inputProps={{ step: '0.01', min: 0 }}
                helperText="Cost to transport goods through this link"
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                label="Lead Time (days)"
                type="number"
                value={selectedEdge.data?.lead_time ?? ''}
                onChange={e => {
                  const val = e.target.value;
                  if (val !== '') {
                    updateEdgeData(selectedEdge.id, { lead_time: parseFloat(val) || 0 });
                  }
                }}
                onBlur={e => {
                  if (e.target.value === '' || isNaN(parseFloat(e.target.value))) {
                    updateEdgeData(selectedEdge.id, { lead_time: 5 });
                  }
                }}
                fullWidth
                size="small"
                inputProps={{ step: '0.1', min: 0 }}
                helperText="Time to transport goods through this link"
                InputLabelProps={{ shrink: true }}
              />
            </Stack>
          </Paper>
        )}

        {/* Node Configuration */}
        {selectedNode && (
          <Paper
            elevation={3}
            sx={{ mb: 3, p: 2.5, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2.5 }}>
              <Box
                sx={{
                  width: 14,
                  height: 14,
                  borderRadius: '50%',
                  bgcolor: selectedNode.data.nodeType === 'supplier' ? '#4CAF50' : '#2196F3',
                  mr: 1.5,
                  boxShadow: 2,
                }}
              />
              <Typography
                variant="subtitle1"
                sx={{ fontWeight: 600, flexGrow: 1, fontSize: '1.1rem' }}
              >
                {selectedNode.data.label}
              </Typography>
              <Chip
                label={selectedNode.data.nodeType}
                size="small"
                color={selectedNode.data.nodeType === 'supplier' ? 'success' : 'primary'}
                sx={{ fontWeight: 600 }}
              />
            </Box>

            <TextField
              label="Node Name"
              value={selectedNode.data.label}
              onChange={e => updateNodeData(selectedNode.id, { label: e.target.value })}
              onFocus={e => e.target.select()}
              fullWidth
              size="small"
              sx={{ mb: 2 }}
            />

            {selectedNode.data.nodeType === 'distributor' && (
              <>
                <Divider sx={{ my: 2 }} />
                <Typography
                  variant="caption"
                  sx={{ color: '#666', fontWeight: 600, display: 'block', mb: 1.5 }}
                >
                  INVENTORY SETTINGS
                </Typography>

                <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                  <TextField
                    label="Capacity (units)"
                    type="number"
                    value={selectedNode.data.capacity ?? ''}
                    onChange={e => {
                      const val = e.target.value;
                      if (val !== '') {
                        updateNodeData(selectedNode.id, { capacity: parseInt(val) || 0 });
                      }
                    }}
                    onBlur={e => {
                      if (e.target.value === '' || isNaN(parseInt(e.target.value))) {
                        updateNodeData(selectedNode.id, { capacity: 1000 });
                      }
                    }}
                    fullWidth
                    size="small"
                    helperText="Max storage"
                    InputLabelProps={{ shrink: true }}
                    inputProps={{ min: 0 }}
                  />
                  <TextField
                    label="Initial Level (units)"
                    type="number"
                    value={selectedNode.data.initial_level ?? ''}
                    onChange={e => {
                      const val = e.target.value;
                      if (val !== '') {
                        updateNodeData(selectedNode.id, { initial_level: parseInt(val) || 0 });
                      }
                    }}
                    onBlur={e => {
                      if (e.target.value === '' || isNaN(parseInt(e.target.value))) {
                        updateNodeData(selectedNode.id, { initial_level: 1000 });
                      }
                    }}
                    fullWidth
                    size="small"
                    helperText="Starting inventory"
                    InputLabelProps={{ shrink: true }}
                    inputProps={{ min: 0 }}
                  />
                </Stack>

                <TextField
                  label="Holding Cost ($/unit/day)"
                  type="number"
                  value={selectedNode.data.holding_cost ?? ''}
                  onChange={e => {
                    const val = e.target.value;
                    if (val !== '') {
                      updateNodeData(selectedNode.id, { holding_cost: parseFloat(val) || 0 });
                    }
                  }}
                  onBlur={e => {
                    if (e.target.value === '' || isNaN(parseFloat(e.target.value))) {
                      updateNodeData(selectedNode.id, { holding_cost: 0.22 });
                    }
                  }}
                  fullWidth
                  size="small"
                  inputProps={{ step: '0.01', min: 0 }}
                  sx={{ mb: 2 }}
                  InputLabelProps={{ shrink: true }}
                />

                <Divider sx={{ my: 2 }} />
                <Typography
                  variant="caption"
                  sx={{ color: '#666', fontWeight: 600, display: 'block', mb: 1.5 }}
                >
                  REPLENISHMENT POLICY
                </Typography>

                <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                  <InputLabel>Policy Type</InputLabel>
                  <Select
                    value={selectedNode.data.replenishment_policy ?? 'SS'}
                    label="Policy Type"
                    onChange={e =>
                      updateNodeData(selectedNode.id, { replenishment_policy: e.target.value })
                    }
                  >
                    <MenuItem value="SS">(s, S) - Continuous Review</MenuItem>
                    <MenuItem value="RQ">(R, Q) - Periodic Review</MenuItem>
                  </Select>
                </FormControl>

                {(selectedNode.data.replenishment_policy ?? 'SS') === 'SS' ? (
                  <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                    <TextField
                      label="s - Reorder Point"
                      type="number"
                      value={selectedNode.data.policy_s ?? ''}
                      onChange={e => {
                        const val = e.target.value;
                        if (val !== '') {
                          updateNodeData(selectedNode.id, { policy_s: parseInt(val) || 0 });
                        }
                      }}
                      onBlur={e => {
                        if (e.target.value === '' || isNaN(parseInt(e.target.value))) {
                          updateNodeData(selectedNode.id, { policy_s: 400 });
                        }
                      }}
                      fullWidth
                      size="small"
                      helperText="When to order"
                      InputLabelProps={{ shrink: true }}
                      inputProps={{ min: 0 }}
                    />
                    <TextField
                      label="S - Order-up-to Level"
                      type="number"
                      value={selectedNode.data.policy_S ?? ''}
                      onChange={e => {
                        const val = e.target.value;
                        if (val !== '') {
                          updateNodeData(selectedNode.id, { policy_S: parseInt(val) || 0 });
                        }
                      }}
                      onBlur={e => {
                        if (e.target.value === '' || isNaN(parseInt(e.target.value))) {
                          updateNodeData(selectedNode.id, { policy_S: 1000 });
                        }
                      }}
                      fullWidth
                      size="small"
                      helperText="Target level"
                      InputLabelProps={{ shrink: true }}
                      inputProps={{ min: 0 }}
                    />
                  </Stack>
                ) : (
                  <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                    <TextField
                      label="R - Review Period"
                      type="number"
                      value={selectedNode.data.policy_R ?? ''}
                      onChange={e => {
                        const val = e.target.value;
                        if (val !== '') {
                          updateNodeData(selectedNode.id, { policy_R: parseInt(val) || 0 });
                        }
                      }}
                      onBlur={e => {
                        if (e.target.value === '' || isNaN(parseInt(e.target.value))) {
                          updateNodeData(selectedNode.id, { policy_R: 1000 });
                        }
                      }}
                      fullWidth
                      size="small"
                      helperText="Days between orders"
                      InputLabelProps={{ shrink: true }}
                      inputProps={{ min: 0 }}
                    />
                    <TextField
                      label="Q - Order Quantity"
                      type="number"
                      value={selectedNode.data.policy_Q ?? ''}
                      onChange={e => {
                        const val = e.target.value;
                        if (val !== '') {
                          updateNodeData(selectedNode.id, { policy_Q: parseInt(val) || 0 });
                        }
                      }}
                      onBlur={e => {
                        if (e.target.value === '' || isNaN(parseInt(e.target.value))) {
                          updateNodeData(selectedNode.id, { policy_Q: 500 });
                        }
                      }}
                      fullWidth
                      size="small"
                      helperText="Fixed order qty"
                      InputLabelProps={{ shrink: true }}
                      inputProps={{ min: 0 }}
                    />
                  </Stack>
                )}

                <Divider sx={{ my: 2 }} />
                <Typography
                  variant="caption"
                  sx={{ color: '#666', fontWeight: 600, display: 'block', mb: 1.5 }}
                >
                  PRICING
                </Typography>

                <Stack direction="row" spacing={2}>
                  <TextField
                    label="Buy Price ($)"
                    type="number"
                    value={selectedNode.data.buy_price ?? ''}
                    onChange={e => {
                      const val = e.target.value;
                      if (val !== '') {
                        updateNodeData(selectedNode.id, { buy_price: parseFloat(val) || 0 });
                      }
                    }}
                    onBlur={e => {
                      if (e.target.value === '' || isNaN(parseFloat(e.target.value))) {
                        updateNodeData(selectedNode.id, { buy_price: 150 });
                      }
                    }}
                    fullWidth
                    size="small"
                    inputProps={{ step: '0.01', min: 0 }}
                    InputLabelProps={{ shrink: true }}
                  />
                  <TextField
                    label="Sell Price ($)"
                    type="number"
                    value={selectedNode.data.sell_price ?? ''}
                    onChange={e => {
                      const val = e.target.value;
                      if (val !== '') {
                        updateNodeData(selectedNode.id, { sell_price: parseFloat(val) || 0 });
                      }
                    }}
                    onBlur={e => {
                      if (e.target.value === '' || isNaN(parseFloat(e.target.value))) {
                        updateNodeData(selectedNode.id, { sell_price: 300 });
                      }
                    }}
                    fullWidth
                    size="small"
                    inputProps={{ step: '0.01', min: 0 }}
                    InputLabelProps={{ shrink: true }}
                  />
                </Stack>
              </>
            )}
          </Paper>
        )}

        {/* Demands Configuration */}
        {demands.length > 0 && (
          <>
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center', color: '#1976d2' }}
            >
              <LocalShippingIcon sx={{ mr: 1, fontSize: 22 }} />
              Customer Demands ({demands.length})
            </Typography>

            {demands.map(demand => (
              <Paper
                key={demand.id}
                elevation={2}
                sx={{ mb: 2, p: 2, borderRadius: 2, border: '1px solid #e0e0e0' }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, flexGrow: 1 }}>
                    {demand.name}
                  </Typography>
                  <IconButton size="small" onClick={() => deleteDemand(demand.id)} color="error">
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>

                <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                  <InputLabel>Target Node</InputLabel>
                  <Select
                    value={demand.target_node}
                    label="Target Node"
                    onChange={e => updateDemand(demand.id, { target_node: e.target.value })}
                  >
                    {nodes.map(node => (
                      <MenuItem key={node.id} value={node.id}>
                        {node.data.label} ({node.data.nodeType})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                  <TextField
                    label="Arrival Interval (days)"
                    type="number"
                    value={demand.arrival_interval ?? ''}
                    onChange={e => {
                      const val = e.target.value;
                      if (val !== '') {
                        updateDemand(demand.id, { arrival_interval: parseFloat(val) || 0 });
                      }
                    }}
                    onBlur={e => {
                      if (e.target.value === '' || isNaN(parseFloat(e.target.value))) {
                        updateDemand(demand.id, { arrival_interval: 1 });
                      }
                    }}
                    fullWidth
                    size="small"
                    inputProps={{ step: '0.1', min: 0 }}
                    helperText="Time between orders"
                    InputLabelProps={{ shrink: true }}
                  />
                  <TextField
                    label="Order Quantity (units)"
                    type="number"
                    value={demand.order_quantity ?? ''}
                    onChange={e => {
                      const val = e.target.value;
                      if (val !== '') {
                        updateDemand(demand.id, { order_quantity: parseInt(val) || 0 });
                      }
                    }}
                    onBlur={e => {
                      if (e.target.value === '' || isNaN(parseInt(e.target.value))) {
                        updateDemand(demand.id, { order_quantity: 400 });
                      }
                    }}
                    fullWidth
                    size="small"
                    helperText="Units per order"
                    InputLabelProps={{ shrink: true }}
                    inputProps={{ min: 0 }}
                  />
                </Stack>

                <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                  <TextField
                    label="Delivery Cost ($)"
                    type="number"
                    value={demand.delivery_cost ?? ''}
                    onChange={e => {
                      const val = e.target.value;
                      if (val !== '') {
                        updateDemand(demand.id, { delivery_cost: parseFloat(val) || 0 });
                      }
                    }}
                    onBlur={e => {
                      if (e.target.value === '' || isNaN(parseFloat(e.target.value))) {
                        updateDemand(demand.id, { delivery_cost: 10 });
                      }
                    }}
                    fullWidth
                    size="small"
                    inputProps={{ step: '0.01', min: 0 }}
                    InputLabelProps={{ shrink: true }}
                  />
                  <TextField
                    label="Lead Time (days)"
                    type="number"
                    value={demand.lead_time ?? ''}
                    onChange={e => {
                      const val = e.target.value;
                      if (val !== '') {
                        updateDemand(demand.id, { lead_time: parseFloat(val) || 0 });
                      }
                    }}
                    onBlur={e => {
                      if (e.target.value === '' || isNaN(parseFloat(e.target.value))) {
                        updateDemand(demand.id, { lead_time: 5 });
                      }
                    }}
                    fullWidth
                    size="small"
                    inputProps={{ step: '0.1', min: 0 }}
                    InputLabelProps={{ shrink: true }}
                  />
                </Stack>

                {/* Advanced Pattern Button */}
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => handleAdvancedEdit(demand)}
                  fullWidth
                  sx={{ textTransform: 'none', fontSize: '0.8rem', fontWeight: 600 }}
                >
                  🎯 Advanced Demand Pattern
                </Button>
              </Paper>
            ))}
          </>
        )}
      </Box>

      {/* Advanced Demand Dialog */}
      <AdvancedDemandDialog
        open={showAdvancedDemand}
        onClose={() => setShowAdvancedDemand(false)}
        onSave={handleSaveAdvanced}
        demand={editingDemand}
        nodes={nodes}
      />
    </Box>
  )
}

export default ConfigPanel
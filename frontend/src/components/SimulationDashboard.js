import React, { useState } from 'react'
import {
  Box,
  Paper,
  Typography,
  Grid,
  IconButton,
  Collapse,
  Divider,
  Stack,
  Chip,
  Tabs,
  Tab,
  useTheme,
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import DownloadIcon from '@mui/icons-material/Download'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import AttachMoneyIcon from '@mui/icons-material/AttachMoney'
import InventoryIcon from '@mui/icons-material/Inventory'
import WarningAmberIcon from '@mui/icons-material/WarningAmber'
import AccountBalanceIcon from '@mui/icons-material/AccountBalance'
import LocalShippingIcon from '@mui/icons-material/LocalShipping'
import StorefrontIcon from '@mui/icons-material/Storefront'
import ShowChartIcon from '@mui/icons-material/ShowChart'
import AssessmentIcon from '@mui/icons-material/Assessment'
import InsightsPanel from './InsightsPanel'
import LightbulbIcon from '@mui/icons-material/Lightbulb'
import { generatePDFReport, downloadPDF } from '../utils/pdfGenerator'
import { generateInsights } from '../utils/insightsEngine'
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

function SimulationDashboard({ results, nodes, edges, demands, simTime, onClose, onExport }) {
  const theme = useTheme()
  const [expanded, setExpanded] = useState(true)
  const [tabValue, setTabValue] = useState(0)

  if (!results || !results.success) {
    return null
  }

  const { metrics, inventory_data } = results

  const chartData = {}
  if (inventory_data) {
    Object.keys(inventory_data).forEach(nodeId => {
      const data = inventory_data[nodeId]
      const nodeName = nodes.find(n => n.id === nodeId)?.data.label || nodeId

      if (data && data.time && data.level) {
        chartData[nodeId] = data.time.map((t, idx) => ({
          time: Math.round(t),
          [nodeName]: data.level[idx],
        }))
      }
    })
  }
  const handleExportPDF = () => {
    try {
      // Validate required data
      if (!results || !nodes || !edges || !demands) {
        alert('Missing required data for PDF generation')
        return
      }

      // Generate insights
      const insights = generateInsights(results, nodes, edges, demands)

      // Create network config object
      const networkConfig = {
        nodes: nodes,
        links: edges,
        demands: demands,
        sim_time: simTime || 30, // Use actual simTime, fallback to 30
      }

      // Generate PDF
      const doc = generatePDFReport(results, networkConfig, insights)

      // Download
      downloadPDF(doc, 'supply-chain-simulation-report')
    } catch (error) {
      console.error('PDF Generation Error:', error)
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        results: results ? 'present' : 'missing',
        nodes: nodes ? `${nodes.length} nodes` : 'missing',
        edges: edges ? `${edges.length} edges` : 'missing',
        demands: demands ? `${demands.length} demands` : 'missing',
      })
      alert(`Failed to generate PDF: ${error.message}`)
    }
  }

  const MetricCard = ({ icon, title, value, subtitle, color }) => (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        height: '100%',
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
        transition: 'all 0.3s ease',
        '&:hover': {
          boxShadow:
            theme.palette.mode === 'light'
              ? '0 4px 12px rgba(0,0,0,0.1)'
              : '0 4px 12px rgba(0,0,0,0.4)',
          transform: 'translateY(-2px)',
        },
      }}
    >
      <Stack direction="row" spacing={2} alignItems="center">
        <Box
          sx={{
            bgcolor: color,
            p: 1.5,
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {icon}
        </Box>
        <Box sx={{ flex: 1 }}>
          <Typography
            variant="caption"
            sx={{ color: 'text.secondary', fontWeight: 500, display: 'block', mb: 0.5 }}
          >
            {title}
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary', mb: 0.3 }}>
            {value}
          </Typography>
          {subtitle && (
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {subtitle}
            </Typography>
          )}
        </Box>
      </Stack>
    </Paper>
  )

  const MetricRow = ({ icon, label, value, color }) => (
    <Stack
      direction="row"
      spacing={2}
      alignItems="center"
      sx={{ py: 1.5, px: 2, borderRadius: 1, '&:hover': { bgcolor: 'action.hover' } }}
    >
      <Box sx={{ color: color || 'text.secondary' }}>{icon}</Box>
      <Typography variant="body2" sx={{ flex: 1, fontWeight: 500, color: 'text.primary' }}>
        {label}
      </Typography>
      <Typography
        variant="body2"
        sx={{ fontWeight: 700, color: 'primary.main', minWidth: '80px', textAlign: 'right' }}
      >
        {value}
      </Typography>
    </Stack>
  )

  return (
    <Paper
      elevation={8}
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        maxHeight: expanded ? '65vh' : '56px',
        transition: 'max-height 0.3s ease',
        overflow: 'hidden',
        zIndex: 1000,
        borderTop: `3px solid ${theme.palette.primary.main}`,
        bgcolor: 'background.paper',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 2,
          py: 1.5,
          background:
            theme.palette.mode === 'light'
              ? 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)'
              : 'linear-gradient(135deg, #818cf8 0%, #6366f1 100%)',
          color: 'white',
          cursor: 'pointer',
        }}
        onClick={() => setExpanded(!expanded)}
      >
        <Stack direction="row" spacing={2} alignItems="center">
          <ShowChartIcon />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Simulation Results
          </Typography>
          <Chip
            label={`${Object.keys(chartData).length} Nodes Analyzed`}
            size="small"
            sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', fontWeight: 600 }}
          />
        </Stack>
        <Box>
          <IconButton
            size="small"
            sx={{ color: 'white', mr: 1 }}
            onClick={e => {
              e.stopPropagation()
              handleExportPDF()
            }}
            title="Export as PDF"
          >
            <PictureAsPdfIcon />
          </IconButton>
          <IconButton
            size="small"
            sx={{ color: 'white', mr: 1 }}
            onClick={e => {
              e.stopPropagation()
              onExport()
            }}
            title="Export as CSV"
          >
            <DownloadIcon />
          </IconButton>
          <IconButton
            size="small"
            sx={{ color: 'white', mr: 1 }}
            onClick={e => {
              e.stopPropagation()
              setExpanded(!expanded)
            }}
          >
            {expanded ? <ExpandMoreIcon /> : <ExpandLessIcon />}
          </IconButton>
          <IconButton
            size="small"
            sx={{ color: 'white' }}
            onClick={e => {
              e.stopPropagation()
              onClose()
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </Box>

      <Collapse in={expanded}>
        <Box
          sx={{ maxHeight: 'calc(65vh - 56px)', overflow: 'auto', bgcolor: 'background.default' }}
        >
          {/* Key Metrics - Equal spacing */}
          <Box sx={{ p: 3 }}>
            <Grid container spacing={3}>
              <Grid item xs={3}>
                <MetricCard
                  icon={<TrendingUpIcon sx={{ color: '#10b981', fontSize: 32 }} />}
                  title="Net Profit"
                  value={`$${metrics.profit?.toLocaleString()}`}
                  subtitle={`Revenue: $${metrics.revenue?.toLocaleString()}`}
                  color={theme.palette.mode === 'light' ? '#d1fae5' : 'rgba(16, 185, 129, 0.2)'}
                />
              </Grid>
              <Grid item xs={3}>
                <MetricCard
                  icon={<AttachMoneyIcon sx={{ color: '#3b82f6', fontSize: 32 }} />}
                  title="Total Cost"
                  value={`$${metrics.total_cost?.toFixed(0)}`}
                  subtitle={`Avg per item: $${metrics.avg_cost_per_item?.toFixed(2)}`}
                  color={theme.palette.mode === 'light' ? '#dbeafe' : 'rgba(59, 130, 246, 0.2)'}
                />
              </Grid>
              <Grid item xs={3}>
                <MetricCard
                  icon={<InventoryIcon sx={{ color: '#8b5cf6', fontSize: 32 }} />}
                  title="Inventory Level"
                  value={metrics.available_inv}
                  subtitle={`Avg: ${metrics.avg_available_inv?.toFixed(0)} units`}
                  color={theme.palette.mode === 'light' ? '#ede9fe' : 'rgba(139, 92, 246, 0.2)'}
                />
              </Grid>
              <Grid item xs={3}>
                <MetricCard
                  icon={<WarningAmberIcon sx={{ color: '#f59e0b', fontSize: 32 }} />}
                  title="Shortage"
                  value={metrics.shortage?.[1] || 0}
                  subtitle={`${metrics.shortage?.[0] || 0} unfulfilled orders`}
                  color={theme.palette.mode === 'light' ? '#fef3c7' : 'rgba(245, 158, 11, 0.2)'}
                />
              </Grid>
            </Grid>
          </Box>

          {/* Tabs */}
          {/* Tabs */}
          <Box sx={{ bgcolor: 'background.paper', borderBottom: 1, borderColor: 'divider', px: 2 }}>
            <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
              <Tab
                icon={<ShowChartIcon />}
                iconPosition="start"
                label="Inventory Charts"
                sx={{ textTransform: 'none', fontWeight: 600 }}
              />
              <Tab
                icon={<AccountBalanceIcon />}
                iconPosition="start"
                label="Financial"
                sx={{ textTransform: 'none', fontWeight: 600 }}
              />
              <Tab
                icon={<AssessmentIcon />}
                iconPosition="start"
                label="Inventory & Demand"
                sx={{ textTransform: 'none', fontWeight: 600 }}
              />
              <Tab
                icon={<StorefrontIcon />}
                iconPosition="start"
                label="Network"
                sx={{ textTransform: 'none', fontWeight: 600 }}
              />
              <Tab
                icon={<LightbulbIcon />}
                iconPosition="start"
                label="Insights"
                sx={{ textTransform: 'none', fontWeight: 600 }}
              />
            </Tabs>
          </Box>

          {/* Tab Content */}
          <Box sx={{ p: 2 }}>
            {/* Tab 0: Charts */}
            {tabValue === 0 && (
              <Box>
                {Object.keys(chartData).length > 0 ? (
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 2,
                      bgcolor: 'background.paper',
                    }}
                  >
                    {Object.keys(chartData).map((nodeId, index) => {
                      const nodeName = nodes.find(n => n.id === nodeId)?.data.label || nodeId
                      return (
                        <Box
                          key={nodeId}
                          sx={{ mb: index < Object.keys(chartData).length - 1 ? 3 : 0 }}
                        >
                          <Chip label={nodeName} size="small" color="primary" sx={{ mb: 1 }} />
                          <ResponsiveContainer width="100%" height={180}>
                            <LineChart data={chartData[nodeId]}>
                              <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                              <XAxis
                                dataKey="time"
                                tick={{ fontSize: 11, fill: theme.palette.text.secondary }}
                                label={{
                                  value: 'Days',
                                  position: 'insideBottom',
                                  offset: -5,
                                  style: { fontSize: 12, fill: theme.palette.text.secondary },
                                }}
                              />
                              <YAxis
                                tick={{ fontSize: 11, fill: theme.palette.text.secondary }}
                                label={{
                                  value: 'Units',
                                  angle: -90,
                                  position: 'insideLeft',
                                  style: { fontSize: 12, fill: theme.palette.text.secondary },
                                }}
                              />
                              <Tooltip
                                contentStyle={{
                                  backgroundColor: theme.palette.background.paper,
                                  border: `1px solid ${theme.palette.divider}`,
                                  borderRadius: '8px',
                                }}
                              />
                              <Legend wrapperStyle={{ fontSize: 12 }} />
                              <Line
                                type="monotone"
                                dataKey={nodeName}
                                stroke={theme.palette.primary.main}
                                strokeWidth={2}
                                dot={false}
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </Box>
                      )
                    })}
                  </Paper>
                ) : (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ textAlign: 'center', py: 4 }}
                  >
                    No inventory data available
                  </Typography>
                )}
              </Box>
            )}

            {/* Tab 1: Financial */}
            {tabValue === 1 && (
              <Paper
                elevation={0}
                sx={{
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 2,
                  bgcolor: 'background.paper',
                }}
              >
                <Box
                  sx={{
                    p: 2,
                    bgcolor: 'action.hover',
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                  }}
                >
                  <Stack direction="row" spacing={1} alignItems="center">
                    <AccountBalanceIcon sx={{ color: 'primary.main', fontSize: 20 }} />
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary' }}>
                      Financial Metrics
                    </Typography>
                  </Stack>
                </Box>
                <Box>
                  <MetricRow
                    icon={<TrendingUpIcon fontSize="small" />}
                    label="Profit"
                    value={`$${metrics.profit?.toLocaleString()}`}
                    color="#10b981"
                  />
                  <Divider />
                  <MetricRow
                    icon={<AttachMoneyIcon fontSize="small" />}
                    label="Revenue"
                    value={`$${metrics.revenue?.toLocaleString()}`}
                    color="#3b82f6"
                  />
                  <Divider />
                  <MetricRow
                    icon={<AttachMoneyIcon fontSize="small" />}
                    label="Total Cost"
                    value={`$${metrics.total_cost?.toFixed(2)}`}
                    color="#ef4444"
                  />
                  <Divider />
                  <MetricRow
                    icon={<InventoryIcon fontSize="small" />}
                    label="Inventory Carry Cost"
                    value={`$${metrics.inventory_carry_cost?.toFixed(2)}`}
                    color="#8b5cf6"
                  />
                  <Divider />
                  <MetricRow
                    icon={<LocalShippingIcon fontSize="small" />}
                    label="Transportation Cost"
                    value={`$${metrics.transportation_cost?.toFixed(2)}`}
                    color="#f59e0b"
                  />
                  <Divider />
                  <MetricRow
                    icon={<StorefrontIcon fontSize="small" />}
                    label="Inventory Spend Cost"
                    value={`$${metrics.inventory_spend_cost?.toFixed(2)}`}
                    color="#06b6d4"
                  />
                  <Divider />
                  <MetricRow
                    icon={<AttachMoneyIcon fontSize="small" />}
                    label="Avg Cost per Order"
                    value={`$${metrics.avg_cost_per_order?.toFixed(2)}`}
                    color="#ec4899"
                  />
                  <Divider />
                  <MetricRow
                    icon={<AttachMoneyIcon fontSize="small" />}
                    label="Avg Cost per Item"
                    value={`$${metrics.avg_cost_per_item?.toFixed(4)}`}
                    color="#84cc16"
                  />
                </Box>
              </Paper>
            )}

            {/* Tab 2: Inventory & Demand */}
            {tabValue === 2 && (
              <Paper
                elevation={0}
                sx={{
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 2,
                  bgcolor: 'background.paper',
                }}
              >
                <Box
                  sx={{
                    p: 2,
                    bgcolor: 'action.hover',
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                  }}
                >
                  <Stack direction="row" spacing={1} alignItems="center">
                    <AssessmentIcon sx={{ color: 'primary.main', fontSize: 20 }} />
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary' }}>
                      Inventory & Demand Metrics
                    </Typography>
                  </Stack>
                </Box>
                <Box>
                  <MetricRow
                    icon={<InventoryIcon fontSize="small" />}
                    label="Available Inventory"
                    value={`${metrics.available_inv} units`}
                    color="#10b981"
                  />
                  <Divider />
                  <MetricRow
                    icon={<InventoryIcon fontSize="small" />}
                    label="Avg Available Inventory"
                    value={`${metrics.avg_available_inv?.toFixed(0)} units`}
                    color="#3b82f6"
                  />
                  <Divider />
                  <MetricRow
                    icon={<LocalShippingIcon fontSize="small" />}
                    label="Total Demand (Orders)"
                    value={`${metrics.total_demand?.[0] || 0}`}
                    color="#8b5cf6"
                  />
                  <Divider />
                  <MetricRow
                    icon={<LocalShippingIcon fontSize="small" />}
                    label="Total Demand (Units)"
                    value={`${metrics.total_demand?.[1] || 0}`}
                    color="#f59e0b"
                  />
                  <Divider />
                  <MetricRow
                    icon={<StorefrontIcon fontSize="small" />}
                    label="Customer Demand (Orders)"
                    value={`${metrics.demand_by_customers?.[0] || 0}`}
                    color="#06b6d4"
                  />
                  <Divider />
                  <MetricRow
                    icon={<StorefrontIcon fontSize="small" />}
                    label="Customer Demand (Units)"
                    value={`${metrics.demand_by_customers?.[1] || 0}`}
                    color="#ec4899"
                  />
                  <Divider />
                  <MetricRow
                    icon={<WarningAmberIcon fontSize="small" />}
                    label="Shortage (Orders)"
                    value={`${metrics.shortage?.[0] || 0}`}
                    color="#ef4444"
                  />
                  <Divider />
                  <MetricRow
                    icon={<WarningAmberIcon fontSize="small" />}
                    label="Shortage (Units)"
                    value={`${metrics.shortage?.[1] || 0}`}
                    color="#dc2626"
                  />
                  <Divider />
                  <MetricRow
                    icon={<LocalShippingIcon fontSize="small" />}
                    label="Backorders (Orders)"
                    value={`${metrics.backorders?.[0] || 0}`}
                    color="#f97316"
                  />
                  <Divider />
                  <MetricRow
                    icon={<LocalShippingIcon fontSize="small" />}
                    label="Backorders (Units)"
                    value={`${metrics.backorders?.[1] || 0}`}
                    color="#ea580c"
                  />
                </Box>
              </Paper>
            )}

            {/* Tab 3: Network */}
            {tabValue === 3 && (
              <Paper
                elevation={0}
                sx={{
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 2,
                  bgcolor: 'background.paper',
                }}
              >
                <Box
                  sx={{
                    p: 2,
                    bgcolor: 'action.hover',
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                  }}
                >
                  <Stack direction="row" spacing={1} alignItems="center">
                    <StorefrontIcon sx={{ color: 'primary.main', fontSize: 20 }} />
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary' }}>
                      Network Configuration
                    </Typography>
                  </Stack>
                </Box>
                <Box>
                  <MetricRow
                    icon={<StorefrontIcon fontSize="small" />}
                    label="Total Nodes"
                    value={metrics.num_of_nodes}
                    color="#10b981"
                  />
                  <Divider />
                  <MetricRow
                    icon={<LocalShippingIcon fontSize="small" />}
                    label="Total Links"
                    value={metrics.num_of_links}
                    color="#3b82f6"
                  />
                  <Divider />
                  <MetricRow
                    icon={<StorefrontIcon fontSize="small" />}
                    label="Suppliers"
                    value={metrics.num_suppliers}
                    color="#8b5cf6"
                  />
                  <Divider />
                  <MetricRow
                    icon={<StorefrontIcon fontSize="small" />}
                    label="Distributors"
                    value={metrics.num_distributors}
                    color="#f59e0b"
                  />
                  <Divider />
                  <MetricRow
                    icon={<StorefrontIcon fontSize="small" />}
                    label="Manufacturers"
                    value={metrics.num_manufacturers}
                    color="#06b6d4"
                  />
                  <Divider />
                  <MetricRow
                    icon={<StorefrontIcon fontSize="small" />}
                    label="Retailers"
                    value={metrics.num_retailers}
                    color="#ec4899"
                  />
                </Box>
              </Paper>
            )}

            {/* Tab 4: Insights */}
            {tabValue === 4 && (
              <InsightsPanel
                simulationResults={results}
                nodes={nodes}
                edges={edges}
                demands={demands}
              />
            )}
          </Box>
        </Box>
      </Collapse>
    </Paper>
  )
}

export default SimulationDashboard

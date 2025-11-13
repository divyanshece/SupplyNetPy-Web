import React, { useState, useCallback, useEffect, useMemo } from 'react'
import ReactFlow, {
  addEdge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
} from 'reactflow'
import 'reactflow/dist/style.css'
import { Box, Snackbar, Alert } from '@mui/material'
import { ThemeProvider, CssBaseline } from '@mui/material'
import { getTheme } from './theme/theme'
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import { supabase } from './supabaseClient'

// Components
import ActionToolbar from './components/ActionToolbar'
import ConfigPanel from './components/ConfigPanel'
import SimulationDashboard from './components/SimulationDashboard'
import ErrorBoundary from './components/ErrorBoundary'
import LoadingOverlay from './components/LoadingOverlay'
import ConfirmDialog from './components/ConfirmDialog'
import { validateNetwork } from './components/validationService'
import ValidationPanel from './components/ValidationPanel'
import AdvancedDemandDialog from './components/AdvancedDemandDialog'
import ProtectedRoute from './components/ProtectedRoute'
import SavedNetworksDialog from './components/SavedNetworksDialog'
import SaveIndicator from './components/SaveIndicator'
import WorkspaceStats from './components/WorkspaceStats'
import ScenarioComparison from './components/ScenarioComparison'

// Pages
import Login from './pages/Login'
import Signup from './pages/Signup'

// Validation
import { sanitizeNumber, sanitizeInteger } from './components/enhancedValidation'

function MainApp() {
  const navigate = useNavigate()
  const { user, signOut } = useAuth()

  // Theme
  const [themeMode, setThemeMode] = useState(() => {
    const savedMode = localStorage.getItem('themeMode')
    return savedMode || 'light'
  })

  const theme = useMemo(() => getTheme(themeMode), [themeMode])

  const toggleTheme = () => {
    setThemeMode(prevMode => {
      const newMode = prevMode === 'light' ? 'dark' : 'light'
      localStorage.setItem('themeMode', newMode)
      return newMode
    })
  }

  // ReactFlow state
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const [selectedNode, setSelectedNode] = useState(null)
  const [selectedEdge, setSelectedEdge] = useState(null)

  // Demands
  const [demands, setDemands] = useState([])

  // Simulation
  const [simulationResults, setSimulationResults] = useState(null)
  const [isSimulating, setIsSimulating] = useState(false)
  const [simTime, setSimTime] = useState(30)

  // Scenarios
  const [scenarios, setScenarios] = useState([])
  const [showComparison, setShowComparison] = useState(false)

  // Networks
  const [savedNetworks, setSavedNetworks] = useState([])
  const [showSavedNetworks, setShowSavedNetworks] = useState(false)
  const [currentNetworkId, setCurrentNetworkId] = useState(null)

  // UI State
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })
  const [isLoading, setIsLoading] = useState(false)
  const [loadingMessage, setLoadingMessage] = useState('')
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    title: '',
    message: '',
    onConfirm: null,
    severity: 'warning',
  })

  // Validation
  const [showValidation, setShowValidation] = useState(false)
  const [validationResults, setValidationResults] = useState(null)

  // Advanced Demand
  const [showAdvancedDemandDialog, setShowAdvancedDemandDialog] = useState(false)

  // Auto-save state
  const [saveStatus, setSaveStatus] = useState('saved')
  const [autoSaveTimeout, setAutoSaveTimeout] = useState(null)
  const [currentNetworkName, setCurrentNetworkName] = useState('Untitled Network')

  // Load user's networks on mount
  useEffect(() => {
    if (user) {
      loadUserNetworks()
    }
  }, [user])

  // Smart auto-save - triggers on any change
  useEffect(() => {
    if (!user) return

    // If we have a network loaded or nodes exist, trigger auto-save
    if (nodes.length > 0 || edges.length > 0 || demands.length > 0) {
      setSaveStatus('unsaved')

      // Clear existing timeout
      if (autoSaveTimeout) {
        clearTimeout(autoSaveTimeout)
      }

      // Set new timeout for 3 seconds
      const timeout = setTimeout(() => {
        performAutoSave()
      }, 3000)

      setAutoSaveTimeout(timeout)

      return () => clearTimeout(timeout)
    }
  }, [user, nodes, edges, demands])

  // Update edge colors when theme changes
  useEffect(() => {
    setEdges(eds =>
      eds.map(edge => ({
        ...edge,
        style: {
          ...edge.style,
          stroke: themeMode === 'light' ? '#4338ca' : '#818cf8',
        },
        labelStyle: {
          fill: themeMode === 'light' ? '#1a1d29' : '#f3f4f6',
          fontWeight: 600,
          fontSize: 12,
        },
        labelBgStyle: {
          fill: themeMode === 'light' ? '#ffffff' : '#1a1d29',
          fillOpacity: 0.9,
        },
      }))
    )
  }, [themeMode, setEdges])

  // Database Functions
  const loadUserNetworks = async () => {
    try {
      const { data, error } = await supabase
        .from('networks')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })

      if (error) throw error
      setSavedNetworks(data || [])
    } catch (error) {
      console.error('Error loading networks:', error)
    }
  }

  const performAutoSave = async () => {
    if (!user) return

    try {
      setSaveStatus('saving')

      const networkData = {
        name: currentNetworkName,
        nodes: nodes,
        edges: edges,
        demands: demands,
      }

      if (currentNetworkId) {
        // Update existing network
        const { error } = await supabase
          .from('networks')
          .update(networkData)
          .eq('id', currentNetworkId)

        if (error) throw error
      } else {
        // Create new network (first save)
        const { data, error } = await supabase
          .from('networks')
          .insert({
            user_id: user.id,
            ...networkData,
          })
          .select()
          .single()

        if (error) throw error
        setCurrentNetworkId(data.id)
        setCurrentNetworkName(data.name)
      }

      setSaveStatus('saved')

      // Reload networks list in background
      loadUserNetworks()
    } catch (error) {
      console.error('Auto-save error:', error)
      setSaveStatus('error')
      setTimeout(() => setSaveStatus('unsaved'), 3000)
    }
  }

  const saveNetworkAsNew = async () => {
    const name = prompt('Enter network name:', 'Copy of ' + currentNetworkName)
    if (!name) return

    try {
      setIsLoading(true)
      setLoadingMessage('Saving as new network...')

      const { data, error } = await supabase
        .from('networks')
        .insert({
          user_id: user.id,
          name,
          description: '',
          nodes: nodes,
          edges: edges,
          demands: demands,
        })
        .select()
        .single()

      if (error) throw error

      setCurrentNetworkId(data.id)
      setCurrentNetworkName(data.name)
      await loadUserNetworks()

      setSnackbar({
        open: true,
        message: `Saved as "${name}"`,
        severity: 'success',
      })
    } catch (error) {
      console.error('Error saving network:', error)
      setSnackbar({
        open: true,
        message: 'Failed to save network',
        severity: 'error',
      })
    } finally {
      setIsLoading(false)
      setLoadingMessage('')
    }
  }

  const loadNetworkFromDatabase = async networkId => {
    try {
      setIsLoading(true)
      setLoadingMessage('Loading network...')

      const { data, error } = await supabase
        .from('networks')
        .select('*')
        .eq('id', networkId)
        .single()

      if (error) throw error

      setNodes(data.nodes || [])
      setEdges(data.edges || [])
      setDemands(data.demands || [])
      setCurrentNetworkId(data.id)
      setCurrentNetworkName(data.name)
      setSaveStatus('saved')
      setShowSavedNetworks(false)

      setSnackbar({
        open: true,
        message: `Loaded: ${data.name}`,
        severity: 'success',
      })
    } catch (error) {
      console.error('Error loading network:', error)
      setSnackbar({
        open: true,
        message: 'Failed to load network',
        severity: 'error',
      })
    } finally {
      setIsLoading(false)
      setLoadingMessage('')
    }
  }

  const deleteNetworkFromDatabase = async networkId => {
    try {
      const { error } = await supabase.from('networks').delete().eq('id', networkId)

      if (error) throw error

      if (currentNetworkId === networkId) {
        setCurrentNetworkId(null)
        setNodes([])
        setEdges([])
        setDemands([])
      }

      await loadUserNetworks()

      setSnackbar({
        open: true,
        message: 'Network deleted',
        severity: 'success',
      })
    } catch (error) {
      console.error('Error deleting network:', error)
      setSnackbar({
        open: true,
        message: 'Failed to delete network',
        severity: 'error',
      })
    }
  }

  const renameNetwork = async (networkId, newName) => {
    try {
      const { error } = await supabase
        .from('networks')
        .update({ name: newName })
        .eq('id', networkId)

      if (error) throw error

      await loadUserNetworks()

      setSnackbar({
        open: true,
        message: 'Network renamed',
        severity: 'success',
      })
    } catch (error) {
      console.error('Error renaming network:', error)
      setSnackbar({
        open: true,
        message: 'Failed to rename network',
        severity: 'error',
      })
    }
  }

  // Node Functions
  const addNode = type => {
    const id = `${type}_${Date.now()}`
    const typeCount = nodes.filter(n => n.data.nodeType === type).length + 1
    const newNode = {
      id,
      type: 'default',
      data: {
        label: `${type.charAt(0).toUpperCase() + type.slice(1)} ${typeCount}`,
        nodeType: type,
        capacity: 1000,
        initial_level: 1000,
        holding_cost: 0.22,
        replenishment_policy: 'SS',
        policy_s: 400,
        policy_S: 1000,
        policy_R: 1000,
        policy_Q: 500,
        buy_price: 150,
        sell_price: 300,
      },
      position: {
        x: 150 + nodes.length * 50,
        y: 150 + (nodes.length % 3) * 100,
      },
      style: {
        background:
          type === 'supplier'
            ? themeMode === 'light'
              ? '#10b981'
              : '#34d399'
            : themeMode === 'light'
            ? '#3b82f6'
            : '#60a5fa',
        color: 'white',
        border: themeMode === 'light' ? '2px solid #1a1d29' : '2px solid #374151',
        borderRadius: '10px',
        padding: '12px',
        width: 160,
        fontSize: '13px',
        fontWeight: '600',
        boxShadow:
          themeMode === 'light' ? '0 4px 6px rgba(0, 0, 0, 0.1)' : '0 4px 6px rgba(0, 0, 0, 0.3)',
      },
    }
    setNodes(nds => [...nds, newNode])
    setSnackbar({
      open: true,
      message: `${type.charAt(0).toUpperCase() + type.slice(1)} ${typeCount} added!`,
      severity: 'success',
    })
  }

  const updateNodeData = (nodeId, newData) => {
    setNodes(nds =>
      nds.map(node => (node.id === nodeId ? { ...node, data: { ...node.data, ...newData } } : node))
    )
  }

  const deleteNode = nodeId => {
    const node = nodes.find(n => n.id === nodeId)
    const connectedEdges = edges.filter(e => e.source === nodeId || e.target === nodeId)
    const connectedDemands = demands.filter(d => d.target_node === nodeId)

    let message = `Are you sure you want to delete "${node?.data.label}"?`
    if (connectedEdges.length > 0) {
      message += ` This will also remove ${connectedEdges.length} connected link(s).`
    }
    if (connectedDemands.length > 0) {
      message += ` This will also remove ${connectedDemands.length} demand(s).`
    }

    setConfirmDialog({
      open: true,
      title: 'Delete Node?',
      message,
      severity: 'error',
      onConfirm: () => {
        setNodes(nds => nds.filter(n => n.id !== nodeId))
        setEdges(eds => eds.filter(e => e.source !== nodeId && e.target !== nodeId))
        setDemands(dems => dems.filter(d => d.target_node !== nodeId))
        if (selectedNode?.id === nodeId) setSelectedNode(null)
        setSnackbar({
          open: true,
          message: 'Node deleted successfully',
          severity: 'success',
        })
      },
    })
  }

  // Edge Functions
  const onConnect = useCallback(
    params => {
      const sourceNode = nodes.find(n => n.id === params.source)
      const targetNode = nodes.find(n => n.id === params.target)

      if (!sourceNode || !targetNode) return

      if (sourceNode.data.nodeType === 'supplier' && targetNode.data.nodeType === 'supplier') {
        setSnackbar({
          open: true,
          message: 'Cannot connect supplier to supplier!',
          severity: 'error',
        })
        return
      }

      if (targetNode.data.nodeType === 'supplier') {
        setSnackbar({
          open: true,
          message: 'Suppliers cannot be target nodes!',
          severity: 'error',
        })
        return
      }

      const newEdge = {
        ...params,
        animated: true,
        type: 'smoothstep',
        data: { cost: 10, lead_time: 5 },
        label: 'Cost: $10, LT: 5d',
        style: {
          stroke: themeMode === 'light' ? '#4338ca' : '#818cf8',
          strokeWidth: 2.5,
        },
        labelStyle: {
          fill: themeMode === 'light' ? '#1a1d29' : '#f3f4f6',
          fontWeight: 600,
          fontSize: 12,
        },
        labelBgStyle: {
          fill: themeMode === 'light' ? '#ffffff' : '#1a1d29',
          fillOpacity: 0.9,
        },
      }

      setEdges(eds => addEdge(newEdge, eds))
      setSnackbar({
        open: true,
        message: 'Connection created!',
        severity: 'success',
      })
    },
    [setEdges, nodes, themeMode]
  )

  const updateEdgeData = (edgeId, newData) => {
    setEdges(eds =>
      eds.map(edge => {
        if (edge.id === edgeId) {
          const updatedData = { ...edge.data, ...newData }
          return {
            ...edge,
            data: updatedData,
            label: `Cost: $${updatedData.cost}, LT: ${updatedData.lead_time}d`,
          }
        }
        return edge
      })
    )
  }

  // Demand Functions
  const addDemand = () => {
    const demandCount = demands.length + 1
    const targetNode = nodes.find(n => n.data.nodeType === 'distributor') || nodes[0]

    if (!targetNode) {
      setSnackbar({
        open: true,
        message: 'Please add at least one node first!',
        severity: 'warning',
      })
      return
    }

    const newDemand = {
      id: `demand_${Date.now()}`,
      name: `Demand ${demandCount}`,
      target_node: targetNode.id,
      arrival_interval: 1,
      order_quantity: 400,
      delivery_cost: 10,
      lead_time: 5,
    }

    setDemands([...demands, newDemand])
    setSnackbar({
      open: true,
      message: `Demand ${demandCount} added!`,
      severity: 'success',
    })
  }

  const updateDemand = (demandId, newData) => {
    setDemands(dems =>
      dems.map(demand => (demand.id === demandId ? { ...demand, ...newData } : demand))
    )
  }

  const deleteDemand = demandId => {
    setDemands(dems => dems.filter(d => d.id !== demandId))
    setSnackbar({
      open: true,
      message: 'Demand deleted',
      severity: 'info',
    })
  }

  // Simulation
  const runSimulation = async () => {
    try {
      const validation = validateNetwork(nodes, edges, demands)

      if (!validation.isValid) {
        setValidationResults(validation)
        setShowValidation(true)
        setSnackbar({
          open: true,
          message: 'Please fix errors before running simulation',
          severity: 'error',
        })
        return
      }

      setIsLoading(true)
      setLoadingMessage('Running simulation...')
      setIsSimulating(true)

      const networkConfig = {
        nodes: nodes.map(node => ({
          id: node.id,
          name: node.data.label,
          type: node.data.nodeType,
          capacity: node.data.capacity || 1000,
          initial_level: node.data.initial_level || 1000,
          holding_cost: node.data.holding_cost || 0.22,
          replenishment_policy: node.data.replenishment_policy || 'SS',
          policy_s: node.data.policy_s || 400,
          policy_S: node.data.policy_S || 1000,
          policy_R: node.data.policy_R || 1000,
          policy_Q: node.data.policy_Q || 500,
          buy_price: node.data.buy_price || 150,
          sell_price: node.data.sell_price || 300,
          position: {
            x: node.position.x,
            y: node.position.y,
          },
        })),
        links: edges.map(edge => ({
          id: edge.id,
          source: edge.source,
          target: edge.target,
          cost: edge.data?.cost || 10,
          lead_time: edge.data?.lead_time || 5,
        })),
        demands: demands.map(demand => ({
          id: demand.id,
          name: demand.name,
          target_node: demand.target_node,
          arrival_interval: demand.arrival_interval || 1,
          order_quantity: demand.order_quantity || 400,
          delivery_cost: demand.delivery_cost || 10,
          lead_time: demand.lead_time || 5,
        })),
        sim_time: simTime || 30,
      }

      const response = await fetch('http://localhost:8000/api/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(networkConfig),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.detail || errorData.error || `Server error: ${response.status}`)
      }

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Simulation failed')
      }

      setSimulationResults(data)

      // Save results to database
      if (currentNetworkId) {
        await supabase.from('simulation_results').insert({
          network_id: currentNetworkId,
          user_id: user.id,
          sim_time: simTime,
          metrics: data.metrics,
          inventory_data: data.inventory_data,
        })
      }

      setSnackbar({
        open: true,
        message: 'Simulation completed successfully!',
        severity: 'success',
      })
    } catch (error) {
      console.error('Simulation error:', error)
      setSnackbar({
        open: true,
        message: error.message || 'Simulation failed. Please check your configuration.',
        severity: 'error',
      })
    } finally {
      setIsLoading(false)
      setIsSimulating(false)
      setLoadingMessage('')
    }
  }

  const runValidation = () => {
    const results = validateNetwork(nodes, edges, demands)
    setValidationResults(results)
    setShowValidation(true)
  }

  // File operations
  const saveConfiguration = () => {
    const config = { nodes, edges, demands }
    const blob = new Blob([JSON.stringify(config, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `supplynet-config-${Date.now()}.json`
    a.click()
    setSnackbar({
      open: true,
      message: 'Configuration exported!',
      severity: 'success',
    })
  }

  const loadConfiguration = event => {
    const file = event.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = e => {
      try {
        const config = JSON.parse(e.target.result)
        setNodes(config.nodes || [])
        setEdges(config.edges || [])
        setDemands(config.demands || [])
        setSnackbar({
          open: true,
          message: 'Configuration imported!',
          severity: 'success',
        })
      } catch (error) {
        setSnackbar({
          open: true,
          message: 'Failed to import configuration',
          severity: 'error',
        })
      }
    }
    reader.readAsText(file)
    event.target.value = ''
  }

  const clearAll = () => {
    setConfirmDialog({
      open: true,
      title: 'Create New Network?',
      message: 'This will clear the current workspace. Your current network is auto-saved.',
      severity: 'warning',
      onConfirm: () => {
        setNodes([])
        setEdges([])
        setDemands([])
        setSelectedNode(null)
        setSelectedEdge(null)
        setSimulationResults(null)
        setCurrentNetworkId(null)
        setCurrentNetworkName('Untitled Network')
        setSaveStatus('unsaved')
        setSnackbar({
          open: true,
          message: 'New workspace created',
          severity: 'info',
        })
      },
    })
  }

  const createNewNetwork = () => {
    setConfirmDialog({
      open: true,
      title: 'Create New Network?',
      message: 'Your current work will be saved. Start a new network?',
      severity: 'info',
      onConfirm: () => {
        setNodes([])
        setEdges([])
        setDemands([])
        setSelectedNode(null)
        setSelectedEdge(null)
        setSimulationResults(null)
        setCurrentNetworkId(null)
        setCurrentNetworkName('Untitled Network')
        setSaveStatus('unsaved')
      },
    })
  }

  const renameCurrentNetwork = async () => {
    const newName = prompt('Enter network name:', currentNetworkName)
    if (!newName || newName === currentNetworkName) return

    setCurrentNetworkName(newName)

    if (currentNetworkId) {
      try {
        await supabase.from('networks').update({ name: newName }).eq('id', currentNetworkId)

        await loadUserNetworks()

        setSnackbar({
          open: true,
          message: 'Network renamed',
          severity: 'success',
        })
      } catch (error) {
        console.error('Error renaming:', error)
      }
    }
  }

  const handleLogout = async () => {
    setConfirmDialog({
      open: true,
      title: 'Logout?',
      message: 'Are you sure you want to logout? Unsaved changes will be lost.',
      severity: 'warning',
      onConfirm: async () => {
        await signOut()
        navigate('/login')
      },
    })
  }

  // Event Handlers
  const onNodeClick = useCallback((event, node) => {
    setSelectedNode(node)
    setSelectedEdge(null)
  }, [])

  const onEdgeClick = useCallback((event, edge) => {
    setSelectedEdge(edge)
    setSelectedNode(null)
  }, [])

  const exportResults = () => {
    if (!simulationResults) return

    const csvContent = [
      ['Metric', 'Value'],
      ['Profit', simulationResults.metrics.profit],
      ['Revenue', simulationResults.metrics.revenue],
      ['Total Cost', simulationResults.metrics.total_cost],
      ['Available Inventory', simulationResults.metrics.available_inv],
      ['Shortage (Orders)', simulationResults.metrics.shortage?.[0]],
      ['Shortage (Units)', simulationResults.metrics.shortage?.[1]],
    ]
      .map(row => row.join(','))
      .join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `simulation-results-${Date.now()}.csv`
    a.click()

    setSnackbar({
      open: true,
      message: 'Results exported to CSV!',
      severity: 'success',
    })
  }

  const saveAsScenario = () => {
    if (!simulationResults) return

    const scenarioName = prompt('Enter scenario name:')
    if (!scenarioName) return

    const newScenario = {
      id: `scenario_${Date.now()}`,
      name: scenarioName,
      metrics: simulationResults.metrics,
      timestamp: new Date().toISOString(),
    }

    setScenarios([...scenarios, newScenario])
    setSnackbar({
      open: true,
      message: `Scenario "${scenarioName}" saved!`,
      severity: 'success',
    })
  }

  const toggleComparisonView = () => {
    if (scenarios.length < 2) {
      setSnackbar({
        open: true,
        message: 'Save at least 2 scenarios to compare',
        severity: 'warning',
      })
      return
    }
    setShowComparison(!showComparison)
  }

  // Get fresh node data for ConfigPanel
  const freshSelectedNode = useMemo(() => {
    if (!selectedNode) return null
    return nodes.find(n => n.id === selectedNode.id) || null
  }, [selectedNode?.id, nodes])

  return (
    <ErrorBoundary>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {isLoading && <LoadingOverlay message={loadingMessage} />}

        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            height: '100vh',
            bgcolor: 'background.default',
            transition: 'background-color 0.3s ease',
          }}
        >
          <ActionToolbar
            onAddNode={addNode}
            onAddDemand={addDemand}
            onSaveConfig={saveConfiguration}
            onLoadConfig={() => document.querySelector('input[type="file"]').click()}
            onViewNetworks={() => setShowSavedNetworks(true)}
            onSaveScenario={saveAsScenario}
            onCompareScenarios={toggleComparisonView}
            onRunSimulation={runSimulation}
            onClearAll={clearAll}
            onValidate={runValidation}
            simTime={simTime}
            onSimTimeChange={setSimTime}
            onNewNetwork={createNewNetwork}
            onRenameNetwork={renameCurrentNetwork}
            onSaveAsNew={saveNetworkAsNew}
            isSimulating={isSimulating}
            hasResults={simulationResults !== null}
            stats={{
              nodes: nodes.length,
              links: edges.length,
              demands: demands.length,
              savedNetworks: savedNetworks.length,
              scenarios: scenarios.length,
            }}
            onMenuClick={action => {
              if (action === 'logout') handleLogout()
              else if (action === 'settings') console.log('Settings clicked')
              else if (action === 'help') console.log('Help clicked')
              else if (action === 'about') console.log('About clicked')
            }}
            themeMode={themeMode}
            onThemeToggle={toggleTheme}
            user={user}
          />

          {/* Hidden file input */}
          <input
            type="file"
            hidden
            accept=".json"
            onChange={loadConfiguration}
            style={{ display: 'none' }}
          />

          <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
            <Box
              sx={{
                flex: 3,
                position: 'relative',
                background:
                  themeMode === 'light'
                    ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                    : 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
                transition: 'background 0.3s ease',
              }}
            >
              {/* Floating Stats */}
              <WorkspaceStats
                stats={{
                  nodes: nodes.length,
                  links: edges.length,
                  demands: demands.length,
                }}
              />

              <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onNodeClick={onNodeClick}
                onEdgeClick={onEdgeClick}
                fitView
                style={{
                  background: 'transparent',
                }}
              >
                <Controls
                  style={{
                    button: {
                      backgroundColor: themeMode === 'light' ? 'white' : '#1a1d29',
                      color: themeMode === 'light' ? '#1a1d29' : 'white',
                      borderBottom: `1px solid ${themeMode === 'light' ? '#e5e7eb' : '#2d3142'}`,
                    },
                  }}
                />
                <MiniMap
                  nodeColor={node => (node.data.nodeType === 'supplier' ? '#4CAF50' : '#2196F3')}
                  maskColor={themeMode === 'light' ? 'rgba(0, 0, 0, 0.1)' : 'rgba(0, 0, 0, 0.4)'}
                  style={{
                    backgroundColor: themeMode === 'light' ? 'white' : '#1a1d29',
                    border: `1px solid ${themeMode === 'light' ? '#e5e7eb' : '#2d3142'}`,
                  }}
                />
                <Background
                  variant="dots"
                  gap={16}
                  size={1}
                  color={themeMode === 'light' ? '#ffffff33' : '#ffffff11'}
                />
              </ReactFlow>
            </Box>

            <Box
              sx={{
                flex: 1,
                borderLeft: `2px solid`,
                borderColor: 'divider',
                overflow: 'auto',
                bgcolor: 'background.paper',
                boxShadow: '-4px 0 20px rgba(0,0,0,0.1)',
                transition: 'all 0.3s ease',
              }}
            >
              <ConfigPanel
                selectedNode={freshSelectedNode}
                updateNodeData={updateNodeData}
                selectedEdge={selectedEdge}
                updateEdgeData={updateEdgeData}
                demands={demands}
                updateDemand={updateDemand}
                deleteDemand={deleteDemand}
                nodes={nodes}
                currentNetworkName={currentNetworkName}
                saveStatus={saveStatus}
                onRenameNetwork={renameCurrentNetwork}
              />
            </Box>
          </Box>

          {simulationResults && (
            <SimulationDashboard
              results={simulationResults}
              nodes={nodes}
              edges={edges}
              demands={demands}
              simTime={simTime}
              onClose={() => setSimulationResults(null)}
              onExport={exportResults}
            />
          )}

          {showComparison && (
            <ScenarioComparison
              scenarios={scenarios}
              onClose={() => setShowComparison(false)}
              onDelete={scenarioId => {
                setScenarios(scenarios.filter(s => s.id !== scenarioId))
                setSnackbar({
                  open: true,
                  message: 'Scenario deleted',
                  severity: 'success',
                })
              }}
            />
          )}

          {showValidation && validationResults && (
            <ValidationPanel
              validation={validationResults}
              onClose={() => setShowValidation(false)}
            />
          )}

          <SavedNetworksDialog
            open={showSavedNetworks}
            onClose={() => setShowSavedNetworks(false)}
            networks={savedNetworks}
            onLoad={loadNetworkFromDatabase}
            onDelete={deleteNetworkFromDatabase}
            onRename={renameNetwork}
          />

          <ConfirmDialog
            open={confirmDialog.open}
            onClose={() => setConfirmDialog({ ...confirmDialog, open: false })}
            onConfirm={confirmDialog.onConfirm}
            title={confirmDialog.title}
            message={confirmDialog.message}
            severity={confirmDialog.severity}
          />

          <Snackbar
            open={snackbar.open}
            autoHideDuration={4000}
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          >
            <Alert
              onClose={() => setSnackbar({ ...snackbar, open: false })}
              severity={snackbar.severity}
              sx={{ width: '100%' }}
            >
              {snackbar.message}
            </Alert>
          </Snackbar>
        </Box>
      </ThemeProvider>
    </ErrorBoundary>
  )
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <MainApp />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App

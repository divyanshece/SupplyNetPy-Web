import React, { useState, useCallback } from "react";
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
} from "reactflow";
import "reactflow/dist/style.css";
import "./App.css";
import ConfigPanel from "./components/ConfigPanel";
import SimulationDashboard from "./components/SimulationDashboard";
import ScenarioComparison from "./components/ScenarioComparison";
import SavedNetworks from "./components/SavedNetworks";
import FolderIcon from "@mui/icons-material/Folder";
import ActionToolbar from "./components/ActionToolbar";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { getTheme } from "./theme/theme";
import {
  Button,
  Box,
  AppBar,
  Toolbar,
  Typography,
  Alert,
  Snackbar,
  IconButton,
  Tooltip,
  Chip,
  Stack,
} from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import AddIcon from "@mui/icons-material/Add";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import SaveIcon from "@mui/icons-material/Save";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import CompareArrowsIcon from "@mui/icons-material/CompareArrows";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField as MuiTextField,
} from "@mui/material";

function App() {
  const [themeMode, setThemeMode] = useState(() => {
    const savedMode = localStorage.getItem("themeMode");
    return savedMode || "light";
  });
  const toggleTheme = () => {
    setThemeMode((prevMode) => {
      const newMode = prevMode === "light" ? "dark" : "light";
      localStorage.setItem("themeMode", newMode);
      return newMode;
    });
  };
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [simulationResults, setSimulationResults] = useState(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [demands, setDemands] = useState([]);
  const [savedNetworks, setSavedNetworks] = useState([]);
  const [showSavedNetworks, setShowSavedNetworks] = useState(false);
  const [showSaveNetworkDialog, setShowSaveNetworkDialog] = useState(false);
  const [currentNetworkName, setCurrentNetworkName] = useState("");
  const [currentNetworkDescription, setCurrentNetworkDescription] =
    useState("");
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info",
  });
  const [simTime, setSimTime] = useState(31);
  const [selectedEdge, setSelectedEdge] = useState(null);
  const [scenarios, setScenarios] = useState([]);
  const [currentScenarioName, setCurrentScenarioName] = useState("");
  const [showScenarioDialog, setShowScenarioDialog] = useState(false);
  const [showComparisonView, setShowComparisonView] = useState(false);

  const onConnect = useCallback(
    (params) => {
      const sourceNode = nodes.find((n) => n.id === params.source);
      const targetNode = nodes.find((n) => n.id === params.target);

      if (!sourceNode || !targetNode) return;

      if (
        sourceNode.data.nodeType === "supplier" &&
        targetNode.data.nodeType === "supplier"
      ) {
        setSnackbar({
          open: true,
          message: "Cannot connect supplier to supplier!",
          severity: "error",
        });
        return;
      }

      if (targetNode.data.nodeType === "supplier") {
        setSnackbar({
          open: true,
          message: "Suppliers cannot be target nodes!",
          severity: "error",
        });
        return;
      }

      const newEdge = {
        ...params,
        animated: true,
        type: "smoothstep",
        data: { cost: 10, lead_time: 5 },
        label: "Cost: $10, LT: 5d",
        style: { stroke: "#1976d2", strokeWidth: 2 },
      };

      setEdges((eds) => addEdge(newEdge, eds));
      setSnackbar({
        open: true,
        message: "Connection created!",
        severity: "success",
      });
    },
    [setEdges, nodes]
  );

  const onNodeClick = useCallback((event, node) => {
    setSelectedNode(node);
    setSelectedEdge(null);
  }, []);

  const onEdgeClick = useCallback((event, edge) => {
    setSelectedEdge(edge);
    setSelectedNode(null);
  }, []);

  const addNode = (type) => {
    const id = `${type}_${Date.now()}`;
    const typeCount = nodes.filter((n) => n.data.nodeType === type).length + 1;
    const newNode = {
      id,
      type: "default",
      data: {
        label: `${type.charAt(0).toUpperCase() + type.slice(1)} ${typeCount}`,
        nodeType: type,
        capacity: 1000,
        initial_level: 1000,
        holding_cost: 0.22,
        replenishment_policy: "SS",
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
        background: type === "supplier" ? "#4CAF50" : "#2196F3",
        color: "white",
        border: "2px solid #333",
        borderRadius: "10px",
        padding: "12px",
        width: 160,
        fontSize: "13px",
        fontWeight: "600",
      },
    };
    setNodes((nds) => [...nds, newNode]);
    setSnackbar({
      open: true,
      message: `${
        type.charAt(0).toUpperCase() + type.slice(1)
      } ${typeCount} added!`,
      severity: "success",
    });
  };

  const updateNodeData = (nodeId, newData) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId) {
          return {
            ...node,
            data: { ...node.data, ...newData },
          };
        }
        return node;
      })
    );
    if (selectedNode && selectedNode.id === nodeId) {
      setSelectedNode({
        ...selectedNode,
        data: { ...selectedNode.data, ...newData },
      });
    }
  };

  const updateEdgeData = (edgeId, newData) => {
    setEdges((eds) =>
      eds.map((edge) => {
        if (edge.id === edgeId) {
          return {
            ...edge,
            data: { ...edge.data, ...newData },
            label: `Cost: $${newData.cost || edge.data?.cost || 10}, LT: ${
              newData.lead_time || edge.data?.lead_time || 5
            }d`,
          };
        }
        return edge;
      })
    );
    if (selectedEdge && selectedEdge.id === edgeId) {
      setSelectedEdge({
        ...selectedEdge,
        data: { ...selectedEdge.data, ...newData },
      });
    }
  };

  const addDemand = () => {
    if (nodes.length === 0) {
      setSnackbar({
        open: true,
        message: "Add nodes first before adding demand!",
        severity: "warning",
      });
      return;
    }

    const newDemand = {
      id: `demand_${Date.now()}`,
      name: `Demand ${demands.length + 1}`,
      target_node:
        nodes.find((n) => n.data.nodeType === "distributor")?.id || nodes[0].id,
      arrival_interval: 1,
      order_quantity: 400,
      delivery_cost: 10,
      lead_time: 5,
    };
    setDemands([...demands, newDemand]);
    setSnackbar({
      open: true,
      message: `Demand ${demands.length + 1} added!`,
      severity: "success",
    });
  };

  const updateDemand = (demandId, newData) => {
    setDemands(
      demands.map((d) => (d.id === demandId ? { ...d, ...newData } : d))
    );
  };

  const deleteDemand = (demandId) => {
    setDemands(demands.filter((d) => d.id !== demandId));
    setSnackbar({ open: true, message: "Demand deleted!", severity: "info" });
  };

  const clearAll = () => {
    if (window.confirm("Are you sure you want to clear everything?")) {
      setNodes([]);
      setEdges([]);
      setDemands([]);
      setSelectedNode(null);
      setSelectedEdge(null);
      setSimulationResults(null);
      setSnackbar({
        open: true,
        message: "Workspace cleared!",
        severity: "info",
      });
    }
  };

  const saveConfiguration = () => {
    const config = {
      nodes: nodes,
      edges: edges,
      demands: demands,
      simTime: simTime,
      savedAt: new Date().toISOString(),
    };

    const dataStr = JSON.stringify(config, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `supplynet-config-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);

    setSnackbar({
      open: true,
      message: "Configuration saved!",
      severity: "success",
    });
  };

  const loadConfiguration = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const config = JSON.parse(e.target.result);

        if (!config.nodes || !config.edges) {
          throw new Error("Invalid configuration file");
        }

        setNodes(config.nodes || []);
        setEdges(config.edges || []);
        setDemands(config.demands || []);
        setSimTime(config.simTime || 31);
        setSelectedNode(null);
        setSelectedEdge(null);
        setSimulationResults(null);

        setSnackbar({
          open: true,
          message: "Configuration loaded successfully!",
          severity: "success",
        });
      } catch (error) {
        setSnackbar({
          open: true,
          message: `Failed to load configuration: ${error.message}`,
          severity: "error",
        });
      }
    };
    reader.readAsText(file);
    event.target.value = null;
  };

  const exportResultsCSV = () => {
    if (!simulationResults || !simulationResults.success) {
      setSnackbar({
        open: true,
        message: "No simulation results to export!",
        severity: "warning",
      });
      return;
    }

    const metrics = simulationResults.metrics;

    let csvContent = "Metric,Value\n";
    csvContent += `Profit,$${metrics.profit}\n`;
    csvContent += `Revenue,$${metrics.revenue}\n`;
    csvContent += `Total Cost,$${metrics.total_cost}\n`;
    csvContent += `Inventory Carry Cost,$${metrics.inventory_carry_cost}\n`;
    csvContent += `Transportation Cost,$${metrics.transportation_cost}\n`;
    csvContent += `Inventory Spend Cost,$${metrics.inventory_spend_cost}\n`;
    csvContent += `Available Inventory,${metrics.available_inv}\n`;
    csvContent += `Avg Available Inventory,${metrics.avg_available_inv}\n`;
    csvContent += `Total Demand (Orders),${metrics.total_demand?.[0] || 0}\n`;
    csvContent += `Total Demand (Units),${metrics.total_demand?.[1] || 0}\n`;
    csvContent += `Shortage (Orders),${metrics.shortage?.[0] || 0}\n`;
    csvContent += `Shortage (Units),${metrics.shortage?.[1] || 0}\n`;
    csvContent += `Backorders (Orders),${metrics.backorders?.[0] || 0}\n`;
    csvContent += `Backorders (Units),${metrics.backorders?.[1] || 0}\n`;
    csvContent += `Avg Cost per Order,$${metrics.avg_cost_per_order}\n`;
    csvContent += `Avg Cost per Item,$${metrics.avg_cost_per_item}\n`;
    csvContent += `Number of Nodes,${metrics.num_of_nodes}\n`;
    csvContent += `Number of Links,${metrics.num_of_links}\n`;
    csvContent += `Number of Suppliers,${metrics.num_suppliers}\n`;
    csvContent += `Number of Distributors,${metrics.num_distributors}\n`;

    if (simulationResults.inventory_data) {
      csvContent += "\n\nInventory Levels Over Time\n";
      Object.keys(simulationResults.inventory_data).forEach((nodeId) => {
        const nodeName =
          nodes.find((n) => n.id === nodeId)?.data.label || nodeId;
        const data = simulationResults.inventory_data[nodeId];

        csvContent += `\n${nodeName}\n`;
        csvContent += "Time (days),Inventory Level\n";

        data.time.forEach((time, idx) => {
          csvContent += `${time},${data.level[idx]}\n`;
        });
      });
    }

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `simulation-results-${Date.now()}.csv`;
    link.click();
    URL.revokeObjectURL(url);

    setSnackbar({
      open: true,
      message: "Results exported as CSV!",
      severity: "success",
    });
  };

  const saveAsScenario = () => {
    if (!simulationResults || !simulationResults.success) {
      setSnackbar({
        open: true,
        message: "Run a simulation first!",
        severity: "warning",
      });
      return;
    }
    setShowScenarioDialog(true);
  };

  const confirmSaveScenario = () => {
    if (!currentScenarioName.trim()) {
      setSnackbar({
        open: true,
        message: "Please enter a scenario name!",
        severity: "warning",
      });
      return;
    }

    const scenario = {
      id: `scenario_${Date.now()}`,
      name: currentScenarioName,
      timestamp: new Date().toISOString(),
      config: {
        nodes: nodes,
        edges: edges,
        demands: demands,
        simTime: simTime,
      },
      results: simulationResults,
    };

    setScenarios([...scenarios, scenario]);
    setCurrentScenarioName("");
    setShowScenarioDialog(false);
    setSnackbar({
      open: true,
      message: `Scenario "${scenario.name}" saved!`,
      severity: "success",
    });
  };

  const deleteScenario = (scenarioId) => {
    setScenarios(scenarios.filter((s) => s.id !== scenarioId));
    setSnackbar({
      open: true,
      message: "Scenario deleted!",
      severity: "info",
    });
  };

  const loadScenario = (scenario) => {
    setNodes(scenario.config.nodes);
    setEdges(scenario.config.edges);
    setDemands(scenario.config.demands);
    setSimTime(scenario.config.simTime);
    setSimulationResults(scenario.results);
    setShowComparisonView(false);
    setSnackbar({
      open: true,
      message: `Loaded scenario: ${scenario.name}`,
      severity: "success",
    });
  };

  const toggleComparisonView = () => {
    if (scenarios.length === 0) {
      setSnackbar({
        open: true,
        message: "Save at least one scenario to compare!",
        severity: "warning",
      });
      return;
    }
    setShowComparisonView(!showComparisonView);
  };

  const saveNetwork = () => {
    if (nodes.length === 0) {
      setSnackbar({
        open: true,
        message: "Create a network first!",
        severity: "warning",
      });
      return;
    }
    setShowSaveNetworkDialog(true);
  };

  const confirmSaveNetwork = () => {
    if (!currentNetworkName.trim()) {
      setSnackbar({
        open: true,
        message: "Please enter a network name!",
        severity: "warning",
      });
      return;
    }

    const network = {
      id: `network_${Date.now()}`,
      name: currentNetworkName,
      description: currentNetworkDescription,
      savedAt: new Date().toISOString(),
      config: {
        nodes: nodes,
        edges: edges,
        demands: demands,
        simTime: simTime,
      },
    };

    setSavedNetworks([...savedNetworks, network]);
    setCurrentNetworkName("");
    setCurrentNetworkDescription("");
    setShowSaveNetworkDialog(false);
    setSnackbar({
      open: true,
      message: `Network "${network.name}" saved!`,
      severity: "success",
    });
  };

  const loadNetwork = (network) => {
    setNodes(network.config.nodes);
    setEdges(network.config.edges);
    setDemands(network.config.demands);
    setSimTime(network.config.simTime);
    setSelectedNode(null);
    setSelectedEdge(null);
    setSimulationResults(null);
    setShowSavedNetworks(false);
    setSnackbar({
      open: true,
      message: `Network "${network.name}" loaded!`,
      severity: "success",
    });
  };

  const deleteNetwork = (networkId) => {
    setSavedNetworks(savedNetworks.filter((n) => n.id !== networkId));
    setSnackbar({
      open: true,
      message: "Network deleted!",
      severity: "info",
    });
  };

  const runSimulation = async () => {
    if (nodes.length === 0) {
      setSnackbar({
        open: true,
        message: "Add at least one node!",
        severity: "error",
      });
      return;
    }

    if (edges.length === 0) {
      setSnackbar({
        open: true,
        message: "Connect nodes with links!",
        severity: "error",
      });
      return;
    }

    if (demands.length === 0) {
      setSnackbar({
        open: true,
        message: "Add at least one demand!",
        severity: "error",
      });
      return;
    }

    setIsSimulating(true);
    try {
      const simulationConfig = {
        nodes: nodes.map((n) => ({
          id: n.id,
          name: n.data.label,
          type: n.data.nodeType,
          capacity: n.data.capacity,
          initial_level: n.data.initial_level,
          holding_cost: n.data.holding_cost,
          replenishment_policy: n.data.replenishment_policy,
          policy_s: n.data.policy_s,
          policy_S: n.data.policy_S,
          policy_R: n.data.policy_R,
          policy_Q: n.data.policy_Q,
          buy_price: n.data.buy_price,
          sell_price: n.data.sell_price,
          position: n.position,
        })),
        links: edges.map((e, idx) => ({
          id: e.id || `L${idx}`,
          source: e.source,
          target: e.target,
          cost: e.data?.cost || 10,
          lead_time: e.data?.lead_time || 5,
        })),
        demands: demands,
        sim_time: simTime,
      };

      const response = await fetch("http://localhost:8000/simulate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(simulationConfig),
      });

      const result = await response.json();

      if (result.success) {
        setSimulationResults(result);
        setSnackbar({
          open: true,
          message: "Simulation completed successfully!",
          severity: "success",
        });
      } else {
        setSnackbar({
          open: true,
          message: `Simulation Error: ${result.error}`,
          severity: "error",
        });
        console.error("Simulation error:", result.error);
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: `Failed to run simulation: ${error.message}`,
        severity: "error",
      });
      console.error("Request failed:", error);
    } finally {
      setIsSimulating(false);
    }
  };

  const theme = React.useMemo(() => getTheme(themeMode), [themeMode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          height: "100vh",
          bgcolor: "background.default",
          transition: "background-color 0.3s ease",
        }}
      >
        <ActionToolbar
          onAddNode={addNode}
          onAddDemand={addDemand}
          onSaveConfig={saveConfiguration}
          onLoadConfig={() =>
            document.querySelector('input[type="file"]').click()
          }
          onSaveNetwork={saveNetwork}
          onViewNetworks={() => setShowSavedNetworks(true)}
          onSaveScenario={saveAsScenario}
          onCompareScenarios={toggleComparisonView}
          onRunSimulation={runSimulation}
          onClearAll={clearAll}
          simTime={simTime}
          onSimTimeChange={setSimTime}
          isSimulating={isSimulating}
          hasResults={simulationResults !== null}
          stats={{
            nodes: nodes.length,
            links: edges.length,
            demands: demands.length,
            savedNetworks: savedNetworks.length,
            scenarios: scenarios.length,
          }}
          onMenuClick={(action) => {
            console.log("Menu action:", action);
          }}
          themeMode={themeMode}
          onThemeToggle={toggleTheme}
        />

        <input
          type="file"
          hidden
          accept=".json"
          onChange={loadConfiguration}
          style={{ display: "none" }}
        />

        <Box sx={{ display: "flex", flex: 1, overflow: "hidden" }}>
          <Box
            sx={{
              flex: 3,
              position: "relative",
              background:
                themeMode === "light"
                  ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                  : "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
              transition: "background 0.3s ease",
            }}
          >
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onNodeClick={onNodeClick}
              onEdgeClick={onEdgeClick}
              fitView
            >
              <Controls />
              <MiniMap
                nodeColor={(node) =>
                  node.data.nodeType === "supplier" ? "#4CAF50" : "#2196F3"
                }
                maskColor="rgba(0, 0, 0, 0.1)"
              />
              <Background variant="dots" gap={16} size={1} color="#ffffff33" />
            </ReactFlow>
          </Box>

          <Box
            sx={{
              flex: 1,
              borderLeft: `2px solid`,
              borderColor: "divider",
              overflow: "auto",
              bgcolor: "background.paper",
              boxShadow: "-4px 0 20px rgba(0,0,0,0.1)",
              transition: "all 0.3s ease",
            }}
          >
            <ConfigPanel
              selectedNode={selectedNode}
              updateNodeData={updateNodeData}
              selectedEdge={selectedEdge}
              updateEdgeData={updateEdgeData}
              demands={demands}
              updateDemand={updateDemand}
              deleteDemand={deleteDemand}
              nodes={nodes}
            />
          </Box>
        </Box>

        {simulationResults && (
          <SimulationDashboard
            results={simulationResults}
            nodes={nodes}
            onClose={() => setSimulationResults(null)}
            onExport={exportResultsCSV}
          />
        )}

        {showComparisonView && (
          <ScenarioComparison
            scenarios={scenarios}
            onClose={() => setShowComparisonView(false)}
            onDelete={deleteScenario}
            onLoad={loadScenario}
          />
        )}
        {showSavedNetworks && (
          <SavedNetworks
            savedNetworks={savedNetworks}
            onClose={() => setShowSavedNetworks(false)}
            onLoadNetwork={loadNetwork}
            onDeleteNetwork={deleteNetwork}
          />
        )}

        <Dialog
          open={showScenarioDialog}
          onClose={() => setShowScenarioDialog(false)}
        >
          <DialogTitle>Save Scenario</DialogTitle>
          <DialogContent>
            <MuiTextField
              autoFocus
              margin="dense"
              label="Scenario Name"
              fullWidth
              variant="outlined"
              value={currentScenarioName}
              onChange={(e) => setCurrentScenarioName(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  confirmSaveScenario();
                }
              }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowScenarioDialog(false)}>Cancel</Button>
            <Button
              onClick={confirmSaveScenario}
              variant="contained"
              color="primary"
            >
              Save
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog
          open={showSaveNetworkDialog}
          onClose={() => setShowSaveNetworkDialog(false)}
        >
          <DialogTitle>Save Network</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 1, minWidth: 400 }}>
              <MuiTextField
                autoFocus
                label="Network Name"
                fullWidth
                variant="outlined"
                value={currentNetworkName}
                onChange={(e) => setCurrentNetworkName(e.target.value)}
                placeholder="e.g., Q4 Supply Chain Model"
              />
              <MuiTextField
                label="Description (Optional)"
                fullWidth
                variant="outlined"
                multiline
                rows={3}
                value={currentNetworkDescription}
                onChange={(e) => setCurrentNetworkDescription(e.target.value)}
                placeholder="Brief description of the network"
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowSaveNetworkDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={confirmSaveNetwork}
              variant="contained"
              color="primary"
            >
              Save Network
            </Button>
          </DialogActions>
        </Dialog>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        >
          <Alert
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            severity={snackbar.severity}
            sx={{ width: "100%" }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </ThemeProvider>
  );
}

export default App;

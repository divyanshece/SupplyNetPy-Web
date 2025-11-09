from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import sys
import os

# Add path to your local SupplyNetPy library
SUPPLYNETPY_PATH = "/Users/divyanshpandey/Desktop/SupplyNetPy/src"
sys.path.insert(0, SUPPLYNETPY_PATH)

try:
    from SupplyNetPy.Components import core, utilities, logger
    import simpy
    print(f"✅ SupplyNetPy imported successfully from {SUPPLYNETPY_PATH}")
except ImportError as e:
    print(f"❌ Error importing SupplyNetPy: {e}")
    print(f"Tried path: {SUPPLYNETPY_PATH}")

app = FastAPI(title="SupplyNet Web API", version="1.0.0")

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============ Pydantic Models ============

class NodeConfig(BaseModel):
    id: str
    name: str
    type: str
    capacity: Optional[int] = None
    initial_level: Optional[int] = None
    holding_cost: Optional[float] = 0.22
    replenishment_policy: Optional[str] = "SS"
    policy_s: Optional[int] = None
    policy_S: Optional[int] = None
    policy_R: Optional[int] = None
    policy_Q: Optional[int] = None
    buy_price: Optional[float] = 150
    sell_price: Optional[float] = 300
    position: Dict[str, float] = {"x": 0, "y": 0}

class LinkConfig(BaseModel):
    id: str
    source: str
    target: str
    cost: float = 10
    lead_time: float = 5  # Changed to float for decimals

class DemandConfig(BaseModel):
    id: str
    name: str
    target_node: str
    arrival_interval: float = 1  # Changed to float for decimals
    order_quantity: int = 400
    delivery_cost: float = 10
    lead_time: float = 5  # Changed to float for decimals

class SimulationRequest(BaseModel):
    nodes: List[NodeConfig]
    links: List[LinkConfig]
    demands: List[DemandConfig]
    sim_time: int = 31

class SimulationResponse(BaseModel):
    success: bool
    metrics: Optional[Dict[str, Any]] = None
    inventory_data: Optional[Dict[str, Dict[str, List]]] = None
    error: Optional[str] = None

# ============ API Endpoints ============

@app.get("/")
async def root():
    return {
        "message": "SupplyNet Web API",
        "status": "running",
        "endpoints": ["/simulate", "/health"]
    }

@app.get("/health")
async def health_check():
    try:
        test_env = simpy.Environment()
        return {
            "status": "healthy",
            "supplynetpy": "available",
            "simpy_version": simpy.__version__
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "error": str(e)
        }

@app.post("/simulate", response_model=SimulationResponse)
async def run_simulation(config: SimulationRequest):
    """
    Run a supply chain simulation based on the provided configuration
    """
    try:
        print("\n=== Simulation Started ===")
        print(f"Nodes: {len(config.nodes)}, Links: {len(config.links)}, Demands: {len(config.demands)}")
        print(f"Simulation Time: {config.sim_time} days")
        
        # Disable logging for web interface
        utilities.global_logger.disable_logging()
        
        # Create SimPy environment
        env = simpy.Environment()
        
        # Store created objects
        node_objects = {}
        link_objects = []
        demand_objects = []
        
        # STEP 1: Create all nodes
        for node_config in config.nodes:
            if node_config.type == "supplier":
                node = core.Supplier(
                    env=env,
                    ID=node_config.id,
                    name=node_config.name,
                    node_type="infinite_supplier"
                )
                node_objects[node_config.id] = node
                
            elif node_config.type == "distributor":
                # Determine replenishment policy
                if node_config.replenishment_policy == "SS":
                    policy = core.SSReplenishment
                    policy_param = {
                        's': node_config.policy_s or 400,
                        'S': node_config.policy_S or 1000
                    }
                else:  # RQ
                    policy = core.RQReplenishment
                    policy_param = {
                        'R': node_config.policy_R or 1000,
                        'Q': node_config.policy_Q or 500
                    }
                
                node = core.InventoryNode(
                    env=env,
                    ID=node_config.id,
                    name=node_config.name,
                    node_type="distributor",
                    capacity=node_config.capacity or 1000,
                    initial_level=node_config.initial_level or 1000,
                    inventory_holding_cost=node_config.holding_cost,
                    replenishment_policy=policy,
                    policy_param=policy_param,
                    product_buy_price=node_config.buy_price,
                    product_sell_price=node_config.sell_price
                )
                node_objects[node_config.id] = node
        
        # STEP 2: Create all links
        for link_config in config.links:
            if link_config.source not in node_objects or link_config.target not in node_objects:
                raise HTTPException(status_code=400, detail=f"Invalid link: {link_config.source} -> {link_config.target}")
            
            link = core.Link(
                env=env,
                ID=link_config.id,
                source=node_objects[link_config.source],
                sink=node_objects[link_config.target],
                cost=link_config.cost,
                lead_time=lambda lt=link_config.lead_time: lt
            )
            link_objects.append(link)
        
        # STEP 3: Create demands
        for demand_config in config.demands:
            if demand_config.target_node not in node_objects:
                raise HTTPException(status_code=400, detail=f"Invalid demand target: {demand_config.target_node}")
            
            demand = core.Demand(
                env=env,
                ID=demand_config.id,
                name=demand_config.name,
                order_arrival_model=lambda interval=demand_config.arrival_interval: interval,
                order_quantity_model=lambda qty=demand_config.order_quantity: qty,
                delivery_cost=lambda cost=demand_config.delivery_cost: cost,
                lead_time=lambda lt=demand_config.lead_time: lt,
                demand_node=node_objects[demand_config.target_node]
            )
            demand_objects.append(demand)
        
        # STEP 4: Create supply chain network
        supplynet = utilities.create_sc_net(
            env=env,
            nodes=list(node_objects.values()),
            links=link_objects,
            demands=demand_objects
        )
        
        # STEP 5: Run simulation
        supplynet = utilities.simulate_sc_net(supplynet, sim_time=config.sim_time, logging=False)
        
        print("✅ Simulation completed successfully")
        
        # Extract inventory data - ONLY distributors (not infinite suppliers)
        inventory_data = {}
        for node_id, node in node_objects.items():
            # Skip infinite suppliers
            if hasattr(node, 'node_type') and 'infinite' in node.node_type.lower():
                continue
                
            if hasattr(node, 'inventory') and hasattr(node.inventory, 'instantaneous_levels'):
                import numpy as np
                inv_levels = np.array(node.inventory.instantaneous_levels)
                if len(inv_levels) > 0:
                    inventory_data[node_id] = {
                        "time": inv_levels[:, 0].tolist(),
                        "level": inv_levels[:, 1].tolist()
                    }
        
        # Extract ALL metrics
        metrics = {
            # Financial metrics
            "profit": float(supplynet.get('profit', 0)),
            "revenue": float(supplynet.get('revenue', 0)),
            "total_cost": float(supplynet.get('total_cost', 0)),
            "inventory_carry_cost": float(supplynet.get('inventory_carry_cost', 0)),
            "inventory_spend_cost": float(supplynet.get('inventory_spend_cost', 0)),
            "transportation_cost": float(supplynet.get('transportation_cost', 0)),
            
            # Inventory metrics
            "available_inv": int(supplynet.get('available_inv', 0)),
            "avg_available_inv": float(supplynet.get('avg_available_inv', 0)),
            
            # Demand & fulfillment
            "total_demand": supplynet.get('total_demand', [0, 0]),
            "demand_by_customers": supplynet.get('demand_by_customers', [0, 0]),
            "demand_by_site": supplynet.get('demand_by_site', [0, 0]),
            "shortage": supplynet.get('shortage', [0, 0]),
            "backorders": supplynet.get('backorders', [0, 0]),
            "fulfillment_received_by_customers": supplynet.get('fulfillment_received_by_customers', [0, 0]),
            "fulfillment_received_by_site": supplynet.get('fulfillment_received_by_site', [0, 0]),
            "total_fulfillment_received": supplynet.get('total_fulfillment_received', [0, 0]),
            
            # Averages
            "avg_cost_per_order": float(supplynet.get('avg_cost_per_order', 0)),
            "avg_cost_per_item": float(supplynet.get('avg_cost_per_item', 0)),
            
            # Network stats
            "num_of_nodes": supplynet.get('num_of_nodes', 0),
            "num_of_links": supplynet.get('num_of_links', 0),
            "num_suppliers": supplynet.get('num_suppliers', 0),
            "num_distributors": supplynet.get('num_distributors', 0),
            "num_manufacturers": supplynet.get('num_manufacturers', 0),
            "num_retailers": supplynet.get('num_retailers', 0),
        }
        
        return SimulationResponse(
            success=True,
            metrics=metrics,
            inventory_data=inventory_data
        )
        
    except Exception as e:
        import traceback
        error_detail = f"{str(e)}\n{traceback.format_exc()}"
        print(f"\n❌ ERROR: {error_detail}\n")
        return SimulationResponse(
            success=False,
            error=error_detail
        )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
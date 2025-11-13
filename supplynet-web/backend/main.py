from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import os

# Import from PyPI package (not local)
try:
    import SupplyNetPy.Components as scm
    print("✅ SupplyNetPy imported successfully from PyPI")
except ImportError as e:
    print(f"❌ Error importing SupplyNetPy: {e}")
    print("Run: pip install supplynetpy")
    raise

app = FastAPI(title="SupplyNet Web API", version="1.0.0")

# CORS Configuration
ALLOWED_ORIGINS = os.getenv(
    "ALLOWED_ORIGINS",
    "http://localhost:3000,https://*.vercel.app"
).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Permissive for development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============ Pydantic Models ============

class NodeData(BaseModel):
    label: str
    nodeType: str
    capacity: Optional[int] = 10000
    initial_level: Optional[int] = 10000
    holding_cost: Optional[float] = 0.22
    replenishment_policy: Optional[str] = "SS"
    policy_s: Optional[int] = 400
    policy_S: Optional[int] = 1000
    policy_R: Optional[int] = 7
    policy_Q: Optional[int] = 500
    buy_price: Optional[float] = 150
    sell_price: Optional[float] = 300

class Node(BaseModel):
    id: str
    data: NodeData

class EdgeData(BaseModel):
    cost: float
    lead_time: float

class Edge(BaseModel):
    id: str
    source: str
    target: str
    data: EdgeData

class Demand(BaseModel):
    id: str
    name: str
    target_node: str
    arrival_interval: float
    order_quantity: int
    delivery_cost: Optional[float] = 10
    lead_time: Optional[float] = 5

class SimulationRequest(BaseModel):
    nodes: List[Node]
    links: List[Edge]
    demands: List[Demand]
    sim_time: int = 30

# ============ Helper Function ============

def make_constant_lambda(value):
    """Create lambda that properly captures value"""
    return lambda: value

# ============ API Endpoints ============

@app.get("/")
async def root():
    return {
        "message": "SupplyNet Web API",
        "status": "running",
        "version": "1.0.0"
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "supplynetpy": "0.1.5"
    }

@app.post("/simulate")  # ← REMOVED /api prefix
async def run_simulation(config: SimulationRequest):
    """
    Run supply chain simulation
    """
    try:
        print("\n=== Simulation Started ===")
        print(f"Nodes: {len(config.nodes)}, Links: {len(config.links)}, Demands: {len(config.demands)}")
        print(f"Simulation Time: {config.sim_time} days")
        
        # Convert frontend nodes to SupplyNetPy format
        nodes = []
        
        for node in config.nodes:
            node_data = node.data
            
            if node_data.nodeType == 'supplier':
                # Infinite supplier (as you had before)
                nodes.append({
                    'ID': node.id,
                    'name': node_data.label,
                    'node_type': 'infinite_supplier'
                })
                print(f"✅ Created supplier: {node_data.label}")
            
            elif node_data.nodeType == 'distributor':
                # Distributor with inventory management
                policy = scm.SSReplenishment if node_data.replenishment_policy == 'SS' else scm.RQReplenishment
                
                if node_data.replenishment_policy == 'SS':
                    policy_param = {
                        's': node_data.policy_s,
                        'S': node_data.policy_S
                    }
                    print(f"📋 Policy: (s,S) with s={node_data.policy_s}, S={node_data.policy_S}")
                else:
                    policy_param = {
                        'R': node_data.policy_R,
                        'Q': node_data.policy_Q
                    }
                    print(f"📋 Policy: (R,Q) with R={node_data.policy_R}, Q={node_data.policy_Q}")
                
                nodes.append({
                    'ID': node.id,
                    'name': node_data.label,
                    'node_type': 'distributor',
                    'capacity': node_data.capacity,
                    'initial_level': node_data.initial_level,
                    'inventory_holding_cost': node_data.holding_cost,
                    'replenishment_policy': policy,
                    'policy_param': policy_param,
                    'product_buy_price': node_data.buy_price,
                    'product_sell_price': node_data.sell_price
                })
                print(f"✅ Created distributor: {node_data.label}")
        
        # Convert links
        links = []
        for edge in config.links:
            links.append({
                'ID': edge.id,
                'source': edge.source,
                'sink': edge.target,
                'cost': edge.data.cost,
                'lead_time': make_constant_lambda(edge.data.lead_time)
            })
            print(f"🔗 Created link: {edge.source} → {edge.target}")
        
        # Convert demands
        demands = []
        for demand in config.demands:
            demands.append({
                'ID': demand.id,
                'name': demand.name,
                'order_arrival_model': make_constant_lambda(demand.arrival_interval),
                'order_quantity_model': make_constant_lambda(demand.order_quantity),
                'demand_node': demand.target_node
            })
            print(f"📬 Created demand: {demand.name} → {demand.target_node}")
        
        # Create and simulate network
        print("\n🏗️  Building network...")
        supplychainnet = scm.create_sc_net(
            nodes=nodes,
            links=links,
            demands=demands
        )
        
        print(f"▶️  Running simulation for {config.sim_time} days...")
        supplychainnet = scm.simulate_sc_net(
            supplychainnet,
            sim_time=config.sim_time,
            logging=False
        )
        
        print("✅ Simulation completed")
        
        # Extract metrics
        metrics = {
            'profit': float(supplychainnet.get('profit', 0)),
            'revenue': float(supplychainnet.get('revenue', 0)),
            'total_cost': float(supplychainnet.get('total_cost', 0)),
            'inventory_carry_cost': float(supplychainnet.get('inventory_carry_cost', 0)),
            'inventory_spend_cost': float(supplychainnet.get('inventory_spend_cost', 0)),
            'transportation_cost': float(supplychainnet.get('transportation_cost', 0)),
            'available_inv': int(supplychainnet.get('available_inv', 0)),
            'avg_available_inv': float(supplychainnet.get('avg_available_inv', 0)),
            'total_demand': supplychainnet.get('total_demand', [0, 0]),
            'demand_by_customers': supplychainnet.get('demand_by_customers', [0, 0]),
            'shortage': supplychainnet.get('shortage', [0, 0]),
            'backorders': supplychainnet.get('backorders', [0, 0]),
            'fulfillment_received_by_customers': supplychainnet.get('fulfillment_received_by_customers', [0, 0]),
            'avg_cost_per_order': float(supplychainnet.get('avg_cost_per_order', 0)),
            'avg_cost_per_item': float(supplychainnet.get('avg_cost_per_item', 0)),
            'num_of_nodes': supplychainnet.get('num_of_nodes', 0),
            'num_of_links': supplychainnet.get('num_of_links', 0),
            'num_suppliers': supplychainnet.get('num_suppliers', 0),
            'num_distributors': supplychainnet.get('num_distributors', 0),
            'num_manufacturers': supplychainnet.get('num_manufacturers', 0),
            'num_retailers': supplychainnet.get('num_retailers', 0),
        }
        
        # Extract inventory time-series data
        # Extract inventory time-series data
        inventory_data = {}
        
        print("\n📊 Extracting inventory data...")
        
        # supplychainnet is a DICTIONARY, not an object
        if 'nodes' in supplychainnet:
            nodes_dict = supplychainnet['nodes']
            print(f"Found {len(nodes_dict)} nodes in network")
            
            for node_id, node_obj in nodes_dict.items():
                print(f"\n Processing node: {node_id} ({node_obj.name})")
                
                # Skip suppliers (they have infinite inventory)
                node_type = str(getattr(node_obj, 'node_type', '')).lower()
                if 'infinite' in node_type or node_type == 'supplier':
                    print(f"  ⏭️  Skipping supplier: {node_id}")
                    continue
                
                # Distributors have inventory tracking
                if hasattr(node_obj, 'inventory'):
                    inventory_obj = node_obj.inventory
                    
                    if hasattr(inventory_obj, 'instantaneous_levels'):
                        import numpy as np
                        inv_levels = inventory_obj.instantaneous_levels
                        
                        if len(inv_levels) > 0:
                            inv_array = np.array(inv_levels)
                            inventory_data[node_id] = {
                                'time': inv_array[:, 0].tolist(),
                                'level': inv_array[:, 1].tolist()
                            }
                            print(f"  ✅ Extracted {len(inv_array)} inventory data points")
                        else:
                            print(f"  ⚠️  Empty inventory levels")
                    else:
                        print(f"  ⚠️  No instantaneous_levels found")
                        # Debug: show what attributes inventory has
                        inv_attrs = [attr for attr in dir(inventory_obj) if not attr.startswith('_')]
                        print(f"     Available inventory attributes: {inv_attrs[:10]}")
                else:
                    print(f"  ⚠️  No inventory attribute")
        else:
            print("❌ No 'nodes' key in network dictionary")
        
        print(f"\n📦 Total inventory datasets collected: {len(inventory_data)}")
        for node_id in inventory_data.keys():
            print(f"   - {node_id}: {len(inventory_data[node_id]['time'])} time points")
        
        print(f"\n📊 Profit: ${metrics['profit']:.2f}")
        print(f"📊 Revenue: ${metrics['revenue']:.2f}")
        
        return {
            'success': True,
            'metrics': metrics,
            'inventory_data': inventory_data
        }
        
    except Exception as e:
        import traceback
        error_detail = f"{str(e)}\n{traceback.format_exc()}"
        print(f"\n❌ ERROR:\n{error_detail}")
        raise HTTPException(
            status_code=500,
            detail=f"Simulation failed: {str(e)}"
        )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
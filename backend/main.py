from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import os

try:
    import SupplyNetPy.Components as scm
    print("✅ SupplyNetPy imported successfully from PyPI")
except ImportError as e:
    print(f"❌ Error importing SupplyNetPy: {e}")
    raise

app = FastAPI(title="SupplyNet Web API", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
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
    supplier_type: Optional[str] = "infinite"
    manufacturing_cost: Optional[float] = 20
    manufacturing_time: Optional[float] = 1
    batch_size: Optional[int] = 1000
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

# ============ Helper Functions ============

def make_constant_lambda(value):
    """Create lambda that properly captures value"""
    return lambda: value

def create_raw_material(node_id: str, node_name: str):
    """Create a default raw material"""
    return scm.RawMaterial(
        ID=f'rm_{node_id}',
        name=f'RawMat_{node_name}',
        extraction_quantity=1000,
        extraction_time=1,
        mining_cost=0.5,
        cost=0.8
    )

def create_product(node_id: str, node_name: str, node_data: NodeData, raw_materials: list):
    """Create a product for factories"""
    return scm.Product(
        ID=f'prod_{node_id}',
        name=f'Product_{node_name}',
        manufacturing_cost=node_data.manufacturing_cost,
        manufacturing_time=node_data.manufacturing_time,
        batch_size=node_data.batch_size,
        raw_materials=raw_materials,
        sell_price=node_data.sell_price
    )

# ============ API Endpoints ============

@app.get("/")
async def root():
    return {
        "message": "SupplyNet Web API",
        "status": "running",
        "version": "2.0.0",
        "nodes_supported": ["supplier", "factory", "distributor", "retailer"]
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy", "supplynetpy": "0.1.5"}

@app.post("/simulate")
async def run_simulation(config: SimulationRequest):
    try:
        print("\n" + "="*70)
        print("🚀 SIMULATION STARTED")
        print("="*70)
        print(f"📊 Config: {len(config.nodes)} nodes, {len(config.links)} links, {len(config.demands)} demands")
        print(f"⏱️  Duration: {config.sim_time} days\n")
        
        # ============ STEP 1: Analyze Network Topology ============
        suppliers_to_factories = {}  # Map: supplier_id -> [factory_ids]
        
        for edge in config.links:
            source_node = next((n for n in config.nodes if n.id == edge.source), None)
            target_node = next((n for n in config.nodes if n.id == edge.target), None)
            
            if source_node and target_node:
                if source_node.data.nodeType == 'supplier' and target_node.data.nodeType == 'factory':
                    if edge.source not in suppliers_to_factories:
                        suppliers_to_factories[edge.source] = []
                    suppliers_to_factories[edge.source].append(edge.target)
        
        # ============ STEP 2: Create Raw Materials ============
        print("🔨 Creating Raw Materials...")
        raw_materials_map = {}
        
        for supplier_id in suppliers_to_factories.keys():
            supplier_node = next((n for n in config.nodes if n.id == supplier_id), None)
            if supplier_node:
                raw_mat = create_raw_material(supplier_id, supplier_node.data.label)
                raw_materials_map[supplier_id] = raw_mat
                print(f"   ✅ {raw_mat.name} for {supplier_node.data.label}")
        
        # ============ STEP 3: Create Products ============
        print("\n🏭 Creating Products...")
        products_map = {}
        
        for node in config.nodes:
            if node.data.nodeType == 'factory':
                # Find suppliers feeding this factory
                feeding_suppliers = []
                for edge in config.links:
                    if edge.target == node.id:
                        source_node = next((n for n in config.nodes if n.id == edge.source), None)
                        if source_node and source_node.data.nodeType == 'supplier':
                            feeding_suppliers.append(edge.source)
                
                # Build raw material list for product
                raw_mat_list = []
                for supplier_id in feeding_suppliers:
                    if supplier_id in raw_materials_map:
                        raw_mat = raw_materials_map[supplier_id]
                        raw_mat_list.append((raw_mat, 2))  # 2 units per product
                
                # Fallback if no raw materials found
                if not raw_mat_list:
                    default_rm = create_raw_material(node.id, node.data.label)
                    raw_mat_list = [(default_rm, 2)]
                    raw_materials_map[f'default_{node.id}'] = default_rm
                
                product = create_product(node.id, node.data.label, node.data, raw_mat_list)
                products_map[node.id] = product
                print(f"   ✅ {product.name} (uses {len(raw_mat_list)} raw materials)")
        
        # ============ STEP 4: Create Nodes ============
        print("\n📦 Creating Supply Chain Nodes...")
        nodes = []
        
        for node in config.nodes:
            node_data = node.data
            
            # -------- SUPPLIER --------
            if node_data.nodeType == 'supplier':
                if node.id in raw_materials_map:
                    # Finite supplier with raw material
                    raw_mat = raw_materials_map[node.id]
                    nodes.append({
                        'ID': node.id,
                        'name': node_data.label,
                        'node_type': 'supplier',
                        'capacity': node_data.capacity,
                        'initial_level': node_data.initial_level,
                        'inventory_holding_cost': node_data.holding_cost,
                        'raw_material': raw_mat
                    })
                    print(f"   ✅ Supplier (Finite): {node_data.label}")
                    print(f"      └─ Raw Material: {raw_mat.name}")
                else:
                    # Infinite supplier
                    nodes.append({
                        'ID': node.id,
                        'name': node_data.label,
                        'node_type': 'infinite_supplier'
                    })
                    print(f"   ✅ Supplier (Infinite): {node_data.label}")
            
            # -------- FACTORY --------
            elif node_data.nodeType == 'factory':
                policy = scm.SSReplenishment if node_data.replenishment_policy == 'SS' else scm.RQReplenishment
                policy_param = {
                    's': node_data.policy_s, 'S': node_data.policy_S
                } if node_data.replenishment_policy == 'SS' else {
                    'R': node_data.policy_R, 'Q': node_data.policy_Q
                }
                
                product = products_map.get(node.id)
                nodes.append({
                    'ID': node.id,
                    'name': node_data.label,
                    'node_type': 'factory',
                    'capacity': node_data.capacity,
                    'initial_level': node_data.initial_level,
                    'inventory_holding_cost': node_data.holding_cost,
                    'replenishment_policy': policy,
                    'policy_param': policy_param,
                    'product': product,
                    'product_sell_price': node_data.sell_price
                })
                print(f"   ✅ Factory: {node_data.label}")
                print(f"      └─ Product: {product.name if product else 'None'}")
                print(f"      └─ Policy: {node_data.replenishment_policy} {policy_param}")
            
            # -------- DISTRIBUTOR --------
            elif node_data.nodeType == 'distributor':
                policy = scm.SSReplenishment if node_data.replenishment_policy == 'SS' else scm.RQReplenishment
                policy_param = {
                    's': node_data.policy_s, 'S': node_data.policy_S
                } if node_data.replenishment_policy == 'SS' else {
                    'R': node_data.policy_R, 'Q': node_data.policy_Q
                }
                
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
                print(f"   ✅ Distributor: {node_data.label}")
                print(f"      └─ Policy: {node_data.replenishment_policy} {policy_param}")
            
            # -------- RETAILER --------
            elif node_data.nodeType == 'retailer':
                policy = scm.SSReplenishment if node_data.replenishment_policy == 'SS' else scm.RQReplenishment
                policy_param = {
                    's': node_data.policy_s, 'S': node_data.policy_S
                } if node_data.replenishment_policy == 'SS' else {
                    'R': node_data.policy_R, 'Q': node_data.policy_Q
                }
                
                nodes.append({
                    'ID': node.id,
                    'name': node_data.label,
                    'node_type': 'retailer',
                    'capacity': node_data.capacity,
                    'initial_level': node_data.initial_level,
                    'inventory_holding_cost': node_data.holding_cost,
                    'replenishment_policy': policy,
                    'policy_param': policy_param,
                    'product_buy_price': node_data.buy_price,
                    'product_sell_price': node_data.sell_price
                })
                print(f"   ✅ Retailer: {node_data.label}")
                print(f"      └─ Policy: {node_data.replenishment_policy} {policy_param}")
        
        # ============ STEP 5: Create Links ============
        print("\n🔗 Creating Links...")
        links = []
        for edge in config.links:
            links.append({
                'ID': edge.id,
                'source': edge.source,
                'sink': edge.target,
                'cost': edge.data.cost,
                'lead_time': make_constant_lambda(edge.data.lead_time)
            })
            source_name = next((n.data.label for n in config.nodes if n.id == edge.source), edge.source)
            target_name = next((n.data.label for n in config.nodes if n.id == edge.target), edge.target)
            print(f"   ✅ {source_name} → {target_name} (cost: ${edge.data.cost}, lead: {edge.data.lead_time}d)")
        
        # ============ STEP 6: Create Demands ============
        print("\n📬 Creating Customer Demands...")
        demands = []
        for demand in config.demands:
            demands.append({
                'ID': demand.id,
                'name': demand.name,
                'order_arrival_model': make_constant_lambda(demand.arrival_interval),
                'order_quantity_model': make_constant_lambda(demand.order_quantity),
                'demand_node': demand.target_node
            })
            target_name = next((n.data.label for n in config.nodes if n.id == demand.target_node), demand.target_node)
            print(f"   ✅ {demand.name} → {target_name}")
            print(f"      └─ Every {demand.arrival_interval}d, {demand.order_quantity} units")
        
        # ============ STEP 7: Build Network ============
        print("\n🏗️  Building Supply Chain Network...")
        supplychainnet = scm.create_sc_net(
            nodes=nodes,
            links=links,
            demands=demands
        )
        print("   ✅ Network created successfully")
        
        # ============ STEP 8: Run Simulation ============
        print(f"\n▶️  Running Simulation ({config.sim_time} days)...")
        supplychainnet = scm.simulate_sc_net(
            supplychainnet,
            sim_time=config.sim_time,
            logging=False
        )
        print("   ✅ Simulation completed")
        
        # ============ STEP 9: Extract Metrics ============
        print("\n📊 Extracting Results...")
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
        
        # ============ STEP 10: Extract Inventory Data ============
        inventory_data = {}
        if 'nodes' in supplychainnet:
            nodes_dict = supplychainnet['nodes']
            for node_id, node_obj in nodes_dict.items():
                node_type = str(getattr(node_obj, 'node_type', '')).lower()
                if 'infinite' in node_type:
                    continue
                
                if hasattr(node_obj, 'inventory') and hasattr(node_obj.inventory, 'instantaneous_levels'):
                    import numpy as np
                    inv_levels = node_obj.inventory.instantaneous_levels
                    if len(inv_levels) > 0:
                        inv_array = np.array(inv_levels)
                        inventory_data[node_id] = {
                            'time': inv_array[:, 0].tolist(),
                            'level': inv_array[:, 1].tolist()
                        }
        
        print("\n" + "="*70)
        print("✅ SIMULATION SUCCESS")
        print("="*70)
        print(f"💰 Profit: ${metrics['profit']:,.2f}")
        print(f"💵 Revenue: ${metrics['revenue']:,.2f}")
        print(f"💸 Total Cost: ${metrics['total_cost']:,.2f}")
        print(f"📈 Inventory Charts: {len(inventory_data)} nodes")
        print("="*70 + "\n")
        
        return {
            'success': True,
            'metrics': metrics,
            'inventory_data': inventory_data
        }
        
    except Exception as e:
        import traceback
        error_detail = traceback.format_exc()
        print("\n" + "="*70)
        print("❌ SIMULATION FAILED")
        print("="*70)
        print(error_detail)
        print("="*70 + "\n")
        raise HTTPException(status_code=500, detail=f"Simulation failed: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
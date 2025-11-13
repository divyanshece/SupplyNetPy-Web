export const validateNodeData = (nodeData) => {
  const errors = [];

  if (!nodeData.label || nodeData.label.trim() === '') {
    errors.push('Node name cannot be empty');
  }

  if (nodeData.nodeType === 'distributor') {
    if (nodeData.capacity <= 0) {
      errors.push('Capacity must be positive');
    }

    if (nodeData.initial_level < 0) {
      errors.push('Initial level cannot be negative');
    }

    if (nodeData.initial_level > nodeData.capacity) {
      errors.push('Initial level cannot exceed capacity');
    }

    if (nodeData.holding_cost < 0) {
      errors.push('Holding cost cannot be negative');
    }

    if (nodeData.replenishment_policy === 'SS') {
      if (nodeData.policy_s < 0 || nodeData.policy_S < 0) {
        errors.push('Reorder point and order-up-to level must be positive');
      }
      if (nodeData.policy_s >= nodeData.policy_S) {
        errors.push('Reorder point (s) must be less than order-up-to level (S)');
      }
      if (nodeData.policy_S > nodeData.capacity) {
        errors.push('Order-up-to level (S) cannot exceed capacity');
      }
    }

    if (nodeData.replenishment_policy === 'RQ') {
      if (nodeData.policy_R <= 0 || nodeData.policy_Q <= 0) {
        errors.push('Review period and order quantity must be positive');
      }
    }

    if (nodeData.buy_price < 0 || nodeData.sell_price < 0) {
      errors.push('Prices cannot be negative');
    }

    if (nodeData.sell_price < nodeData.buy_price) {
      errors.push('Warning: Selling price is less than buying price (operating at loss)');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const validateEdgeData = (edgeData) => {
  const errors = [];

  if (!edgeData.cost || edgeData.cost <= 0) {
    errors.push('Transportation cost must be positive');
  }

  if (!edgeData.lead_time || edgeData.lead_time <= 0) {
    errors.push('Lead time must be positive');
  }

  if (edgeData.cost > 10000) {
    errors.push('Warning: Transportation cost seems unusually high');
  }

  if (edgeData.lead_time > 365) {
    errors.push('Warning: Lead time exceeds one year');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const validateDemandData = (demandData) => {
  const errors = [];

  if (!demandData.name || demandData.name.trim() === '') {
    errors.push('Demand name cannot be empty');
  }

  if (!demandData.target_node) {
    errors.push('Target node must be selected');
  }

  if (demandData.arrival_interval <= 0) {
    errors.push('Arrival interval must be positive');
  }

  if (demandData.order_quantity <= 0) {
    errors.push('Order quantity must be positive');
  }

  if (demandData.delivery_cost < 0) {
    errors.push('Delivery cost cannot be negative');
  }

  if (demandData.lead_time < 0) {
    errors.push('Lead time cannot be negative');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const sanitizeNumber = (value, min = 0, max = Infinity, defaultValue = 0) => {
  const num = parseFloat(value);
  if (isNaN(num)) return defaultValue;
  return Math.max(min, Math.min(max, num));
};

export const sanitizeInteger = (value, min = 0, max = Infinity, defaultValue = 0) => {
  const num = parseInt(value);
  if (isNaN(num)) return defaultValue;
  return Math.max(min, Math.min(max, num));
};
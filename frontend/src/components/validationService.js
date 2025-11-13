export const validateNetwork = (nodes, edges, demands) => {
  const warnings = [];
  const errors = [];
  const suggestions = [];

  // Critical Errors (blocks simulation)
  if (nodes.length === 0) {
    errors.push({
      type: 'error',
      category: 'network',
      message: 'No nodes in the network',
      action: 'Add at least one supplier or distributor',
      severity: 'critical',
    });
  }

  if (edges.length === 0 && nodes.length > 1) {
    errors.push({
      type: 'error',
      category: 'network',
      message: 'Nodes are not connected',
      action: 'Create links between nodes',
      severity: 'critical',
    });
  }

  if (demands.length === 0) {
    errors.push({
      type: 'error',
      category: 'demand',
      message: 'No customer demand configured',
      action: 'Add at least one demand source',
      severity: 'critical',
    });
  }

  // Network Structure Warnings
  const suppliers = nodes.filter(n => n.data.nodeType === 'supplier');
  const distributors = nodes.filter(n => n.data.nodeType === 'distributor');

  if (suppliers.length === 0) {
    warnings.push({
      type: 'warning',
      category: 'network',
      message: 'No suppliers in the network',
      action: 'Add at least one supplier node',
      severity: 'high',
    });
  }

  if (distributors.length === 0) {
    warnings.push({
      type: 'warning',
      category: 'network',
      message: 'No distributors in the network',
      action: 'Add at least one distributor node',
      severity: 'high',
    });
  }

  // Check for disconnected nodes
  const connectedNodes = new Set();
  edges.forEach(edge => {
    connectedNodes.add(edge.source);
    connectedNodes.add(edge.target);
  });

  const disconnectedNodes = nodes.filter(n => !connectedNodes.has(n.id));
  if (disconnectedNodes.length > 0) {
    warnings.push({
      type: 'warning',
      category: 'network',
      message: `${disconnectedNodes.length} disconnected node(s)`,
      details: disconnectedNodes.map(n => n.data.label).join(', '),
      action: 'Connect these nodes or remove them',
      severity: 'medium',
    });
  }

  // Check for single supplier (risk)
  if (suppliers.length === 1 && nodes.length > 1) {
    suggestions.push({
      type: 'suggestion',
      category: 'optimization',
      message: 'Single supplier creates supply risk',
      action: 'Consider adding a backup supplier for resilience',
      severity: 'low',
      icon: '💡',
    });
  }

  // Inventory Configuration Warnings
  distributors.forEach(dist => {
    const distData = dist.data;
    
    // Check if initial level exceeds capacity
    if (distData.initial_level > distData.capacity) {
      warnings.push({
        type: 'warning',
        category: 'inventory',
        message: `${distData.label}: Initial level exceeds capacity`,
        details: `Initial: ${distData.initial_level}, Capacity: ${distData.capacity}`,
        action: 'Reduce initial level or increase capacity',
        severity: 'medium',
      });
    }

    // Check for zero capacity
    if (distData.capacity === 0) {
      errors.push({
        type: 'error',
        category: 'inventory',
        message: `${distData.label}: Zero capacity`,
        action: 'Set a positive capacity value',
        severity: 'high',
      });
    }

    // Check reorder policy sanity
    if (distData.replenishment_policy === 'SS') {
      if (distData.policy_s >= distData.policy_S) {
        warnings.push({
          type: 'warning',
          category: 'inventory',
          message: `${distData.label}: Reorder point (s) >= Order-up-to level (S)`,
          details: `s: ${distData.policy_s}, S: ${distData.policy_S}`,
          action: 'Set s < S for proper (s,S) policy',
          severity: 'medium',
        });
      }

      if (distData.policy_S > distData.capacity) {
        warnings.push({
          type: 'warning',
          category: 'inventory',
          message: `${distData.label}: Order-up-to level exceeds capacity`,
          details: `S: ${distData.policy_S}, Capacity: ${distData.capacity}`,
          action: 'Reduce S or increase capacity',
          severity: 'medium',
        });
      }
    }

    // Pricing validation
    if (distData.sell_price <= distData.buy_price) {
      warnings.push({
        type: 'warning',
        category: 'pricing',
        message: `${distData.label}: Selling at loss`,
        details: `Buy: $${distData.buy_price}, Sell: $${distData.sell_price}`,
        action: 'Increase sell price above buy price for profit',
        severity: 'high',
      });
    }

    // Check for very low margin
    const margin = ((distData.sell_price - distData.buy_price) / distData.buy_price) * 100;
    if (margin > 0 && margin < 10) {
      suggestions.push({
        type: 'suggestion',
        category: 'optimization',
        message: `${distData.label}: Low profit margin (${margin.toFixed(1)}%)`,
        action: 'Consider increasing sell price for better profitability',
        severity: 'low',
        icon: '💰',
      });
    }
  });

  // Link/Edge Validations
  edges.forEach((edge, idx) => {
    const edgeData = edge.data || {};
    
    if (!edgeData.cost || edgeData.cost <= 0) {
      warnings.push({
        type: 'warning',
        category: 'links',
        message: `Link ${idx + 1}: Invalid or zero cost`,
        action: 'Set a positive transportation cost',
        severity: 'medium',
      });
    }

    if (!edgeData.lead_time || edgeData.lead_time <= 0) {
      warnings.push({
        type: 'warning',
        category: 'links',
        message: `Link ${idx + 1}: Invalid or zero lead time`,
        action: 'Set a positive lead time',
        severity: 'medium',
      });
    }

    // Check for very high lead times
    if (edgeData.lead_time > 30) {
      suggestions.push({
        type: 'suggestion',
        category: 'optimization',
        message: `Link ${idx + 1}: High lead time (${edgeData.lead_time} days)`,
        action: 'Consider finding faster transportation options',
        severity: 'low',
        icon: '⏰',
      });
    }
  });

  // Demand Validations
  demands.forEach((demand, idx) => {
    if (demand.order_quantity <= 0) {
      errors.push({
        type: 'error',
        category: 'demand',
        message: `${demand.name}: Invalid order quantity`,
        action: 'Set a positive order quantity',
        severity: 'high',
      });
    }

    if (demand.arrival_interval <= 0) {
      errors.push({
        type: 'error',
        category: 'demand',
        message: `${demand.name}: Invalid arrival interval`,
        action: 'Set a positive arrival interval',
        severity: 'high',
      });
    }

    // Check for very frequent orders
    if (demand.arrival_interval < 0.1) {
      suggestions.push({
        type: 'suggestion',
        category: 'optimization',
        message: `${demand.name}: Very frequent orders`,
        action: 'Consider batching orders to reduce overhead',
        severity: 'low',
        icon: '📦',
      });
    }

    // Check if demand target exists
    const targetExists = nodes.some(n => n.id === demand.target_node);
    if (!targetExists) {
      errors.push({
        type: 'error',
        category: 'demand',
        message: `${demand.name}: Target node does not exist`,
        action: 'Select a valid target node',
        severity: 'critical',
      });
    }
  });

  // Network Optimization Suggestions
  if (nodes.length > 5 && edges.length < nodes.length) {
    suggestions.push({
      type: 'suggestion',
      category: 'optimization',
      message: 'Network seems sparse',
      action: 'Consider adding more connections for better flow',
      severity: 'low',
      icon: '🔗',
    });
  }

  if (demands.length > distributors.length * 2) {
    suggestions.push({
      type: 'suggestion',
      category: 'optimization',
      message: 'High demand-to-distributor ratio',
      action: 'Consider adding more distributors to handle load',
      severity: 'low',
      icon: '⚖️',
    });
  }

  return {
    errors,
    warnings,
    suggestions,
    isValid: errors.length === 0,
    hasWarnings: warnings.length > 0,
    hasSuggestions: suggestions.length > 0,
  };
};

export const getValidationSummary = (validation) => {
  const { errors, warnings, suggestions } = validation;
  
  if (errors.length > 0) {
    return {
      status: 'error',
      message: `${errors.length} error(s) must be fixed`,
      color: 'error.main',
      icon: '🚫',
    };
  }
  
  if (warnings.length > 0) {
    return {
      status: 'warning',
      message: `${warnings.length} warning(s) found`,
      color: 'warning.main',
      icon: '⚠️',
    };
  }
  
  if (suggestions.length > 0) {
    return {
      status: 'suggestion',
      message: `${suggestions.length} optimization(s) available`,
      color: 'info.main',
      icon: '💡',
    };
  }
  
  return {
    status: 'success',
    message: 'Network configuration looks good',
    color: 'success.main',
    icon: '✅',
  };
};
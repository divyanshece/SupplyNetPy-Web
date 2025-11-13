/**
 * AI-powered insights engine for supply chain analysis
 */

export function generateInsights(simulationResults, nodes, edges, demands) {
  const insights = {
    recommendations: [],
    warnings: [],
    optimizations: [],
    keyMetrics: [],
  };

  const metrics = simulationResults.metrics;

  // === PROFITABILITY ANALYSIS ===
  if (metrics.profit < 0) {
    insights.warnings.push({
      severity: 'high',
      category: 'Financial',
      title: 'Negative Profit',
      description: `Current configuration results in a loss of $${Math.abs(metrics.profit).toLocaleString()}`,
      recommendation: 'Consider reducing holding costs, increasing sell prices, or optimizing inventory levels.',
    });
  } else if (metrics.profit > 0) {
    const profitMargin = ((metrics.profit / metrics.revenue) * 100).toFixed(1);
    if (profitMargin < 10) {
      insights.warnings.push({
        severity: 'medium',
        category: 'Financial',
        title: 'Low Profit Margin',
        description: `Current profit margin is ${profitMargin}%, which is below industry standard (15-20%)`,
        recommendation: 'Optimize transportation routes or negotiate better supplier prices.',
      });
    } else {
      insights.keyMetrics.push({
        category: 'Financial',
        metric: 'Profit Margin',
        value: `${profitMargin}%`,
        status: 'good',
      });
    }
  }

  // === INVENTORY EFFICIENCY ===
  const avgInventory = metrics.avg_available_inv || 0;
  const totalCapacity = nodes
    .filter(n => n.data.nodeType === 'distributor')
    .reduce((sum, n) => sum + (n.data.capacity || 0), 0);
  
  if (totalCapacity > 0) {
    const utilizationRate = ((avgInventory / totalCapacity) * 100).toFixed(1);
    
    if (utilizationRate < 30) {
      insights.optimizations.push({
        category: 'Inventory',
        title: 'Low Capacity Utilization',
        description: `Warehouses are only ${utilizationRate}% utilized on average`,
        recommendation: 'Consider reducing warehouse capacity or increasing demand to improve efficiency.',
        potentialSavings: (totalCapacity - avgInventory) * 0.22 * 30, // Holding cost savings
      });
    } else if (utilizationRate > 90) {
      insights.warnings.push({
        severity: 'medium',
        category: 'Inventory',
        title: 'High Capacity Utilization',
        description: `Warehouses are ${utilizationRate}% full - near maximum capacity`,
        recommendation: 'Increase warehouse capacity to prevent stockouts and improve service levels.',
      });
    } else {
      insights.keyMetrics.push({
        category: 'Inventory',
        metric: 'Capacity Utilization',
        value: `${utilizationRate}%`,
        status: 'good',
      });
    }
  }

  // === DEMAND FULFILLMENT ===
  const totalDemandUnits = metrics.total_demand?.[1] || 0;
  const shortageUnits = metrics.shortage?.[1] || 0;
  
  if (totalDemandUnits > 0) {
    const fillRate = (((totalDemandUnits - shortageUnits) / totalDemandUnits) * 100).toFixed(1);
    
    if (fillRate < 95) {
      insights.warnings.push({
        severity: 'high',
        category: 'Service Level',
        title: 'Low Fill Rate',
        description: `Only ${fillRate}% of customer demand is being fulfilled`,
        recommendation: 'Increase inventory levels, adjust reorder points, or add supplier capacity.',
      });
    } else {
      insights.keyMetrics.push({
        category: 'Service Level',
        metric: 'Fill Rate',
        value: `${fillRate}%`,
        status: 'excellent',
      });
    }
  }

  // === COST ANALYSIS ===
  const inventoryCostRatio = ((metrics.inventory_carry_cost / metrics.total_cost) * 100).toFixed(1);
  const transportCostRatio = ((metrics.transportation_cost / metrics.total_cost) * 100).toFixed(1);

  if (inventoryCostRatio > 40) {
    insights.optimizations.push({
      category: 'Cost',
      title: 'High Inventory Carrying Costs',
      description: `${inventoryCostRatio}% of total costs are from inventory holding`,
      recommendation: 'Reduce inventory levels or negotiate lower holding costs.',
      potentialSavings: metrics.inventory_carry_cost * 0.2, // 20% reduction potential
    });
  }

  if (transportCostRatio > 30) {
    insights.optimizations.push({
      category: 'Cost',
      title: 'High Transportation Costs',
      description: `${transportCostRatio}% of total costs are from transportation`,
      recommendation: 'Optimize routes, consolidate shipments, or negotiate better shipping rates.',
      potentialSavings: metrics.transportation_cost * 0.15, // 15% reduction potential
    });
  }

  // === BACKORDERS ANALYSIS ===
  const backorderUnits = metrics.backorders?.[1] || 0;
  if (backorderUnits > 0) {
    insights.warnings.push({
      severity: 'medium',
      category: 'Operations',
      title: 'Backorders Detected',
      description: `${backorderUnits.toLocaleString()} units are backordered`,
      recommendation: 'Increase safety stock levels or improve supplier lead times.',
    });
  }

  // === NETWORK TOPOLOGY ===
  const distributorCount = nodes.filter(n => n.data.nodeType === 'distributor').length;
  const supplierCount = nodes.filter(n => n.data.nodeType === 'supplier').length;
  const avgLinksPerNode = edges.length / nodes.length;

  if (supplierCount === 1 && distributorCount > 3) {
    insights.recommendations.push({
      category: 'Network Design',
      title: 'Single Point of Failure',
      description: 'Network relies on a single supplier',
      recommendation: 'Add redundant suppliers to reduce risk and improve resilience.',
    });
  }

  if (avgLinksPerNode < 1.5) {
    insights.recommendations.push({
      category: 'Network Design',
      title: 'Limited Connectivity',
      description: 'Network has sparse connections between nodes',
      recommendation: 'Add alternative routing paths to improve flexibility.',
    });
  }

  // === REPLENISHMENT POLICY ===
  const distributors = nodes.filter(n => n.data.nodeType === 'distributor');
  distributors.forEach(dist => {
    if (dist.data.replenishment_policy === 'SS') {
      const reorderPoint = dist.data.policy_s;
      const orderUpTo = dist.data.policy_S;
      const gap = orderUpTo - reorderPoint;
      
      if (gap < 200) {
        insights.recommendations.push({
          category: 'Inventory Policy',
          title: `${dist.data.label}: Small Reorder Gap`,
          description: `Gap between s and S is only ${gap} units`,
          recommendation: 'Consider increasing order-up-to level to reduce frequency of orders.',
        });
      }
    }
  });

  // === DEMAND PATTERNS ===
  if (demands.length === 0) {
    insights.warnings.push({
      severity: 'high',
      category: 'Configuration',
      title: 'No Demand Configured',
      description: 'Network has no customer demand',
      recommendation: 'Add demand sources to simulate realistic operations.',
    });
  }

  // Calculate total potential savings
  const totalPotentialSavings = insights.optimizations.reduce(
    (sum, opt) => sum + (opt.potentialSavings || 0),
    0
  );

  insights.summary = {
    totalRecommendations: insights.recommendations.length,
    totalWarnings: insights.warnings.length,
    totalOptimizations: insights.optimizations.length,
    potentialSavings: totalPotentialSavings,
    overallHealth: calculateHealthScore(insights),
  };

  return insights;
}

function calculateHealthScore(insights) {
  let score = 100;
  
  // Deduct points for issues
  score -= insights.warnings.filter(w => w.severity === 'high').length * 15;
  score -= insights.warnings.filter(w => w.severity === 'medium').length * 10;
  score -= insights.recommendations.length * 5;
  
  score = Math.max(0, Math.min(100, score));
  
  if (score >= 90) return { score, label: 'Excellent', color: '#10b981' };
  if (score >= 75) return { score, label: 'Good', color: '#3b82f6' };
  if (score >= 60) return { score, label: 'Fair', color: '#f59e0b' };
  return { score, label: 'Needs Improvement', color: '#ef4444' };
}

export function compareScenarioInsights(scenarios) {
  // Compare multiple scenarios and identify best practices
  const comparison = {
    bestProfit: null,
    bestFillRate: null,
    lowestCost: null,
    recommendations: [],
  };

  if (scenarios.length < 2) return comparison;

  // Find best performers
  let maxProfit = -Infinity;
  let maxFillRate = -Infinity;
  let minCost = Infinity;

  scenarios.forEach(scenario => {
    const profit = scenario.metrics?.profit || 0;
    const totalDemand = scenario.metrics?.total_demand?.[1] || 1;
    const shortage = scenario.metrics?.shortage?.[1] || 0;
    const fillRate = ((totalDemand - shortage) / totalDemand) * 100;
    const cost = scenario.metrics?.total_cost || Infinity;

    if (profit > maxProfit) {
      maxProfit = profit;
      comparison.bestProfit = scenario;
    }

    if (fillRate > maxFillRate) {
      maxFillRate = fillRate;
      comparison.bestFillRate = scenario;
    }

    if (cost < minCost) {
      minCost = cost;
      comparison.lowestCost = scenario;
    }
  });

  // Generate comparative recommendations
  if (comparison.bestProfit) {
    comparison.recommendations.push({
      title: 'Maximize Profit',
      description: `Scenario "${comparison.bestProfit.name}" achieved the highest profit`,
      action: 'Review and replicate the configuration of this scenario.',
    });
  }

  return comparison;
}
export const demandPatterns = {
  CONSTANT: {
    id: 'constant',
    name: 'Constant',
    description: 'Fixed interval between orders',
    icon: '📊',
    requiresParams: ['interval'],
  },
  RANDOM: {
    id: 'random',
    name: 'Random (Poisson)',
    description: 'Random arrival times with average rate',
    icon: '🎲',
    requiresParams: ['avgInterval', 'variance'],
  },
  SEASONAL: {
    id: 'seasonal',
    name: 'Seasonal',
    description: 'Fluctuating demand with peaks and valleys',
    icon: '📈',
    requiresParams: ['baseInterval', 'amplitude', 'period'],
  },
  TRENDING: {
    id: 'trending',
    name: 'Trending',
    description: 'Gradually increasing or decreasing demand',
    icon: '📉',
    requiresParams: ['startInterval', 'endInterval', 'duration'],
  },
  BURST: {
    id: 'burst',
    name: 'Burst',
    description: 'Sudden spikes in demand at intervals',
    icon: '💥',
    requiresParams: ['normalInterval', 'burstInterval', 'burstFrequency'],
  },
};

export const quantityPatterns = {
  FIXED: {
    id: 'fixed',
    name: 'Fixed Quantity',
    description: 'Same quantity every order',
    icon: '📦',
  },
  VARIABLE: {
    id: 'variable',
    name: 'Variable (Normal)',
    description: 'Quantity varies around mean',
    icon: '🔄',
    requiresParams: ['mean', 'stdDev'],
  },
  STEPPED: {
    id: 'stepped',
    name: 'Stepped',
    description: 'Different quantities at different times',
    icon: '📊',
    requiresParams: ['lowQty', 'highQty', 'threshold'],
  },
};

export const getPatternPreview = (pattern, params) => {
  // Generate sample data points for visualization
  const points = [];
  const numPoints = 20;
  
  switch (pattern) {
    case 'constant':
      for (let i = 0; i < numPoints; i++) {
        points.push({ x: i, y: params.interval || 1 });
      }
      break;
      
    case 'random':
      const avgInterval = params.avgInterval || 1;
      const variance = params.variance || 0.2;
      for (let i = 0; i < numPoints; i++) {
        const random = avgInterval + (Math.random() - 0.5) * variance * avgInterval;
        points.push({ x: i, y: Math.max(0.1, random) });
      }
      break;
      
    case 'seasonal':
      const base = params.baseInterval || 1;
      const amplitude = params.amplitude || 0.5;
      const period = params.period || 10;
      for (let i = 0; i < numPoints; i++) {
        const seasonal = base + amplitude * Math.sin((2 * Math.PI * i) / period);
        points.push({ x: i, y: Math.max(0.1, seasonal) });
      }
      break;
      
    case 'trending':
      const start = params.startInterval || 1;
      const end = params.endInterval || 2;
      for (let i = 0; i < numPoints; i++) {
        const trend = start + (end - start) * (i / numPoints);
        points.push({ x: i, y: trend });
      }
      break;
      
    case 'burst':
      const normal = params.normalInterval || 1;
      const burst = params.burstInterval || 0.2;
      const freq = params.burstFrequency || 5;
      for (let i = 0; i < numPoints; i++) {
        const isBurst = i % freq === 0;
        points.push({ x: i, y: isBurst ? burst : normal });
      }
      break;
      
    default:
      for (let i = 0; i < numPoints; i++) {
        points.push({ x: i, y: 1 });
      }
  }
  
  return points;
};
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

export function generatePDFReport(simulationResults, networkConfig, insights) {
  const doc = new jsPDF();
  
  // Add autoTable plugin check
  if (!doc.autoTable) {
    console.error('autoTable plugin not loaded');
    throw new Error('PDF generation plugin failed to load. Please refresh the page and try again.');
  }
  
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let yPos = 20;
  

  // === HEADER ===
  doc.setFillColor(25, 118, 210);
  doc.rect(0, 0, pageWidth, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('Supply Chain Simulation Report', pageWidth / 2, 20, { align: 'center' });
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth / 2, 30, { align: 'center' });

  yPos = 50;
  doc.setTextColor(0, 0, 0);

  // === EXECUTIVE SUMMARY ===
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(25, 118, 210);
  doc.text('Executive Summary', 14, yPos);
  yPos += 10;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 0, 0);

  const metrics = simulationResults.metrics;

  // Summary cards
  const summaryData = [
    ['Metric', 'Value', 'Status'],
    [
      'Net Profit',
      `$${metrics.profit?.toLocaleString() || 0}`,
      metrics.profit > 0 ? '✓ Positive' : '✗ Negative',
    ],
    [
      'Total Revenue',
      `$${metrics.revenue?.toLocaleString() || 0}`,
      '—',
    ],
    [
      'Total Cost',
      `$${metrics.total_cost?.toFixed(2) || 0}`,
      '—',
    ],
    [
      'Fill Rate',
      `${calculateFillRate(metrics)}%`,
      calculateFillRate(metrics) >= 95 ? '✓ Excellent' : '⚠ Needs Improvement',
    ],
  ];

  doc.autoTable({
    startY: yPos,
    head: [summaryData[0]],
    body: summaryData.slice(1),
    theme: 'striped',
    headStyles: { fillColor: [25, 118, 210], textColor: 255, fontStyle: 'bold' },
    margin: { left: 14, right: 14 },
  });

  yPos = doc.lastAutoTable.finalY + 15;

  // === FINANCIAL ANALYSIS ===
  checkPageBreak(doc, yPos, 60);
  
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(25, 118, 210);
  doc.text('Financial Analysis', 14, yPos);
  yPos += 10;

  const financialData = [
    ['Metric', 'Amount'],
    ['Revenue', `$${metrics.revenue?.toLocaleString() || 0}`],
    ['Inventory Carry Cost', `$${metrics.inventory_carry_cost?.toFixed(2) || 0}`],
    ['Inventory Spend Cost', `$${metrics.inventory_spend_cost?.toFixed(2) || 0}`],
    ['Transportation Cost', `$${metrics.transportation_cost?.toFixed(2) || 0}`],
    ['Total Cost', `$${metrics.total_cost?.toFixed(2) || 0}`],
    ['Net Profit', `$${metrics.profit?.toLocaleString() || 0}`],
    ['Profit Margin', `${((metrics.profit / metrics.revenue) * 100).toFixed(1)}%`],
    ['Avg Cost per Order', `$${metrics.avg_cost_per_order?.toFixed(2) || 0}`],
    ['Avg Cost per Item', `$${metrics.avg_cost_per_item?.toFixed(4) || 0}`],
  ];

  doc.autoTable({
    startY: yPos,
    head: [financialData[0]],
    body: financialData.slice(1),
    theme: 'grid',
    headStyles: { fillColor: [25, 118, 210], textColor: 255, fontStyle: 'bold' },
    margin: { left: 14, right: 14 },
    columnStyles: {
      0: { cellWidth: 100 },
      1: { cellWidth: 'auto', halign: 'right', fontStyle: 'bold' },
    },
  });

  yPos = doc.lastAutoTable.finalY + 15;

  // === INVENTORY & DEMAND ===
  doc.addPage();
  yPos = 20;

  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(25, 118, 210);
  doc.text('Inventory & Demand Analysis', 14, yPos);
  yPos += 10;

  const inventoryData = [
    ['Metric', 'Value'],
    ['Available Inventory', `${metrics.available_inv || 0} units`],
    ['Avg Available Inventory', `${metrics.avg_available_inv?.toFixed(0) || 0} units`],
    ['Total Demand (Orders)', `${metrics.total_demand?.[0] || 0}`],
    ['Total Demand (Units)', `${metrics.total_demand?.[1] || 0}`],
    ['Customer Demand (Orders)', `${metrics.demand_by_customers?.[0] || 0}`],
    ['Customer Demand (Units)', `${metrics.demand_by_customers?.[1] || 0}`],
    ['Shortage (Orders)', `${metrics.shortage?.[0] || 0}`],
    ['Shortage (Units)', `${metrics.shortage?.[1] || 0}`],
    ['Backorders (Orders)', `${metrics.backorders?.[0] || 0}`],
    ['Backorders (Units)', `${metrics.backorders?.[1] || 0}`],
    ['Fill Rate', `${calculateFillRate(metrics)}%`],
  ];

  doc.autoTable({
    startY: yPos,
    head: [inventoryData[0]],
    body: inventoryData.slice(1),
    theme: 'grid',
    headStyles: { fillColor: [139, 92, 246], textColor: 255, fontStyle: 'bold' },
    margin: { left: 14, right: 14 },
    columnStyles: {
      0: { cellWidth: 100 },
      1: { cellWidth: 'auto', halign: 'right', fontStyle: 'bold' },
    },
  });

  yPos = doc.lastAutoTable.finalY + 15;

  // === NETWORK CONFIGURATION ===
  checkPageBreak(doc, yPos, 60);

  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(25, 118, 210);
  doc.text('Network Configuration', 14, yPos);
  yPos += 10;

  const networkData = [
    ['Component', 'Count'],
    ['Total Nodes', `${networkConfig.nodes?.length || 0}`],
    ['Suppliers', `${metrics.num_suppliers || 0}`],
    ['Distributors', `${metrics.num_distributors || 0}`],
    ['Manufacturers', `${metrics.num_manufacturers || 0}`],
    ['Retailers', `${metrics.num_retailers || 0}`],
    ['Total Links', `${networkConfig.links?.length || 0}`],
    ['Customer Demands', `${networkConfig.demands?.length || 0}`],
    ['Simulation Period', `${networkConfig.sim_time || 0} days`],
  ];

  doc.autoTable({
    startY: yPos,
    head: [networkData[0]],
    body: networkData.slice(1),
    theme: 'grid',
    headStyles: { fillColor: [245, 158, 11], textColor: 255, fontStyle: 'bold' },
    margin: { left: 14, right: 14 },
    columnStyles: {
      0: { cellWidth: 100 },
      1: { cellWidth: 'auto', halign: 'right', fontStyle: 'bold' },
    },
  });

  yPos = doc.lastAutoTable.finalY + 15;

  // === INSIGHTS & RECOMMENDATIONS ===
  if (insights && (insights.warnings.length > 0 || insights.recommendations.length > 0 || insights.optimizations.length > 0)) {
    doc.addPage();
    yPos = 20;

    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(25, 118, 210);
    doc.text('Performance Insights', 14, yPos);
    yPos += 10;

    // Health Score
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Overall Health Score', 14, yPos);
    yPos += 7;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Score: ${insights.summary.overallHealth.score}/100 - ${insights.summary.overallHealth.label}`, 14, yPos);
    yPos += 10;

    // Warnings
    if (insights.warnings.length > 0) {
      checkPageBreak(doc, yPos, 40);
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(239, 68, 68);
      doc.text(`⚠ Warnings (${insights.warnings.length})`, 14, yPos);
      yPos += 7;

      doc.setTextColor(0, 0, 0);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');

      insights.warnings.forEach((warning, index) => {
        checkPageBreak(doc, yPos, 25);
        
        doc.setFont('helvetica', 'bold');
        doc.text(`${index + 1}. ${warning.title}`, 18, yPos);
        yPos += 5;
        
        doc.setFont('helvetica', 'normal');
        const descLines = doc.splitTextToSize(warning.description, pageWidth - 28);
        doc.text(descLines, 18, yPos);
        yPos += descLines.length * 4 + 2;
        
        doc.setFont('helvetica', 'italic');
        const recLines = doc.splitTextToSize(`→ ${warning.recommendation}`, pageWidth - 28);
        doc.text(recLines, 18, yPos);
        yPos += recLines.length * 4 + 6;
      });

      yPos += 5;
    }

    // Optimizations
    if (insights.optimizations.length > 0) {
      checkPageBreak(doc, yPos, 40);
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(16, 185, 129);
      doc.text(`✓ Optimization Opportunities (${insights.optimizations.length})`, 14, yPos);
      yPos += 7;

      doc.setTextColor(0, 0, 0);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');

      insights.optimizations.forEach((opt, index) => {
        checkPageBreak(doc, yPos, 30);
        
        doc.setFont('helvetica', 'bold');
        doc.text(`${index + 1}. ${opt.title}`, 18, yPos);
        yPos += 5;
        
        doc.setFont('helvetica', 'normal');
        const descLines = doc.splitTextToSize(opt.description, pageWidth - 28);
        doc.text(descLines, 18, yPos);
        yPos += descLines.length * 4 + 2;
        
        doc.setFont('helvetica', 'italic');
        const recLines = doc.splitTextToSize(`→ ${opt.recommendation}`, pageWidth - 28);
        doc.text(recLines, 18, yPos);
        yPos += recLines.length * 4 + 2;
        
        if (opt.potentialSavings > 0) {
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(16, 185, 129);
          doc.text(`   Potential Savings: $${opt.potentialSavings.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, 18, yPos);
          doc.setTextColor(0, 0, 0);
          yPos += 6;
        }
        
        yPos += 4;
      });

      yPos += 5;
    }

    // Recommendations
    if (insights.recommendations.length > 0) {
      checkPageBreak(doc, yPos, 40);
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(59, 130, 246);
      doc.text(`ℹ Recommendations (${insights.recommendations.length})`, 14, yPos);
      yPos += 7;

      doc.setTextColor(0, 0, 0);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');

      insights.recommendations.forEach((rec, index) => {
        checkPageBreak(doc, yPos, 25);
        
        doc.setFont('helvetica', 'bold');
        doc.text(`${index + 1}. ${rec.title}`, 18, yPos);
        yPos += 5;
        
        doc.setFont('helvetica', 'normal');
        const descLines = doc.splitTextToSize(rec.description, pageWidth - 28);
        doc.text(descLines, 18, yPos);
        yPos += descLines.length * 4 + 2;
        
        doc.setFont('helvetica', 'italic');
        const recLines = doc.splitTextToSize(`→ ${rec.recommendation}`, pageWidth - 28);
        doc.text(recLines, 18, yPos);
        yPos += recLines.length * 4 + 6;
      });
    }
  }

  // === FOOTER ON ALL PAGES ===
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text(
      `Page ${i} of ${pageCount}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );
    doc.text(
      'SupplyNet - Professional Supply Chain Simulation',
      14,
      pageHeight - 10
    );
  }

  return doc;
}

function calculateFillRate(metrics) {
  const totalDemand = metrics.total_demand?.[1] || 1;
  const shortage = metrics.shortage?.[1] || 0;
  return ((totalDemand - shortage) / totalDemand * 100).toFixed(1);
}

function checkPageBreak(doc, currentY, requiredSpace) {
  const pageHeight = doc.internal.pageSize.getHeight();
  if (currentY + requiredSpace > pageHeight - 20) {
    doc.addPage();
    return 20;
  }
  return currentY;
}

export function downloadPDF(doc, filename = 'supply-chain-report') {
  doc.save(`${filename}-${Date.now()}.pdf`);
}
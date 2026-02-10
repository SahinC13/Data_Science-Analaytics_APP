
import { BusinessData, BusinessStats, MonthlyGrowth, HeatmapData, DataCapabilities } from '../types';

export const validateDataCapabilities = (rows: any[], headers: string[]): DataCapabilities => {
  if (rows.length === 0) return { hasTimeData: false, hasFinancialData: false };

  // Financial Check: Look for numeric values in columns with financial headers
  const financialHeaders = headers.filter(h => 
    /revenue|amount|total|price|sales|cost|value|price/i.test(h)
  );
  
  const hasFinancialData = financialHeaders.some(h => {
    return rows.some(row => {
      const val = row[h];
      if (val === null || val === undefined) return false;
      const num = parseFloat(String(val).replace(/[^0-9.-]+/g, ""));
      return !isNaN(num);
    });
  });

  // Time Check: Scan all columns for convertible datetime objects
  const hasTimeData = headers.some(h => {
    // Optimization: Check the first few non-empty rows
    return rows.slice(0, 10).some(row => {
      const val = row[h];
      if (!val || typeof val !== 'string' && typeof val !== 'number') return false;
      // Skip purely numeric columns unless they are identified as a potential date header
      if (typeof val === 'number' && !/date|time|year|month/i.test(h)) return false;
      const d = new Date(val);
      return !isNaN(d.getTime());
    });
  });

  return { hasTimeData, hasFinancialData };
};

export const processRawData = (json: any[]): BusinessData => {
  if (json.length === 0) return { 
    headers: [], 
    rows: [], 
    stats: emptyStats(), 
    capabilities: { hasTimeData: false, hasFinancialData: false } 
  };
  
  const headers = Object.keys(json[0]);
  const capabilities = validateDataCapabilities(json, headers);
  const stats = calculateStats(json, headers, capabilities);

  return { headers, rows: json, stats, capabilities };
};

const emptyStats = (): BusinessStats => ({
  totalRevenue: 0,
  averageTransaction: 0,
  customerCount: 0,
  revenueByDate: [],
  topCustomers: [],
  monthlyGrowth: [],
  heatmap: { x: [], y: [], z: [] }
});

const calculateStats = (rows: any[], headers: string[], capabilities: DataCapabilities): BusinessStats => {
  const revenueCol = headers.find(h => /revenue|amount|total|price|sales|cost|value/i.test(h));
  const dateCol = headers.find(h => /date|time|created|period|timestamp/i.test(h));
  const itemCol = headers.find(h => /customer|name|client|user|item|product|description/i.test(h));

  let totalRevenue = 0;
  const dateMap: Record<string, number> = {};
  const monthMap: Record<string, number> = {};
  const itemMap: Record<string, number> = {};
  const customers = new Set();

  // Heatmap Aggregation
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const hours = Array.from({ length: 24 }, (_, i) => `${i}:00`);
  const heatmapZ: number[][] = days.map(() => hours.map(() => 0));

  rows.forEach(row => {
    // Only parse revenue if financial data exists
    const rev = (capabilities.hasFinancialData && revenueCol) 
      ? parseFloat(String(row[revenueCol]).replace(/[^0-9.-]+/g, "")) 
      : 0;
    
    if (!isNaN(rev)) totalRevenue += rev;

    if (itemCol && row[itemCol]) {
      const item = String(row[itemCol]);
      customers.add(item);
      itemMap[item] = (itemMap[item] || 0) + rev;
    }

    // Only process time-based mapping if capabilities allow
    if (capabilities.hasTimeData && dateCol && row[dateCol]) {
      try {
        const dateObj = new Date(row[dateCol]);
        if (!isNaN(dateObj.getTime())) {
          const dateStr = dateObj.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
          dateMap[dateStr] = (dateMap[dateStr] || 0) + rev;

          const isoMonth = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}`;
          monthMap[isoMonth] = (monthMap[isoMonth] || 0) + rev;

          const dayIdx = (dateObj.getDay() + 6) % 7; 
          const hour = dateObj.getHours();
          if (!isNaN(rev)) {
            heatmapZ[dayIdx][hour] += rev;
          }
        }
      } catch (e) {}
    }
  });

  const revenueByDate = Object.entries(dateMap).map(([date, amount]) => ({ date, amount }));
  const topCustomers = Object.entries(itemMap)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  // Only calculate Monthly Growth if both Time and Financial data exist
  let monthlyGrowth: MonthlyGrowth[] = [];
  if (capabilities.hasTimeData && capabilities.hasFinancialData) {
    const sortedMonths = Object.keys(monthMap).sort();
    monthlyGrowth = sortedMonths.map((month, index) => {
      const currentRevenue = monthMap[month];
      let growth: number | null = null;
      if (index > 0) {
        const prevRevenue = monthMap[sortedMonths[index - 1]];
        if (prevRevenue > 0) growth = ((currentRevenue - prevRevenue) / prevRevenue) * 100;
      }
      return { month, revenue: currentRevenue, growth };
    });
  }

  return {
    totalRevenue,
    averageTransaction: rows.length > 0 ? totalRevenue / rows.length : 0,
    customerCount: customers.size > 0 ? customers.size : rows.length,
    revenueByDate,
    topCustomers,
    monthlyGrowth,
    heatmap: { x: hours, y: days, z: heatmapZ }
  };
};

export const cleanData = (data: BusinessData): BusinessData => {
  const newHeaders = [...data.headers];
  const dateCol = data.headers.find(h => /date|time|created|period|timestamp/i.test(h));
  
  // Only add time features if the file has time data
  if (data.capabilities.hasTimeData && dateCol) {
    ['Month', 'Day_of_Week', 'Hour', 'Is_Weekend'].forEach(f => {
      if (!newHeaders.includes(f)) newHeaders.push(f);
    });
  }

  const cleanedRows = data.rows.map(row => {
    const newRow = { ...row };
    
    if (data.capabilities.hasTimeData && dateCol && newRow[dateCol]) {
      const d = new Date(newRow[dateCol]);
      if (!isNaN(d.getTime())) {
        newRow['Month'] = d.toLocaleString('default', { month: 'long' });
        newRow['Day_of_Week'] = d.toLocaleString('default', { weekday: 'long' });
        newRow['Hour'] = d.getHours();
        const day = d.getDay();
        newRow['Is_Weekend'] = (day === 0 || day === 6);
        newRow[dateCol] = d.toISOString().split('T')[0];
      }
    }

    data.headers.forEach(header => {
      let value = newRow[header];
      if (value === null || value === undefined || value === '') {
        if (typeof value === 'number' || /revenue|amount|price|cost/i.test(header)) {
          newRow[header] = 0;
        } else {
          newRow[header] = 'Unknown';
        }
      }
      if (typeof value === 'string') newRow[header] = value.trim();
    });
    return newRow;
  });

  return {
    ...data,
    headers: newHeaders,
    rows: cleanedRows,
    stats: calculateStats(cleanedRows, newHeaders, data.capabilities)
  };
};


export interface BusinessData {
  headers: string[];
  rows: Record<string, any>[];
  stats: BusinessStats;
  capabilities: DataCapabilities;
}

export interface DataCapabilities {
  hasTimeData: boolean;
  hasFinancialData: boolean;
}

export interface MonthlyGrowth {
  month: string;
  revenue: number;
  growth: number | null; // null for the first month
}

export interface HeatmapData {
  x: string[]; // Hours or Months
  y: string[]; // Days of Week
  z: number[][]; // Revenue density
}

export interface BusinessStats {
  totalRevenue: number;
  averageTransaction: number;
  customerCount: number;
  revenueByDate: { date: string; amount: number }[];
  topCustomers: { name: string; value: number }[];
  monthlyGrowth: MonthlyGrowth[];
  heatmap: HeatmapData;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

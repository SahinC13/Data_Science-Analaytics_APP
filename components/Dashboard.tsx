
import React, { useEffect, useRef } from 'react';
import { TrendingUp, Users, DollarSign, Award, Target, ShoppingBag, ArrowUpRight, ArrowDownRight, Clock, CalendarX, AlertCircle } from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  Cell 
} from 'recharts';
import Plotly from 'plotly.js-dist-min';
import { BusinessStats, DataCapabilities } from '../types';

interface DashboardProps {
  stats: BusinessStats;
  capabilities: DataCapabilities;
}

const Dashboard: React.FC<DashboardProps> = ({ stats, capabilities }) => {
  const COLORS = ['#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef'];
  const heatmapRef = useRef<HTMLDivElement>(null);
  const growthLineRef = useRef<HTMLDivElement>(null);

  const latestGrowth = stats.monthlyGrowth.length > 0 
    ? stats.monthlyGrowth[stats.monthlyGrowth.length - 1].growth 
    : null;

  // Plotly Heatmap Effect
  useEffect(() => {
    if (capabilities.hasTimeData && heatmapRef.current && stats.heatmap.z.length > 0) {
      const data: any[] = [{
        z: stats.heatmap.z,
        x: stats.heatmap.x,
        y: stats.heatmap.y,
        type: 'heatmap',
        colorscale: [
          [0, '#1e293b'], 
          [0.5, '#3b82f6'], 
          [1, '#60a5fa']
        ],
        showscale: false,
        hoverongaps: false,
        hovertemplate: '<b>%{y} at %{x}</b><br>Revenue: $%{z:,.2f}<extra></extra>'
      }];

      const layout: any = {
        paper_bgcolor: 'rgba(0,0,0,0)',
        plot_bgcolor: 'rgba(0,0,0,0)',
        margin: { t: 10, r: 10, b: 40, l: 80 },
        xaxis: { 
          tickfont: { color: '#94a3b8', size: 10 }, 
          gridcolor: '#334155',
          showgrid: false
        },
        yaxis: { 
          tickfont: { color: '#94a3b8', size: 10 }, 
          gridcolor: '#334155',
          autorange: 'reversed'
        },
        height: 300,
        autosize: true
      };

      Plotly.newPlot(heatmapRef.current, data, layout, { responsive: true, displayModeBar: false });
    }
  }, [stats.heatmap, capabilities.hasTimeData]);

  // Plotly Growth Line Chart Effect
  useEffect(() => {
    if (capabilities.hasTimeData && capabilities.hasFinancialData && growthLineRef.current && stats.monthlyGrowth.length > 0) {
      const growthValues = stats.monthlyGrowth.map(m => m.growth ?? 0);
      const months = stats.monthlyGrowth.map(m => m.month);

      const data: any[] = [
        {
          x: months,
          y: growthValues,
          type: 'scatter',
          mode: 'markers+lines',
          name: 'Growth Rate',
          line: { color: '#3b82f6', width: 3 },
          marker: { color: '#3b82f6', size: 8 },
          hovertemplate: '<b>%{x}</b><br>Growth: %{y:.1f}%<extra></extra>'
        },
        {
          x: months,
          y: Array(months.length).fill(5),
          type: 'scatter',
          mode: 'lines',
          name: 'Target (5%)',
          line: { color: '#ef4444', width: 2, dash: 'dash' },
          hoverinfo: 'none'
        }
      ];

      const layout: any = {
        paper_bgcolor: 'rgba(0,0,0,0)',
        plot_bgcolor: 'rgba(0,0,0,0)',
        margin: { t: 10, r: 20, b: 40, l: 40 },
        showlegend: false,
        xaxis: { 
          tickfont: { color: '#94a3b8', size: 10 }, 
          gridcolor: '#334155',
          showgrid: false
        },
        yaxis: { 
          tickfont: { color: '#94a3b8', size: 10 }, 
          gridcolor: '#334155',
          ticksuffix: '%'
        },
        height: 300,
        autosize: true
      };

      Plotly.newPlot(growthLineRef.current, data, layout, { responsive: true, displayModeBar: false });
    }
  }, [stats.monthlyGrowth, capabilities.hasTimeData, capabilities.hasFinancialData]);

  return (
    <div className="space-y-6">
      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-slate-800 border border-slate-700 p-6 rounded-2xl space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-slate-400 text-sm font-medium">Total Revenue</p>
            <div className="p-2 bg-green-500/10 rounded-lg"><DollarSign className="w-5 h-5 text-green-500" /></div>
          </div>
          <p className="text-3xl font-bold text-white">${stats.totalRevenue.toLocaleString()}</p>
          <p className="text-xs text-green-500 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            {capabilities.hasFinancialData ? 'Financial Tracking Active' : 'Calculated from items'}
          </p>
        </div>

        <div className="bg-slate-800 border border-slate-700 p-6 rounded-2xl space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-slate-400 text-sm font-medium">MoM Growth</p>
            <div className={`p-2 rounded-lg ${latestGrowth !== null && latestGrowth >= 0 ? 'bg-blue-500/10' : 'bg-red-500/10'}`}>
              <TrendingUp className={`w-5 h-5 ${latestGrowth !== null && latestGrowth >= 0 ? 'text-blue-500' : 'text-red-500'}`} />
            </div>
          </div>
          <p className="text-3xl font-bold text-white">
            {latestGrowth !== null ? `${latestGrowth.toFixed(1)}%` : 'N/A'}
          </p>
          <p className="text-xs text-slate-500">{capabilities.hasTimeData ? 'Latest month vs previous' : 'Requires date data'}</p>
        </div>

        <div className="bg-slate-800 border border-slate-700 p-6 rounded-2xl space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-slate-400 text-sm font-medium">Unique Customers</p>
            <div className="p-2 bg-indigo-500/10 rounded-lg"><Users className="w-5 h-5 text-indigo-500" /></div>
          </div>
          <p className="text-3xl font-bold text-white">{stats.customerCount.toLocaleString()}</p>
          <p className="text-xs text-slate-500">Based on unique names/IDs</p>
        </div>

        <div className="bg-slate-800 border border-slate-700 p-6 rounded-2xl space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-slate-400 text-sm font-medium">Avg. Ticket Size</p>
            <div className="p-2 bg-yellow-500/10 rounded-lg"><Target className="w-5 h-5 text-yellow-500" /></div>
          </div>
          <p className="text-3xl font-bold text-white">${stats.averageTransaction.toFixed(2)}</p>
          <p className="text-xs text-slate-500">Revenue per transaction</p>
        </div>
      </div>

      {/* Main Charts Grid with Feature Validation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profitability Heatmap (Time of Sale) */}
        <div className="bg-slate-800 border border-slate-700 p-6 rounded-2xl flex flex-col min-h-[400px]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-white">Time of Sale Heatmap</h3>
              <p className="text-sm text-slate-400">Identify your busiest hours and days</p>
            </div>
            <div className="p-2 bg-slate-700 rounded-lg"><Clock className="w-5 h-5 text-blue-400" /></div>
          </div>
          
          {capabilities.hasTimeData ? (
             <div ref={heatmapRef} className="w-full flex-1" />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-4">
              <CalendarX className="w-12 h-12 text-slate-600" />
              <div className="space-y-2">
                <p className="text-slate-300 font-medium">No Time Data Detected</p>
                <p className="text-slate-500 text-sm max-w-xs">
                  We couldn't find date information in your file to show time-based trends.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Revenue Growth Rate */}
        <div className="bg-slate-800 border border-slate-700 p-6 rounded-2xl flex flex-col min-h-[400px]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-white">Revenue Growth Rate</h3>
              <p className="text-sm text-slate-400">Monthly percentage change vs 5% target</p>
            </div>
            <div className="p-2 bg-slate-700 rounded-lg"><ArrowUpRight className="w-5 h-5 text-green-400" /></div>
          </div>

          {capabilities.hasTimeData && capabilities.hasFinancialData ? (
             <div ref={growthLineRef} className="w-full flex-1" />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-4">
              <AlertCircle className="w-12 h-12 text-slate-600" />
              <div className="space-y-2">
                <p className="text-slate-300 font-medium">Analysis Unavailable</p>
                <p className="text-slate-500 text-sm max-w-xs">
                  {!capabilities.hasTimeData 
                    ? "We couldn't find date information in your file to show time-based trends."
                    : "Financial data (Price/Revenue) is required to calculate growth rates."}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Secondary Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-800 border border-slate-700 p-6 rounded-2xl h-[350px]">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-white">Top Revenue Drivers</h3>
              <p className="text-sm text-slate-400">Highest contribution by segment</p>
            </div>
            <div className="p-2 bg-slate-700 rounded-lg"><ShoppingBag className="w-5 h-5 text-slate-300" /></div>
          </div>
          <div className="h-full pb-16">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.topCustomers} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} />
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  stroke="#94a3b8" 
                  fontSize={11} 
                  width={100} 
                  axisLine={false} 
                  tickLine={false} 
                />
                <Tooltip 
                   contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                  {stats.topCustomers.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-slate-800 border border-slate-700 p-6 rounded-2xl h-[350px] flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-white">Recent Growth Milestones</h3>
            <Award className="w-5 h-5 text-yellow-500" />
          </div>
          
          {capabilities.hasTimeData && capabilities.hasFinancialData ? (
            <div className="flex-1 overflow-y-auto space-y-3 pr-2">
              {[...stats.monthlyGrowth].reverse().map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-900/50 border border-slate-700/50">
                  <div className="space-y-0.5">
                    <p className="text-sm font-semibold text-white">{item.month}</p>
                    <p className="text-xs text-slate-500">${item.revenue.toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    {item.growth !== null ? (
                      <div className={`flex items-center gap-1 text-sm font-bold ${item.growth >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {item.growth >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                        {Math.abs(item.growth).toFixed(1)}%
                      </div>
                    ) : (
                      <span className="text-xs text-slate-600 italic">Start Point</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-500 italic text-sm text-center">
              Requires date and financial columns to display growth history.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

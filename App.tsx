
import React, { useState, useEffect } from 'react';
import { UploadCloud, LayoutDashboard, MessageSquare, Sparkles, Database, Trash2 } from 'lucide-react';
import FileUpload from './components/FileUpload';
import Dashboard from './components/Dashboard';
import ChatSidebar from './components/ChatSidebar';
import DataTable from './components/DataTable';
import { BusinessData } from './types';
import { cleanData } from './services/dataService';

const App: React.FC = () => {
  const [data, setData] = useState<BusinessData | null>(null);
  const [isCleaning, setIsCleaning] = useState(false);
  const [view, setView] = useState<'dashboard' | 'table'>('dashboard');

  const handleDataLoaded = (loadedData: BusinessData) => {
    setData(loadedData);
  };

  const handleAutoClean = () => {
    if (!data) return;
    setIsCleaning(true);
    // Simulate processing time
    setTimeout(() => {
      const cleaned = cleanData(data);
      setData(cleaned);
      setIsCleaning(false);
    }, 1200);
  };

  const clearData = () => {
    setData(null);
  };

  return (
    <div className="flex flex-col h-screen bg-slate-900 text-slate-100 font-sans overflow-hidden">
      {/* Header */}
      <header className="h-16 border-b border-slate-800 flex items-center justify-between px-6 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="bg-blue-600 p-1.5 rounded-lg">
            <Database className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white">BizData <span className="text-blue-500">Insights</span></h1>
        </div>

        <div className="flex items-center gap-4">
          {data && (
            <div className="flex bg-slate-800 p-1 rounded-lg">
              <button 
                onClick={() => setView('dashboard')}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${view === 'dashboard' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
              >
                Dashboard
              </button>
              <button 
                onClick={() => setView('table')}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${view === 'table' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
              >
                Raw Data
              </button>
            </div>
          )}
          {data && (
             <button 
             onClick={clearData}
             className="flex items-center gap-2 px-3 py-1.5 text-sm text-slate-400 hover:text-red-400 transition-colors"
           >
             <Trash2 className="w-4 h-4" />
             Reset
           </button>
          )}
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          {!data ? (
            <div className="h-full flex flex-col items-center justify-center max-w-2xl mx-auto text-center space-y-6">
              <div className="p-4 bg-blue-500/10 rounded-full border border-blue-500/20">
                <UploadCloud className="w-12 h-12 text-blue-400" />
              </div>
              <div className="space-y-2">
                <h2 className="text-3xl font-bold text-white">Unlock Your Business Potential</h2>
                <p className="text-slate-400 text-lg">
                  Upload your sales, customers, or inventory spreadsheet. We'll turn your messy data into clear, actionable growth strategies.
                </p>
              </div>
              <FileUpload onDataLoaded={handleDataLoaded} />
              <div className="grid grid-cols-3 gap-4 w-full pt-8 border-t border-slate-800">
                <div className="text-center">
                  <p className="text-2xl font-bold text-white">100%</p>
                  <p className="text-xs text-slate-500 uppercase tracking-widest">Privacy Secured</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-white">Fast</p>
                  <p className="text-xs text-slate-500 uppercase tracking-widest">Automatic Cleanup</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-white">Smart</p>
                  <p className="text-xs text-slate-500 uppercase tracking-widest">AI Consultant</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="max-w-7xl mx-auto w-full space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-800/50 p-6 rounded-2xl border border-slate-800">
                <div className="space-y-1">
                  <h2 className="text-2xl font-bold text-white">Welcome back to your data!</h2>
                  <p className="text-slate-400">Successfully loaded {data.rows.length} records.</p>
                </div>
                <button 
                  onClick={handleAutoClean}
                  disabled={isCleaning}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all shadow-xl
                    ${isCleaning 
                      ? 'bg-slate-700 text-slate-400 cursor-not-allowed' 
                      : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:scale-105 active:scale-95 hover:shadow-blue-500/20'}`}
                >
                  <Sparkles className={`w-5 h-5 ${isCleaning ? 'animate-spin' : ''}`} />
                  {isCleaning ? 'Cleaning your data...' : 'Auto-Clean Data'}
                </button>
              </div>

              {view === 'dashboard' ? (
                <Dashboard stats={data.stats} capabilities={data.capabilities} />
              ) : (
                <DataTable headers={data.headers} rows={data.rows} />
              )}
            </div>
          )}
        </main>

        {/* Chat Sidebar */}
        {data && (
          <aside className="w-96 border-l border-slate-800 bg-slate-900 hidden lg:flex flex-col">
            <ChatSidebar businessData={data} />
          </aside>
        )}
      </div>
    </div>
  );
};

export default App;

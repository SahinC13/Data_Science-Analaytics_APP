
import React, { useRef, useState } from 'react';
import { Upload, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import * as XLSX from 'xlsx';
import { BusinessData } from '../types';
import { processRawData } from '../services/dataService';

interface FileUploadProps {
  onDataLoaded: (data: BusinessData) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onDataLoaded }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(sheet) as any[];

        if (json.length === 0) {
          throw new Error("The file appears to be empty.");
        }

        const businessData = processRawData(json);
        onDataLoaded(businessData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to process file. Please try a valid CSV or Excel file.");
      } finally {
        setLoading(false);
      }
    };

    reader.onerror = () => {
      setError("Error reading file.");
      setLoading(false);
    };

    reader.readAsBinaryString(file);
  };

  return (
    <div className="w-full">
      <div 
        onClick={() => fileInputRef.current?.click()}
        className={`group relative border-2 border-dashed rounded-2xl p-10 cursor-pointer transition-all hover:bg-slate-800/50 
          ${error ? 'border-red-500/50 bg-red-500/5' : 'border-slate-700 hover:border-blue-500/50'}`}
      >
        <input 
          type="file" 
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".csv, .xlsx, .xls"
          className="hidden"
        />
        
        <div className="flex flex-col items-center gap-4">
          <div className={`p-4 rounded-2xl bg-slate-800 group-hover:scale-110 transition-transform ${error ? 'text-red-400' : 'text-blue-400'}`}>
            {loading ? <div className="w-8 h-8 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" /> : <Upload className="w-8 h-8" />}
          </div>
          <div className="space-y-1 text-center">
            <p className="text-lg font-semibold text-white">Click to upload or drag and drop</p>
            <p className="text-sm text-slate-500">CSV, XLS, or XLSX files (Max. 10MB)</p>
          </div>
        </div>

        {loading && (
          <div className="absolute inset-0 bg-slate-900/60 rounded-2xl flex items-center justify-center backdrop-blur-sm">
            <div className="flex items-center gap-3 bg-slate-800 p-4 rounded-xl shadow-2xl border border-slate-700">
              <div className="w-5 h-5 border-2 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
              <span className="font-medium">Analyzing your spreadsheet...</span>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-2 text-red-400 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      <div className="mt-6 flex flex-wrap justify-center gap-6">
        <div className="flex items-center gap-2 text-slate-400 text-sm">
          <CheckCircle2 className="w-4 h-4 text-green-500" />
          No complex setup
        </div>
        <div className="flex items-center gap-2 text-slate-400 text-sm">
          <CheckCircle2 className="w-4 h-4 text-green-500" />
          Instant visualization
        </div>
        <div className="flex items-center gap-2 text-slate-400 text-sm">
          <CheckCircle2 className="w-4 h-4 text-green-500" />
          Easy data export
        </div>
      </div>
    </div>
  );
};

export default FileUpload;

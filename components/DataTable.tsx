
import React from 'react';

interface DataTableProps {
  headers: string[];
  rows: Record<string, any>[];
}

const DataTable: React.FC<DataTableProps> = ({ headers, rows }) => {
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden shadow-xl">
      <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
        <table className="w-full text-left border-collapse">
          <thead className="sticky top-0 bg-slate-700/80 backdrop-blur-md z-10">
            <tr>
              {headers.map((header) => (
                <th key={header} className="px-4 py-3 text-xs font-bold text-slate-300 uppercase tracking-wider border-b border-slate-600">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {rows.slice(0, 100).map((row, idx) => (
              <tr key={idx} className="hover:bg-slate-700/30 transition-colors">
                {headers.map((header) => (
                  <td key={header} className="px-4 py-3 text-sm text-slate-300 whitespace-nowrap">
                    {String(row[header] ?? '')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {rows.length > 100 && (
        <div className="px-6 py-4 bg-slate-900/50 text-center border-t border-slate-700">
          <p className="text-xs text-slate-500 italic">Showing first 100 rows for performance</p>
        </div>
      )}
    </div>
  );
};

export default DataTable;

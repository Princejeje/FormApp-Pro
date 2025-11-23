import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Download, Table as TableIcon, BarChart3, Clock, FileCheck } from 'lucide-react';
import { getFormById, getFormSubmissions } from '../services/api';
import { Form, Submission, FormField } from '../types';

const Submissions: React.FC = () => {
  const { id } = useParams();
  const [form, setForm] = useState<Form | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      Promise.all([
        getFormById(id),
        getFormSubmissions(id)
      ]).then(([f, s]) => {
        setForm(f || null);
        setSubmissions(s);
        setLoading(false);
      });
    }
  }, [id]);

  const downloadCSV = () => {
    if (!form || submissions.length === 0) return;

    // Headers: "Submission Date", then all field labels
    const headers = ["Submitted At", ...form.fields.map(f => `"${f.label}"`)];
    
    // Rows
    const rows = submissions.map(sub => {
      const date = new Date(sub.submittedAt).toLocaleString();
      const values = form.fields.map(f => {
        const val = sub.data[f.id] || "";
        // Escape quotes for CSV
        return `"${String(val).replace(/"/g, '""')}"`;
      });
      return [date, ...values].join(",");
    });

    const csvContent = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${form.title.replace(/\s+/g, '_')}_submissions.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- Analytics Helper ---
  const renderAnalytics = () => {
    if(!form || submissions.length === 0) return null;

    // Filter fields relevant for charts (select, checkbox)
    const chartableFields = form.fields.filter(f => f.type === 'select' || f.type === 'checkbox');
    
    if (chartableFields.length === 0) return null;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {chartableFields.map(field => {
                // Calculate frequency
                const counts: Record<string, number> = {};
                submissions.forEach(sub => {
                    const val = String(sub.data[field.id] || "No Answer");
                    counts[val] = (counts[val] || 0) + 1;
                });
                
                const total = submissions.length;
                const sortedKeys = Object.keys(counts).sort((a,b) => counts[b] - counts[a]); // Sort desc

                return (
                    <div key={field.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                        <h4 className="text-sm font-bold text-slate-700 mb-4">{field.label}</h4>
                        <div className="space-y-3">
                            {sortedKeys.map(key => {
                                const count = counts[key];
                                const percent = Math.round((count / total) * 100);
                                return (
                                    <div key={key}>
                                        <div className="flex justify-between text-xs text-slate-500 mb-1">
                                            <span>{key}</span>
                                            <span>{count} ({percent}%)</span>
                                        </div>
                                        <div className="w-full bg-slate-100 rounded-full h-2">
                                            <div 
                                                className="bg-primary h-2 rounded-full transition-all duration-500" 
                                                style={{ width: `${percent}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )
            })}
        </div>
    )
  };

  if (loading) return <div className="p-8 text-center">Loading data...</div>;
  if (!form) return <div className="p-8">Form not found.</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-8">
        <Link to="/dashboard" className="text-slate-500 hover:text-slate-800 p-1 rounded-full hover:bg-slate-100 transition inline-block w-min">
            <ArrowLeft size={24} />
        </Link>
        <div>
            <h1 className="text-2xl font-bold text-slate-900">{form.title}</h1>
            <p className="text-slate-500 text-sm">Reviewing submissions</p>
        </div>
        <div className="sm:ml-auto">
            <button 
                onClick={downloadCSV}
                disabled={submissions.length === 0}
                className="flex items-center gap-2 bg-white border border-slate-300 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-sm font-medium"
            >
                <Download size={18} />
                Export CSV
            </button>
        </div>
      </div>

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                  <FileCheck size={24} />
              </div>
              <div>
                  <div className="text-slate-500 text-xs font-medium uppercase tracking-wider">Total Responses</div>
                  <div className="text-2xl font-bold text-slate-900">{submissions.length}</div>
              </div>
          </div>
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
               <div className="p-3 bg-purple-50 text-purple-600 rounded-lg">
                  <BarChart3 size={24} />
              </div>
              <div>
                  <div className="text-slate-500 text-xs font-medium uppercase tracking-wider">Completion Rate</div>
                  <div className="text-2xl font-bold text-slate-900">100%</div>
              </div>
          </div>
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
               <div className="p-3 bg-orange-50 text-orange-600 rounded-lg">
                  <Clock size={24} />
              </div>
              <div>
                  <div className="text-slate-500 text-xs font-medium uppercase tracking-wider">Last Submission</div>
                  <div className="text-lg font-bold text-slate-900 truncate">
                      {submissions.length > 0 ? new Date(submissions[0].submittedAt).toLocaleDateString() : 'N/A'}
                  </div>
              </div>
          </div>
      </div>

      {/* Analytics Charts */}
      {submissions.length > 0 && (
          <>
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2"><BarChart3 size={20}/> Response Insights</h3>
            {renderAnalytics()}
          </>
      )}

      {/* Data Table */}
      <div className="bg-white shadow-sm border border-slate-200 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h3 className="font-bold text-slate-700">Detailed Responses</h3>
        </div>
        {submissions.length === 0 ? (
            <div className="p-16 text-center text-slate-500">
                <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <TableIcon size={32} className="text-slate-300" />
                </div>
                <h3 className="text-lg font-medium text-slate-700">No submissions yet</h3>
                <p className="max-w-xs mx-auto mt-2">Share your form link to start collecting data.</p>
            </div>
        ) : (
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                                Date
                            </th>
                            {form.fields.map(field => (
                                <th key={field.id} className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap min-w-[150px]">
                                    {field.label}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                        {submissions.map(sub => (
                            <tr key={sub.id} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-500">
                                    <div className="font-medium text-slate-700">{new Date(sub.submittedAt).toLocaleDateString()}</div>
                                    <div className="text-slate-400">{new Date(sub.submittedAt).toLocaleTimeString()}</div>
                                </td>
                                {form.fields.map(field => (
                                    <td key={field.id} className="px-6 py-4 text-sm text-slate-700 max-w-xs truncate" title={String(sub.data[field.id])}>
                                        {String(sub.data[field.id] || "-")}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )}
      </div>
    </div>
  );
};

export default Submissions;
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Eye, Edit, Trash2, FileText, Download, Link as LinkIcon, Check, MoreHorizontal, AlertTriangle } from 'lucide-react';
import { getForms, deleteForm, getSession } from '../services/api';
import { Form } from '../types';

const Dashboard: React.FC = () => {
  const [forms, setForms] = useState<Form[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const navigate = useNavigate();
  const session = getSession();

  useEffect(() => {
    if (!session) {
      navigate('/login');
      return;
    }

    const loadForms = async () => {
      try {
        const data = await getForms(session.user.id);
        setForms(data);
      } catch (error) {
        console.error("Failed to load forms");
      } finally {
        setLoading(false);
      }
    };

    loadForms();
  }, [session, navigate]);

  const confirmDelete = async () => {
    if (deleteId) {
      await deleteForm(deleteId);
      setForms(forms.filter(f => f.id !== deleteId));
      setDeleteId(null);
    }
  };

  const copyToClipboard = (id: string) => {
    const url = `${window.location.origin}/#/form/${id}`;
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (loading) return <div className="p-8 text-center text-slate-500">Loading dashboard...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Forms</h1>
          <p className="text-slate-500 text-sm">Manage your forms and view submissions</p>
        </div>
        <Link 
          to="/builder/new" 
          className="bg-primary hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 text-sm font-medium transition shadow-sm"
        >
          <Plus size={18} />
          Create New Form
        </Link>
      </div>

      {forms.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center max-w-lg mx-auto mt-10">
          <div className="mx-auto w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mb-4">
            <FileText className="text-primary" size={32} />
          </div>
          <h3 className="text-lg font-medium text-slate-900">No forms created yet</h3>
          <p className="text-slate-500 mt-2 mb-8">Start collecting data by creating your first form in seconds.</p>
          <Link to="/builder/new" className="text-primary font-medium hover:underline inline-flex items-center gap-1">
            Create a form <Plus size={16}/>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {forms.map(form => (
            <div key={form.id} className="bg-white rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-all duration-200 flex flex-col group">
              <div className="p-6 flex-grow">
                <div className="flex justify-between items-start mb-3">
                  <div className="bg-indigo-50 text-indigo-600 rounded-lg p-2">
                     <FileText size={20} />
                  </div>
                  <div className="relative">
                      {/* Status indicator */}
                      <span className="flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                      </span>
                  </div>
                </div>
                
                <h3 className="text-lg font-bold text-slate-800 truncate mb-1" title={form.title}>{form.title}</h3>
                <p className="text-slate-500 text-sm line-clamp-2 h-10 mb-4">{form.description || "No description provided."}</p>
                
                <div className="flex items-center gap-4 text-xs text-slate-400 mt-auto">
                    <span>{new Date(form.createdAt).toLocaleDateString()}</span>
                    <span>•</span>
                    <span>{form.fields.length} Fields</span>
                </div>
              </div>
              
              <div className="bg-slate-50 px-4 py-3 border-t border-slate-100 flex justify-between items-center rounded-b-xl">
                <div className="flex gap-1">
                  <Link 
                    to={`/form/${form.id}`} 
                    target="_blank"
                    className="p-2 text-slate-500 hover:text-primary hover:bg-white rounded-md transition tooltip-trigger" 
                    title="View Public Form"
                  >
                    <Eye size={18} />
                  </Link>
                  <Link 
                    to={`/builder/${form.id}`} 
                    className="p-2 text-slate-500 hover:text-accent hover:bg-white rounded-md transition" 
                    title="Edit Form"
                  >
                    <Edit size={18} />
                  </Link>
                  <Link 
                    to={`/submissions/${form.id}`} 
                    className="p-2 text-slate-500 hover:text-emerald-600 hover:bg-white rounded-md transition" 
                    title="View Submissions"
                  >
                    <Download size={18} />
                  </Link>
                </div>
                
                <div className="flex items-center gap-1 border-l border-slate-200 pl-2 ml-2">
                    <button 
                        onClick={() => copyToClipboard(form.id)}
                        className={`p-2 rounded-md transition flex items-center gap-1 text-xs font-medium ${copiedId === form.id ? 'text-green-600 bg-green-50' : 'text-slate-500 hover:text-slate-800 hover:bg-white'}`}
                        title="Copy Public Link"
                    >
                        {copiedId === form.id ? <Check size={18}/> : <LinkIcon size={18} />}
                    </button>
                    <button 
                        onClick={() => setDeleteId(form.id)} 
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-white rounded-md transition"
                        title="Delete"
                    >
                        <Trash2 size={18} />
                    </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Form Modal */}
      {deleteId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
              <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6 animate-in zoom-in duration-200">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4 text-red-600">
                      <AlertTriangle size={24} />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">Delete Form?</h3>
                  <p className="text-slate-500 text-sm mb-6">Are you sure you want to delete this form? All collected data will be lost forever.</p>
                  <div className="flex gap-3 justify-end">
                      <button 
                          onClick={() => setDeleteId(null)}
                          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium transition"
                      >
                          Cancel
                      </button>
                      <button 
                          onClick={confirmDelete}
                          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition"
                      >
                          Delete Form
                      </button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default Dashboard;
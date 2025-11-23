import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Save, Plus, Trash, Sparkles, Loader2, ArrowLeft, ArrowUp, ArrowDown, Eye, Edit3, X, Copy, ChevronDown, ChevronRight, Settings, AlertTriangle } from 'lucide-react';
import { createForm, getFormById, getSession, updateForm } from '../services/api';
import { generateFormSchema } from '../services/geminiService';
import { Form, FormField, FieldType } from '../types';

const FormBuilder: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const session = getSession();
  
  const [title, setTitle] = useState('Untitled Form');
  const [description, setDescription] = useState('');
  const [fields, setFields] = useState<FormField[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [showAiModal, setShowAiModal] = useState(false);
  
  // UX State
  const [viewMode, setViewMode] = useState<'edit' | 'preview'>('edit');
  const [collapsedFields, setCollapsedFields] = useState<Set<string>>(new Set());
  const [deleteConfirmation, setDeleteConfirmation] = useState<string | null>(null);

  useEffect(() => {
    if (!session) {
      navigate('/login');
      return;
    }

    if (id === 'new') {
      setLoading(false);
    } else if (id) {
      getFormById(id).then(form => {
        if (form) {
          setTitle(form.title);
          setDescription(form.description || '');
          setFields(form.fields);
        }
        setLoading(false);
      });
    }
  }, [id, session, navigate]);

  const addField = (type: FieldType) => {
    const newField: FormField = {
      id: `field_${Date.now()}`,
      type,
      label: `New ${type} field`,
      required: false,
      options: type === 'select' ? ['Option 1', 'Option 2'] : undefined,
      placeholder: '',
      helpText: '',
      validation: {}
    };
    setFields([...fields, newField]);
  };

  const duplicateField = (field: FormField) => {
    const newField: FormField = {
      ...field,
      id: `field_${Date.now()}_copy`,
      label: `${field.label} (Copy)`
    };
    // Insert after current field
    const index = fields.findIndex(f => f.id === field.id);
    const newFields = [...fields];
    newFields.splice(index + 1, 0, newField);
    setFields(newFields);
  };

  const removeField = (fieldId: string) => {
    setFields(fields.filter(f => f.id !== fieldId));
    setDeleteConfirmation(null);
  };

  const updateField = (fieldId: string, updates: Partial<FormField>) => {
    setFields(fields.map(f => f.id === fieldId ? { ...f, ...updates } : f));
  };

  const updateValidation = (fieldId: string, rule: 'min' | 'max' | 'minLength' | 'maxLength', value: string) => {
    const numValue = value === '' ? undefined : Number(value);
    setFields(fields.map(f => {
      if (f.id === fieldId) {
        return {
          ...f,
          validation: {
            ...f.validation,
            [rule]: numValue
          }
        };
      }
      return f;
    }));
  };

  const moveField = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === fields.length - 1) return;

    const newFields = [...fields];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    [newFields[index], newFields[targetIndex]] = [newFields[targetIndex], newFields[index]];
    setFields(newFields);
  };

  const toggleCollapse = (fieldId: string) => {
    const newSet = new Set(collapsedFields);
    if (newSet.has(fieldId)) {
      newSet.delete(fieldId);
    } else {
      newSet.add(fieldId);
    }
    setCollapsedFields(newSet);
  };

  const handleSave = async () => {
    if (!session) return;
    
    try {
      if (id === 'new') {
        const newForm = await createForm(session.user.id, title, description);
        newForm.fields = fields;
        await updateForm(newForm); // Update immediately with fields
        navigate('/dashboard');
      } else if (id) {
        const existing = await getFormById(id);
        if(existing) {
            const updatedForm: Form = {
                ...existing,
                title,
                description,
                fields
            };
            await updateForm(updatedForm);
            alert('Form saved successfully!');
        }
      }
    } catch (e) {
      alert('Error saving form');
    }
  };

  const handleAiGenerate = async () => {
    if (!aiPrompt.trim()) return;
    setIsAiLoading(true);
    try {
      const generatedFields = await generateFormSchema(aiPrompt);
      if (generatedFields.length > 0) {
        setFields([...fields, ...generatedFields]);
        setShowAiModal(false);
        setAiPrompt('');
      } else {
        alert('Could not generate fields. Try a different description.');
      }
    } catch (e) {
      alert('AI generation failed. Please check your API key.');
    } finally {
      setIsAiLoading(false);
    }
  };

  // --- Preview Component Renderer ---
  const renderPreviewField = (field: FormField) => {
    return (
      <div key={field.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-4">
        <label className="block text-base font-medium text-slate-900 mb-1">
          {field.label} {field.required && <span className="text-red-500">*</span>}
        </label>
        {field.helpText && <p className="text-sm text-slate-500 mb-2">{field.helpText}</p>}
        
        {field.type === 'textarea' ? (
          <textarea
            disabled
            placeholder={field.placeholder}
            className="w-full bg-slate-50 border-slate-300 rounded-lg shadow-sm focus:border-primary focus:ring-primary min-h-[80px] text-slate-900 placeholder:text-slate-400"
          />
        ) : field.type === 'select' ? (
          <select disabled className="w-full bg-slate-50 border-slate-300 rounded-lg shadow-sm text-slate-900">
            <option>Select an option...</option>
            {field.options?.map(opt => <option key={opt}>{opt}</option>)}
          </select>
        ) : field.type === 'checkbox' ? (
          <div className="flex items-center gap-3 mt-2">
              <input type="checkbox" disabled className="w-5 h-5 border-slate-300 rounded text-primary" />
              <span className="text-slate-700 text-sm">Yes, I confirm</span>
          </div>
        ) : (
          <input
            type={field.type}
            disabled
            placeholder={field.placeholder}
            className="w-full bg-slate-50 border-slate-300 rounded-lg shadow-sm text-slate-900 placeholder:text-slate-400"
          />
        )}
      </div>
    );
  };

  if (loading) return <div className="flex justify-center items-center h-screen"><Loader2 className="animate-spin text-primary" /></div>;

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* Builder Header */}
      <div className="bg-white border-b border-slate-200 px-4 py-3 flex justify-between items-center sticky top-0 z-20 shadow-sm">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/dashboard')} className="text-slate-500 hover:text-slate-800 transition">
            <ArrowLeft size={20} />
          </button>
          <div className="flex flex-col">
             <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Editing Form</span>
             <span className="text-sm font-bold text-slate-800 truncate max-w-[200px]">{title}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
            {/* View Mode Toggle */}
            <div className="hidden md:flex bg-slate-100 rounded-lg p-1 mr-4">
                <button 
                    onClick={() => setViewMode('edit')}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-2 transition ${viewMode === 'edit' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    <Edit3 size={14} /> Editor
                </button>
                <button 
                    onClick={() => setViewMode('preview')}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-2 transition ${viewMode === 'preview' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    <Eye size={14} /> Preview
                </button>
            </div>

           <button 
            onClick={() => setShowAiModal(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition shadow-md shadow-indigo-200"
          >
            <Sparkles size={16} />
            <span className="hidden sm:inline">AI Build</span>
          </button>
          <button 
            onClick={handleSave}
            className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 transition shadow-md"
          >
            <Save size={16} />
            <span className="hidden sm:inline">Save</span>
          </button>
        </div>
      </div>

      <div className="flex-grow flex flex-col md:flex-row max-w-7xl mx-auto w-full p-4 gap-6 relative">
        
        {/* Main Canvas */}
        <div className="flex-grow flex flex-col gap-4 max-w-4xl mx-auto w-full">
          
          {/* Form Header Card */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 border-t-8 border-t-primary overflow-hidden">
             <div className="p-8">
                {viewMode === 'edit' ? (
                    <div className="space-y-5">
                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Form Title</label>
                          <input 
                              type="text" 
                              value={title} 
                              onChange={(e) => setTitle(e.target.value)}
                              className="w-full text-2xl font-bold text-slate-900 bg-slate-50 border border-slate-200 focus:border-primary focus:ring-primary rounded-lg px-4 py-3 transition-all placeholder:text-slate-400"
                              placeholder="e.g. Customer Satisfaction Survey"
                          />
                        </div>
                        <div>
                           <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Form Description</label>
                           <textarea 
                              className="w-full text-base text-slate-900 bg-slate-50 border border-slate-200 focus:border-primary focus:ring-primary rounded-lg px-4 py-3 resize-none placeholder:text-slate-400 min-h-[100px] transition-all"
                              placeholder="Describe the purpose of this form so users know what to expect..."
                              rows={3}
                              value={description}
                              onChange={(e) => setDescription(e.target.value)}
                          />
                        </div>
                    </div>
                ) : (
                    <div className="space-y-2">
                        <h1 className="text-3xl font-bold text-slate-900">{title}</h1>
                        <p className="text-slate-700 whitespace-pre-line text-lg leading-relaxed">{description || "No description provided."}</p>
                    </div>
                )}
             </div>
          </div>

          {viewMode === 'preview' ? (
            /* PREVIEW MODE */
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                {fields.length === 0 ? (
                    <div className="text-center py-12 text-slate-400">Nothing to preview yet. Add some fields!</div>
                ) : (
                    fields.map(renderPreviewField)
                )}
                {fields.length > 0 && (
                     <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex justify-between items-center">
                         <span className="text-sm text-slate-400 italic">This is a preview. Data will not be saved.</span>
                         <button disabled className="bg-primary/80 text-white font-semibold py-2 px-6 rounded-lg cursor-not-allowed">
                            Submit Form
                        </button>
                    </div>
                )}
            </div>
          ) : (
            /* EDIT MODE */
            fields.length === 0 ? (
                <div className="bg-white/50 border-2 border-dashed border-slate-300 rounded-xl p-16 text-center text-slate-400 flex flex-col items-center justify-center gap-4">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
                        <Plus size={32} className="text-slate-300"/>
                    </div>
                    <div>
                        <p className="font-medium text-slate-600 text-lg">Your form is empty</p>
                        <p className="text-sm">Add fields from the sidebar or use the AI generator.</p>
                    </div>
                </div>
            ) : (
                <div className="space-y-4 pb-20">
                    {fields.map((field, index) => {
                      const isCollapsed = collapsedFields.has(field.id);
                      return (
                        <div key={field.id} className="bg-white rounded-xl shadow-sm border border-slate-200 group transition-all duration-200 hover:shadow-md hover:border-indigo-200 relative">
                            {/* Drag Handle Color Strip */}
                            <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-transparent group-hover:bg-primary rounded-l-xl transition-colors"></div>
                            
                            {/* Card Header (Always Visible) */}
                            <div className="px-6 py-4 flex items-center justify-between cursor-pointer border-b border-transparent" onClick={() => toggleCollapse(field.id)}>
                                <div className="flex items-center gap-3 overflow-hidden">
                                  <button className="text-slate-400 hover:text-slate-600 transition">
                                    {isCollapsed ? <ChevronRight size={18} /> : <ChevronDown size={18} />}
                                  </button>
                                  <div className="flex flex-col">
                                    <span className="text-sm font-bold text-slate-900 truncate max-w-[200px] sm:max-w-md">{field.label}</span>
                                    {isCollapsed && <span className="text-xs text-slate-500 uppercase">{field.type} {field.required ? '• Required' : ''}</span>}
                                  </div>
                                </div>
                                
                                <div className="flex items-center bg-slate-50 rounded-lg p-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
                                    <button 
                                        onClick={() => moveField(index, 'up')} 
                                        disabled={index === 0}
                                        className="p-1.5 text-slate-400 hover:text-slate-700 disabled:opacity-30 hover:bg-white rounded-md transition"
                                        title="Move Up"
                                    >
                                        <ArrowUp size={16} />
                                    </button>
                                    <button 
                                        onClick={() => moveField(index, 'down')} 
                                        disabled={index === fields.length - 1}
                                        className="p-1.5 text-slate-400 hover:text-slate-700 disabled:opacity-30 hover:bg-white rounded-md transition"
                                        title="Move Down"
                                    >
                                        <ArrowDown size={16} />
                                    </button>
                                    <div className="h-4 w-px bg-slate-200 mx-1"></div>
                                    <button 
                                        onClick={() => duplicateField(field)}
                                        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-md transition"
                                        title="Duplicate Field"
                                    >
                                        <Copy size={16} />
                                    </button>
                                    <button 
                                        onClick={() => setDeleteConfirmation(field.id)}
                                        className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-white rounded-md transition"
                                        title="Delete Field"
                                    >
                                        <Trash size={16} />
                                    </button>
                                </div>
                            </div>

                            {/* Card Body (Collapsible) */}
                            {!isCollapsed && (
                              <div className="p-6 pt-0 border-t border-slate-100 mt-4">
                                  <div className="grid grid-cols-1 gap-4">
                                      <div>
                                          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 block">Question Label</label>
                                          <input 
                                              type="text" 
                                              value={field.label} 
                                              onChange={(e) => updateField(field.id, { label: e.target.value })}
                                              className="w-full text-base font-medium text-slate-900 bg-slate-50 border-slate-200 rounded-lg shadow-sm focus:border-primary focus:ring-primary px-3 py-2 placeholder:text-slate-400"
                                              placeholder="Enter your question here..."
                                          />
                                      </div>
                                      
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                          <div>
                                              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 block">Placeholder Text</label>
                                              <input 
                                                  type="text" 
                                                  value={field.placeholder || ''} 
                                                  onChange={(e) => updateField(field.id, { placeholder: e.target.value })}
                                                  className="w-full border-slate-200 bg-slate-50 rounded-md text-sm text-slate-900 placeholder:text-slate-500 focus:border-primary focus:ring-primary"
                                                  placeholder="Example answer..."
                                                  disabled={field.type === 'select' || field.type === 'checkbox'}
                                              />
                                          </div>
                                          <div>
                                              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 block">Help Text</label>
                                              <input 
                                                  type="text" 
                                                  value={field.helpText || ''} 
                                                  onChange={(e) => updateField(field.id, { helpText: e.target.value })}
                                                  className="w-full border-slate-200 bg-slate-50 rounded-md text-sm text-slate-900 placeholder:text-slate-500 focus:border-primary focus:ring-primary"
                                                  placeholder="e.g. Please enter your full name as it appears on ID"
                                              />
                                          </div>
                                      </div>

                                      {/* Specific Options based on type */}
                                      {field.type === 'select' && (
                                          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                                              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">Dropdown Options</label>
                                              <textarea
                                                  value={field.options?.join(', ')} 
                                                  onChange={(e) => updateField(field.id, { options: e.target.value.split(',').map(s => s.trim()) })}
                                                  className="w-full border-slate-200 rounded-md text-sm focus:border-primary focus:ring-primary text-slate-900 bg-white"
                                                  rows={2}
                                                  placeholder="Option 1, Option 2, Option 3 (comma separated)"
                                              />
                                          </div>
                                      )}

                                      {/* Validation Settings */}
                                      <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                                        <div className="flex items-center gap-2 mb-3">
                                          <Settings size={14} className="text-slate-500" />
                                          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Validation Rules</span>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                          {(field.type === 'number') && (
                                            <>
                                              <div>
                                                <label className="text-xs text-slate-500 mb-1 block">Min Value</label>
                                                <input type="number" className="w-full border-slate-200 rounded text-sm h-9 bg-white text-slate-900" 
                                                  value={field.validation?.min ?? ''} 
                                                  onChange={(e) => updateValidation(field.id, 'min', e.target.value)}
                                                />
                                              </div>
                                              <div>
                                                <label className="text-xs text-slate-500 mb-1 block">Max Value</label>
                                                <input type="number" className="w-full border-slate-200 rounded text-sm h-9 bg-white text-slate-900" 
                                                  value={field.validation?.max ?? ''} 
                                                  onChange={(e) => updateValidation(field.id, 'max', e.target.value)}
                                                />
                                              </div>
                                            </>
                                          )}
                                          {(field.type === 'text' || field.type === 'textarea') && (
                                            <>
                                               <div>
                                                <label className="text-xs text-slate-500 mb-1 block">Min Length</label>
                                                <input type="number" className="w-full border-slate-200 rounded text-sm h-9 bg-white text-slate-900" 
                                                  value={field.validation?.minLength ?? ''} 
                                                  onChange={(e) => updateValidation(field.id, 'minLength', e.target.value)}
                                                />
                                              </div>
                                              <div>
                                                <label className="text-xs text-slate-500 mb-1 block">Max Length</label>
                                                <input type="number" className="w-full border-slate-200 rounded text-sm h-9 bg-white text-slate-900" 
                                                  value={field.validation?.maxLength ?? ''} 
                                                  onChange={(e) => updateValidation(field.id, 'maxLength', e.target.value)}
                                                />
                                              </div>
                                            </>
                                          )}
                                          {['email', 'select', 'checkbox', 'date'].includes(field.type) && (
                                            <div className="col-span-2 text-xs text-slate-500 italic">No extra validation rules available for this type.</div>
                                          )}
                                        </div>
                                      </div>

                                      {/* Footer Controls */}
                                      <div className="flex items-center justify-between pt-4 mt-2 border-t border-slate-100">
                                          <div className="flex items-center gap-2">
                                              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Type:</span>
                                              <select 
                                                  value={field.type} 
                                                  onChange={(e) => updateField(field.id, { type: e.target.value as FieldType })}
                                                  className="border-none bg-slate-100 rounded-md text-sm font-medium text-slate-900 py-1 pl-2 pr-8 focus:ring-0 cursor-pointer hover:bg-slate-200 transition"
                                              >
                                                  <option value="text">Short Text</option>
                                                  <option value="textarea">Long Text</option>
                                                  <option value="email">Email</option>
                                                  <option value="number">Number</option>
                                                  <option value="date">Date</option>
                                                  <option value="select">Dropdown</option>
                                                  <option value="checkbox">Checkbox</option>
                                              </select>
                                          </div>

                                          <label className="flex items-center gap-2 cursor-pointer select-none">
                                              <input 
                                                  type="checkbox" 
                                                  checked={field.required}
                                                  onChange={(e) => updateField(field.id, { required: e.target.checked })}
                                                  className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary" 
                                              />
                                              <span className={`text-sm font-medium transition ${field.required ? 'text-primary' : 'text-slate-500'}`}>Required</span>
                                          </label>
                                      </div>
                                  </div>
                              </div>
                            )}
                        </div>
                      );
                    })}
                </div>
            )
          )}
        </div>

        {/* Sidebar Tools - Only show in Edit Mode */}
        {viewMode === 'edit' && (
            <div className="w-full md:w-72 flex-shrink-0">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 sticky top-24">
                <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2 text-sm uppercase tracking-wide">
                   Toolbox
                </h3>
                <div className="grid grid-cols-1 gap-2">
                {[
                    { type: 'text', label: 'Short Text', icon: 'Aa' },
                    { type: 'textarea', label: 'Long Text', icon: '¶' },
                    { type: 'email', label: 'Email', icon: '@' },
                    { type: 'number', label: 'Number', icon: '#' },
                    { type: 'date', label: 'Date', icon: '📅' },
                    { type: 'select', label: 'Dropdown', icon: '▼' },
                    { type: 'checkbox', label: 'Checkbox', icon: '☑' }
                ].map((item) => (
                    <button
                    key={item.type}
                    onClick={() => addField(item.type as FieldType)}
                    className="flex items-center gap-3 w-full text-left px-4 py-3 text-sm text-slate-600 bg-slate-50 hover:bg-white hover:text-primary rounded-lg transition border border-transparent hover:border-primary/20 hover:shadow-sm group"
                    >
                        <span className="w-6 h-6 rounded bg-white border border-slate-200 flex items-center justify-center text-xs font-bold text-slate-400 group-hover:text-primary group-hover:border-primary/30 transition-colors">
                            {item.icon}
                        </span>
                        <span className="font-medium">{item.label}</span>
                        <Plus size={14} className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                ))}
                </div>
                
                <div className="mt-6 pt-6 border-t border-slate-100">
                    <div className="p-4 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg border border-indigo-100/50">
                        <div className="flex items-center gap-2 mb-2 text-indigo-700 font-bold text-xs uppercase tracking-wide">
                            <Sparkles size={12}/> AI Assistant
                        </div>
                        <p className="text-xs text-slate-600 mb-3 leading-relaxed">
                            Stuck? Let our AI build the structure for you instantly.
                        </p>
                        <button 
                            onClick={() => setShowAiModal(true)}
                            className="w-full py-2 bg-white border border-indigo-200 text-indigo-600 rounded-md text-xs font-bold hover:bg-indigo-50 transition shadow-sm"
                        >
                            Open Generator
                        </button>
                    </div>
                </div>
            </div>
            </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmation && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
              <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6 animate-in zoom-in duration-200">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4 text-red-600">
                      <AlertTriangle size={24} />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">Delete Field?</h3>
                  <p className="text-slate-500 text-sm mb-6">Are you sure you want to remove this field? This action cannot be undone.</p>
                  <div className="flex gap-3 justify-end">
                      <button 
                          onClick={() => setDeleteConfirmation(null)}
                          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium transition"
                      >
                          Cancel
                      </button>
                      <button 
                          onClick={() => removeField(deleteConfirmation)}
                          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition"
                      >
                          Delete
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* AI Modal */}
      {showAiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-0 overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white flex justify-between items-start">
                 <div>
                    <h3 className="text-xl font-bold flex items-center gap-2">
                        <Sparkles className="text-yellow-300" /> AI Form Generator
                    </h3>
                    <p className="text-indigo-100 text-sm mt-1">Describe your needs, and we'll draft the questions.</p>
                 </div>
                 <button 
                    onClick={() => setShowAiModal(false)}
                    className="text-white/70 hover:text-white p-1 hover:bg-white/10 rounded-md transition"
                 >
                    <X size={20} />
                 </button>
            </div>
            
            <div className="p-6">
                <textarea
                className="w-full border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-500 rounded-xl shadow-inner focus:ring-purple-500 focus:border-purple-500 mb-4 text-base p-4 resize-none font-medium"
                rows={5}
                placeholder="e.g. Create a feedback form for a coffee shop customer. Include rating for service (1-5), coffee quality, and a text box for suggestions."
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                />
                
                <div className="flex justify-end gap-3 mt-4">
                <button 
                    onClick={() => setShowAiModal(false)}
                    className="px-5 py-2.5 text-slate-600 hover:bg-slate-100 rounded-lg text-sm font-medium transition"
                >
                    Cancel
                </button>
                <button 
                    onClick={handleAiGenerate}
                    disabled={isAiLoading || !aiPrompt}
                    className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-sm font-medium disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-slate-200 transition-all transform active:scale-95"
                >
                    {isAiLoading ? <Loader2 className="animate-spin" size={16} /> : <Sparkles size={16} />}
                    Generate Fields
                </button>
                </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FormBuilder;
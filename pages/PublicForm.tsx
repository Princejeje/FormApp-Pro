import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getPublicFormById, submitFormEntry } from '../services/api';
import { Form } from '../types';
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

const PublicForm: React.FC = () => {
  const { id } = useParams();
  const [form, setForm] = useState<Form | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [submitting, setSubmitting] = useState(false);
  // Track which fields have been touched by the user for better validation UI
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (id) {
      // Use public endpoint (no auth needed)
      getPublicFormById(id).then(f => {
        setForm(f || null);
        setLoading(false);
      });
    }
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form || !id) return;
    
    // Mark all as touched to show errors on empty submit
    const allTouched: Record<string, boolean> = {};
    form.fields.forEach(f => allTouched[f.id] = true);
    setTouched(allTouched);

    // HTML5 validation will usually stop this before we get here, but just in case
    const formElement = e.target as HTMLFormElement;
    if(!formElement.checkValidity()) {
        return;
    }
    
    setSubmitting(true);
    try {
      await submitFormEntry(id, formData);
      setSubmitted(true);
    } catch (e) {
      setError("Failed to submit form. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (fieldId: string, value: any) => {
    setFormData(prev => ({ ...prev, [fieldId]: value }));
  };

  const handleBlur = (fieldId: string) => {
    setTouched(prev => ({ ...prev, [fieldId]: true }));
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-400"><Loader2 className="animate-spin" /></div>;

  if (!form) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500">
      <div className="text-center">
        <AlertCircle size={48} className="mx-auto mb-4 text-slate-300" />
        <h2 className="text-xl font-semibold">Form not found</h2>
        <p>This form may have been deleted or the link is incorrect.</p>
      </div>
    </div>
  );

  if (submitted) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="bg-white p-10 rounded-2xl shadow-xl max-w-md w-full text-center animate-in zoom-in duration-300">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 size={40} className="text-green-600" />
        </div>
        <h2 className="text-3xl font-bold text-slate-800 mb-4">Thank you!</h2>
        <p className="text-slate-600 mb-8 text-lg">Your submission has been received successfully.</p>
        <button 
            onClick={() => window.location.reload()}
            className="text-primary hover:text-indigo-800 font-medium hover:underline transition"
        >
            Submit another response
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto">
        {/* Form Header */}
        <div className="bg-white rounded-t-xl shadow-sm border border-slate-200 border-t-8 border-t-primary p-8 mb-6">
          <h1 className="text-3xl font-bold text-slate-900 mb-3">{form.title}</h1>
          <p className="text-slate-700 whitespace-pre-line text-lg leading-relaxed">{form.description}</p>
        </div>

        {/* Form Fields */}
        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          {form.fields.map(field => {
             const isTouched = touched[field.id];
             // Simple check: if required and empty, or invalid type. 
             // Note: Browser built-in constraints (validityState) are better handled via styling :invalid
             // but here we simulate visual feedback class.
             const value = formData[field.id];
             const isInvalid = isTouched && field.required && !value;

             return (
                <div key={field.id} className={`bg-white rounded-xl shadow-sm border p-6 transition-shadow focus-within:shadow-md ${isInvalid ? 'border-red-300 bg-red-50/10' : 'border-slate-200'}`}>
                <label className="block text-base font-semibold text-slate-800 mb-1">
                    {field.label} {field.required && <span className="text-red-500 ml-1" title="Required">*</span>}
                </label>
                
                {field.helpText && (
                    <p className="text-sm text-slate-500 mb-3">{field.helpText}</p>
                )}

                {field.type === 'textarea' ? (
                    <textarea
                    required={field.required}
                    minLength={field.validation?.minLength}
                    maxLength={field.validation?.maxLength}
                    placeholder={field.placeholder}
                    className={`w-full border rounded-lg shadow-sm min-h-[120px] text-slate-700 placeholder:text-slate-400 focus:ring-primary ${isInvalid ? 'border-red-500 focus:border-red-500' : 'border-slate-300 focus:border-primary'}`}
                    onChange={(e) => handleInputChange(field.id, e.target.value)}
                    onBlur={() => handleBlur(field.id)}
                    />
                ) : field.type === 'select' ? (
                    <div className="relative">
                        <select
                        required={field.required}
                        className={`w-full border rounded-lg shadow-sm appearance-none bg-white py-2.5 px-3 text-slate-700 focus:ring-primary ${isInvalid ? 'border-red-500 focus:border-red-500' : 'border-slate-300 focus:border-primary'}`}
                        onChange={(e) => handleInputChange(field.id, e.target.value)}
                        onBlur={() => handleBlur(field.id)}
                        defaultValue=""
                        >
                        <option value="" disabled>Select an option...</option>
                        {field.options?.map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                        ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                            <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/></svg>
                        </div>
                    </div>
                ) : field.type === 'checkbox' ? (
                    <div className={`flex items-center gap-3 mt-3 p-3 rounded-lg border ${isInvalid ? 'border-red-200 bg-red-50' : 'border-slate-100 bg-slate-50'}`}>
                        <input
                            type="checkbox"
                            required={field.required}
                            className={`w-5 h-5 rounded text-primary focus:ring-primary cursor-pointer ${isInvalid ? 'border-red-500' : 'border-slate-300'}`}
                            onChange={(e) => handleInputChange(field.id, e.target.checked ? 'Yes' : 'No')}
                            onBlur={() => handleBlur(field.id)}
                        />
                        <span className="text-slate-700 font-medium">Yes, I confirm</span>
                    </div>
                ) : (
                    <input
                    type={field.type}
                    required={field.required}
                    min={field.type === 'number' ? field.validation?.min : undefined}
                    max={field.type === 'number' ? field.validation?.max : undefined}
                    minLength={field.type === 'text' ? field.validation?.minLength : undefined}
                    maxLength={field.type === 'text' ? field.validation?.maxLength : undefined}
                    placeholder={field.placeholder}
                    className={`w-full border rounded-lg shadow-sm py-2.5 px-3 text-slate-700 placeholder:text-slate-400 focus:ring-primary ${isInvalid ? 'border-red-500 focus:border-red-500' : 'border-slate-300 focus:border-primary'}`}
                    onChange={(e) => handleInputChange(field.id, e.target.value)}
                    onBlur={() => handleBlur(field.id)}
                    />
                )}
                
                {isInvalid && (
                    <p className="mt-2 text-sm text-red-600 flex items-center gap-1 animate-in slide-in-from-top-1">
                        <AlertCircle size={14} /> This field is required
                    </p>
                )}
                </div>
             );
          })}

          {error && <div className="text-red-600 text-sm text-center bg-red-50 p-4 rounded-lg border border-red-100 font-medium">{error}</div>}

          <div className="pt-6 pb-12">
             <button
                type="submit"
                disabled={submitting}
                className="w-full bg-primary hover:bg-indigo-700 text-white font-bold py-4 px-8 rounded-xl shadow-lg shadow-indigo-200 transition-all transform hover:-translate-y-1 active:scale-95 disabled:opacity-70 disabled:transform-none flex justify-center items-center gap-2"
            >
                {submitting ? <Loader2 className="animate-spin" /> : 'Submit Form'}
            </button>
             <div className="text-center mt-6 text-xs text-slate-400">
                Powered by <strong>FormApp Pro</strong>
             </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PublicForm;
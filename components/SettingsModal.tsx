import React from 'react';
import type { Settings } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: Settings;
  onSettingsChange: (newSettings: Settings) => void;
}

const Label: React.FC<{ htmlFor: string, children: React.ReactNode }> = ({ htmlFor, children }) => (
  <label htmlFor={htmlFor} className="block text-sm font-medium text-slate-300 mb-2">
    {children}
  </label>
);

const Select: React.FC<React.SelectHTMLAttributes<HTMLSelectElement>> = (props) => (
    <select {...props} className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500 transition" />
);


const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, settings, onSettingsChange }) => {
  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onSettingsChange({
      ...settings,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div
      className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div
        className="bg-slate-800 rounded-xl w-full max-w-md flex flex-col overflow-hidden shadow-2xl border border-slate-700"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between p-4 border-b border-slate-700">
          <h2 className="text-lg font-semibold text-slate-100">Settings</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors p-1 rounded-full" aria-label="Close settings">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </header>

        <main className="p-6 space-y-6">
          <div>
            <Label htmlFor="provider">LLM Provider</Label>
            <Select id="provider" name="provider" value={settings.provider} onChange={handleChange} disabled>
              <option value="google">Google Gemini</option>
            </Select>
            <p className="text-xs text-slate-500 mt-1">Provider selection is coming soon.</p>
          </div>

          <div>
            <Label htmlFor="language">Response Language</Label>
            <Select id="language" name="language" value={settings.language} onChange={handleChange}>
              <option value="auto">Auto-detect</option>
              <option value="en">English</option>
              <option value="zh">Mandarin (简体中文)</option>
              <option value="ms">Malay (Bahasa Melayu)</option>
            </Select>
            <p className="text-xs text-slate-500 mt-1">Determines the language of the final report.</p>
          </div>

          <div>
            <Label htmlFor="model">Model</Label>
            <Select id="model" name="model" value={settings.model} onChange={handleChange}>
              <option value="gemini-2.5-flash">Gemini 2.5 Flash</option>
            </Select>
            <p className="text-xs text-slate-500 mt-1">More model options will be available in the future.</p>
          </div>
        </main>

        <footer className="p-4 bg-slate-900/50 border-t border-slate-700 flex justify-end">
            <button 
                onClick={onClose}
                className="bg-sky-600 text-white px-4 py-2 rounded-md hover:bg-sky-500 transition-colors duration-200"
            >
                Done
            </button>
        </footer>
      </div>
    </div>
  );
};

export default SettingsModal;

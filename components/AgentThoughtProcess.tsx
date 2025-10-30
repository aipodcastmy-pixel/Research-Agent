import React from 'react';

interface AgentThoughtProcessProps {
  thought: string;
}

export const AgentThoughtProcess: React.FC<AgentThoughtProcessProps> = ({ thought }) => {
  return (
    <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-4">
      <div className="flex items-center space-x-3 mb-3">
        <div className="flex-shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.898 20.572L16.5 21.75l-.398-1.178a3.375 3.375 0 00-2.455-2.456L12.75 18l1.178-.398a3.375 3.375 0 002.455-2.456L16.5 14.25l.398 1.178a3.375 3.375 0 002.456 2.456L20.25 18l-1.178.398a3.375 3.375 0 00-2.456 2.456z" />
          </svg>
        </div>
        <h3 className="text-md font-semibold text-slate-200">Agent Thought Process</h3>
      </div>

      <div className="text-sm text-slate-300 space-y-4 pl-9 border-l-2 border-slate-700 ml-3">
        <div>
          <h4 className="font-semibold text-slate-300 mb-1">Plan:</h4>
          <p className="text-slate-400">{thought}</p>
        </div>
      </div>
    </div>
  );
};
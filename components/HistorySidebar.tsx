
import React from 'react';
import type { Conversation } from '../types';

interface HistorySidebarProps {
  conversations: Conversation[];
  activeConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onNewConversation: () => void;
  onDeleteConversation: (id: string) => void;
  isThinking: boolean;
}

const HistorySidebar: React.FC<HistorySidebarProps> = ({ conversations, activeConversationId, onSelectConversation, onNewConversation, onDeleteConversation, isThinking }) => {

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this research?')) {
        onDeleteConversation(id);
    }
  };

  return (
    <aside className="w-64 bg-slate-900/80 border-r border-slate-700 flex flex-col">
      <div className="p-4 border-b border-slate-700">
        <button
          onClick={onNewConversation}
          disabled={isThinking}
          className="w-full flex items-center justify-center space-x-2 bg-sky-600 text-white px-4 py-2 rounded-md hover:bg-sky-500 transition-colors duration-200 disabled:bg-slate-600 disabled:cursor-not-allowed"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          <span>New Research</span>
        </button>
      </div>
      <nav className="flex-1 overflow-y-auto p-2 space-y-1">
        <ul>
          {conversations.map(convo => (
            <li key={convo.id}>
              <button
                onClick={() => onSelectConversation(convo.id)}
                disabled={isThinking}
                className={`w-full text-left p-2 rounded-md truncate text-sm group relative ${
                  activeConversationId === convo.id 
                    ? 'bg-sky-800/50 text-white' 
                    : 'text-slate-300 hover:bg-slate-700/50'
                } disabled:opacity-50 transition-colors duration-200`}
              >
                {convo.title}
                {conversations.length > 1 && (
                    <span 
                        onClick={(e) => handleDelete(e, convo.id)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md text-slate-400 hover:bg-red-500/50 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Delete research"
                    >
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </span>
                )}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default HistorySidebar;

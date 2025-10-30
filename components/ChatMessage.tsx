import React from 'react';
import type { ChatMessage, Source } from '../types';
import { AgentThoughtProcess } from './AgentThoughtProcess';
import { SearchProgress, Spinner } from './SearchProgress';

interface MessageProps {
  message: ChatMessage;
  onSourceClick?: (url: string) => void;
}

const UserIcon: React.FC = () => (
    <div className="flex-shrink-0 w-8 h-8 bg-slate-600 rounded-full flex items-center justify-center">
        <svg className="w-5 h-5 text-slate-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
        </svg>
    </div>
);

const AssistantIcon: React.FC = () => (
    <div className="flex-shrink-0 w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center">
        <svg className="w-5 h-5 text-sky-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.898 20.572L16.5 21.75l-.398-1.178a3.375 3.375 0 00-2.455-2.456L12.75 18l1.178-.398a3.375 3.375 0 002.455-2.456L16.5 14.25l.398 1.178a3.375 3.375 0 002.456 2.456L20.25 18l-1.178.398a3.375 3.375 0 00-2.456 2.456z" />
        </svg>
    </div>
);


const SourceLink: React.FC<{ source: Source, index: number, onClick: (url: string) => void }> = ({ source, index, onClick }) => (
    <button
      onClick={() => onClick(source.uri)}
      className="inline-block bg-slate-600/50 hover:bg-slate-500/50 text-sky-300 text-xs px-2 py-1 rounded-md transition-colors duration-200 truncate text-left cursor-pointer"
      title={source.title}
    >
        <span className="font-semibold">{index + 1}.</span> {source.title}
    </button>
);

const BlinkingCursor: React.FC = () => (
  <span className="inline-block w-2 h-4 bg-sky-400 animate-pulse ml-1" />
);

const Message: React.FC<MessageProps> = ({ message, onSourceClick }) => {
  const isUser = message.role === 'user';

  // A simple markdown-to-html converter
  const renderContent = (content: string) => {
    let html = content;
    // Replace headings
    html = html.replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold mt-4 mb-2">$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold mt-6 mb-3 border-b border-slate-600 pb-2">$1</h2>');
    // Replace ```code``` blocks
    html = html.replace(/```([\s\S]*?)```/g, '<pre class="bg-slate-900/50 p-3 rounded-md my-2 text-sm text-slate-300 overflow-x-auto"><code>$1</code></pre>');
    // Replace **bold**
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold">$1</strong>');
    // Replace *italic*
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
    // Replace bullet points by finding blocks of list items
    html = html.replace(/(?:^\s*[-*]\s.*$\r?\n?)+/gm, (match) => {
        const items = match.trim().split(/\r?\n/).map(item => 
            `<li class="ml-4">${item.replace(/^\s*[-*]\s/, '')}</li>`
        ).join('');
        return `<ul class="list-disc list-inside my-2">${items}</ul>`;
    });
    return { __html: html };
  };

  if (isUser) {
    return (
      <div className="flex items-start justify-end space-x-4 my-4">
        <div className="flex-1">
          <div className="bg-sky-600 rounded-lg rounded-br-none p-4 text-white">
            <p className="text-sm break-words">{message.content as string}</p>
          </div>
        </div>
        <UserIcon />
      </div>
    );
  }

  // Handle Assistant Message
  const renderAssistantMessage = () => {
    const reportHtml = renderContent(message.content);
    const showCursor = message.status === 'writing' && message.content.length > 0;
        
    const hasThoughtProcess = message.plan && message.searchQueries;
    const isResearching = message.status === 'searching' || message.status === 'writing' || (message.status === 'complete' && message.searchQueries && message.searchQueries.length > 0) || message.status === 'error';

    if (!isResearching) {
       return <p>{message.content}</p>; // Initial greeting
    }

    return (
      <div className="space-y-4">
        {message.status === 'planning' && <p className="text-slate-400 animate-pulse">Formulating research plan...</p>}
        
        {hasThoughtProcess && (
          <AgentThoughtProcess 
            thought={message.plan!}
          />
        )}
        
        {message.status === 'searching' && message.searchQueries && (
          <SearchProgress queries={message.searchQueries} currentQuery={message.currentQuery} />
        )}
        
        {message.status === 'writing' && !message.content && (
           <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-4 mt-4 flex items-center space-x-3 text-sm text-slate-300">
             <Spinner />
             <span>Synthesizing findings and writing report...</span>
           </div>
        )}

        {(message.status === 'writing' || message.status === 'complete' || message.status === 'error') && message.content && (
           <div className="prose prose-sm prose-invert max-w-none text-slate-200">
            <div dangerouslySetInnerHTML={reportHtml} />
            {showCursor && <BlinkingCursor />}
          </div>
        )}

        {message.sources && message.sources.length > 0 && (
          <div className="mt-4 border-t border-slate-700 pt-3">
            <h4 className="text-xs font-semibold text-slate-400 mb-2">Sources:</h4>
            <div className="flex flex-wrap gap-2">
              {message.sources.map((source, index) => (
                onSourceClick && <SourceLink key={source.uri} source={source} index={index} onClick={onSourceClick} />
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex items-start space-x-4 my-4">
      <AssistantIcon />
      <div className="flex-1">
        <div className="bg-slate-800 rounded-lg rounded-tl-none p-4 text-slate-200">
          {renderAssistantMessage()}
        </div>
      </div>
    </div>
  );
};

export default Message;
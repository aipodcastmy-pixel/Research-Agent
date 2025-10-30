
import React from 'react';

interface WebPreviewProps {
  url: string;
  onClose: () => void;
}

const WebPreview: React.FC<WebPreviewProps> = ({ url, onClose }) => {
  if (!url) return null;

  return (
    <div className="mt-4 border border-slate-700 rounded-lg overflow-hidden bg-slate-900 animate-fade-in">
      <header className="flex items-center justify-between p-2 bg-slate-800 border-b border-slate-700">
        <a href={url} target="_blank" rel="noopener noreferrer" className="text-xs text-slate-400 hover:text-sky-400 truncate" title={url}>
          {url}
        </a>
        <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors p-1 rounded-full flex-shrink-0" aria-label="Close preview">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </header>
      <div className="relative bg-white" style={{ height: '400px' }}>
        <iframe
          src={url}
          title={`Web Preview: ${url}`}
          className="w-full h-full border-0"
          sandbox="allow-scripts allow-same-origin"
        />
        <div className="absolute bottom-0 left-0 w-full p-2 bg-slate-900/80 text-white text-xs text-center backdrop-blur-sm">
          Some websites may not load in this preview. If you see a blank page, please
          <a href={url} target="_blank" rel="noopener noreferrer" className="underline font-bold ml-1 hover:text-sky-400">
              open in a new tab
          </a>.
        </div>
      </div>
    </div>
  );
};

export default WebPreview;

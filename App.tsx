
import React, { useState, useRef, useEffect } from 'react';
import type { ChatMessage, Source, Settings } from './types';
import { generatePlan, streamResearchProcess, ResearchStreamEvent } from './services/geminiService';
import ChatInput from './components/ChatInput';
import Message from './components/ChatMessage';
import WebPreview from './components/WebPreview';
import SettingsModal from './components/SettingsModal';

const App: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init',
      role: 'assistant',
      content: "I am the Research Agent. What topic would you like me to investigate for you?",
      status: 'complete'
    },
  ]);
  const [isThinking, setIsThinking] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [settings, setSettings] = useState<Settings>({
    provider: 'google',
    language: 'auto',
    model: 'gemini-2.5-flash',
  });
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isThinking]);

  const handleSendMessage = async (input: string) => {
    if (!input.trim() || isThinking) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: input,
    };
    
    const assistantMessageId = `asst-${Date.now()}`;
    const assistantMessage: ChatMessage = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      status: 'planning',
    };

    setMessages(prev => [...prev, userMessage, assistantMessage]);
    setIsThinking(true);

    try {
      // Step 1: Generate Plan
      const { plan, searchQueries } = await generatePlan(input, settings);

      setMessages(prev => prev.map(msg => 
        msg.id === assistantMessageId 
          ? { ...msg, status: 'searching', plan, searchQueries, currentQuery: searchQueries[0] ?? null } 
          : msg
      ));

      // Step 2: Stream the research process (searches and report)
      let finalReport = '';
      let finalSources: Source[] = [];
      const researchGenerator = streamResearchProcess(input, searchQueries, settings);

      for await (const event of researchGenerator) {
        switch (event.type) {
          case 'search_step':
            setMessages(prev => prev.map(msg => 
              msg.id === assistantMessageId 
                ? { ...msg, currentQuery: event.query } 
                : msg
            ));
            break;
          case 'status_update':
             setMessages(prev => prev.map(msg => 
              msg.id === assistantMessageId 
                ? { ...msg, status: event.status, currentQuery: null } 
                : msg
            ));
            break;
          case 'report_chunk':
            finalReport += event.text;
            setMessages(prev => prev.map(msg => 
              msg.id === assistantMessageId 
                ? { ...msg, content: finalReport } 
                : msg
            ));
            break;
          case 'sources':
            finalSources = event.sources;
            break;
        }
      }
      
      // Final update with sources and complete status
      setMessages(prev => prev.map(msg => 
        msg.id === assistantMessageId 
          ? { ...msg, content: finalReport, sources: finalSources, status: 'complete' } 
          : msg
      ));

    } catch (error) {
        console.error("Research process failed:", error);
        
        let friendlyErrorMessage = "An unknown error occurred during the research process.";
        if (error instanceof Error) {
            if (error.message.includes("API_KEY")) {
                 friendlyErrorMessage = "There seems to be an issue with your API Key. Please ensure it is correctly configured.";
            } else if (error.message.toLowerCase().includes('failed to fetch')) {
                friendlyErrorMessage = "A network error occurred. Please check your internet connection and try again.";
            } else if (error.message.includes("400") && error.message.includes("INVALID_ARGUMENT")) {
                 friendlyErrorMessage = "The request sent to the model was invalid. This might be due to a configuration issue or a problem with the prompt. Please try again or adjust the settings.";
            } else if (error.message.includes("429")) {
                friendlyErrorMessage = "The service is currently overloaded (rate limit exceeded). Please wait a moment before trying again.";
            } else {
                friendlyErrorMessage = `An unexpected error occurred. Please see the details below.`;
            }
        }

        const rawErrorMessage = error instanceof Error ? error.message : String(error);
        const timestamp = new Date().toLocaleString();
        
        setMessages(prev => prev.map(msg => 
            msg.id === assistantMessageId 
            ? { 
                ...msg, 
                status: 'error',
                content: `Sorry, I encountered an error.\n\n**${friendlyErrorMessage}**\n\n**Details:**\nTimestamp: ${timestamp}\n\n\`\`\`\n${rawErrorMessage}\n\`\`\``,
                plan: 'Failed to generate plan.',
                searchQueries: [],
            } 
            : msg
        ));
    } finally {
      setIsThinking(false);
    }
  };

  const handleSourceClick = (url: string) => {
    setPreviewUrl(url);
  };

  const handleClosePreview = () => {
    setPreviewUrl(null);
  };
  
  return (
    <div className="flex flex-col h-screen bg-slate-900 text-slate-100 font-sans">
      <header className="flex items-center justify-between p-4 border-b border-slate-700 shadow-md bg-slate-800/50 backdrop-blur-sm">
        <div className="w-10">
          <button 
            onClick={() => setIsSettingsOpen(true)} 
            className="text-slate-400 hover:text-white transition-colors p-2 rounded-full"
            aria-label="Open settings"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.931l.82.342c.474.197.877.608.97.92l.333 1.002c.11.331.023.69-.23.94l-.652.652c-.34.34-.482.82-.413 1.285l.118.894c.07.532-.176 1.05-.64 1.372l-.736.552c-.464.348-1.055.445-1.57.26l-.82-.273c-.4-.133-.85-.03-1.162.245l-.652.652c-.253.253-.61.34-1.04.23l-1.002-.333c-.312-.103-.726-.496-1.04-.97l-.342-.82c-.167-.4-.507-.71-.931-.78l-.894-.15c-.542-.09-.94-.56-.94-1.11v-1.093c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.764-.384.931-.78l.342-.82c.197-.474.608-.877.92-1.04l1.002-.333c.331-.11.69-.023.94.23l.652.652c.312.312.762.415 1.162.245l.82.273c.424.133.78.482.931.82l.149.894z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>
        <h1 className="text-xl font-bold text-center text-sky-400 tracking-wider">Research Agent</h1>
        <div className="w-10"></div>
      </header>
      
      <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
        <div className="max-w-4xl mx-auto">
          {messages.map((msg) => (
            <Message key={msg.id} message={msg} onSourceClick={handleSourceClick} />
          ))}
          <div ref={messagesEndRef} />
        </div>
      </main>

      <footer className="p-4 bg-slate-900/80 border-t border-slate-700 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto">
          <ChatInput onSendMessage={handleSendMessage} isLoading={isThinking} />
        </div>
      </footer>
      
      {previewUrl && <WebPreview url={previewUrl} onClose={handleClosePreview} />}
      {isSettingsOpen && (
        <SettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          settings={settings}
          onSettingsChange={setSettings}
        />
      )}
    </div>
  );
};

export default App;

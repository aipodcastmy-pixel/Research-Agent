import React, { useState, useRef, useEffect } from 'react';
import type { ChatMessage, Source } from './types';
import { generatePlan, streamResearchProcess, ResearchStreamEvent } from './services/geminiService';
import ChatInput from './components/ChatInput';
import Message from './components/ChatMessage';
import WebPreview from './components/WebPreview';

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
      const { plan, searchQueries } = await generatePlan(input);

      setMessages(prev => prev.map(msg => 
        msg.id === assistantMessageId 
          ? { ...msg, status: 'searching', plan, searchQueries, currentQuery: searchQueries[0] ?? null } 
          : msg
      ));

      // Step 2: Stream the research process (searches and report)
      let finalReport = '';
      let finalSources: Source[] = [];
      const researchGenerator = streamResearchProcess(input, searchQueries);

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
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
      setMessages(prev => prev.map(msg => 
        msg.id === assistantMessageId 
          ? { 
              ...msg, 
              status: 'error',
              content: `Sorry, I encountered an error during the research process.\n\n**Error:**\n\`\`\`\n${errorMessage}\n\`\`\``,
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
      <header className="p-4 border-b border-slate-700 shadow-md bg-slate-800/50 backdrop-blur-sm">
        <h1 className="text-xl font-bold text-center text-sky-400 tracking-wider">Research Agent</h1>
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
    </div>
  );
};

export default App;
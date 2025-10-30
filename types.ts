export interface Settings {
  provider: 'google';
  language: 'auto' | 'en' | 'zh' | 'ms';
  model: 'gemini-2.5-flash';
}

export interface Source {
  uri: string;
  title: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  plan?: string;
  searchQueries?: string[];
  sources?: Source[];
  status?: 'planning' | 'searching' | 'writing' | 'complete' | 'error';
  currentQuery?: string | null;
}

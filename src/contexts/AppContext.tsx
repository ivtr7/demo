import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { NicheConfig, defaultNiches } from '@/data/niches';

export interface GlobalConfig {
  appName: string;
  defaultTheme: 'light' | 'dark';
  geminiModel: string;
  temperature: number;
  topP: number;
  maxOutputTokens: number;
  demoWarning: string;
}

export interface AdminSession {
  isAuthenticated: boolean;
  expiresAt: number | null;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface OnboardingState {
  step: 'greeting' | 'name' | 'business' | 'extra' | 'complete';
  userName: string;
  businessName: string;
  extraValue: string;
}

export interface ChatState {
  messages: ChatMessage[];
  onboarding: OnboardingState;
  isTyping: boolean;
}

interface AppContextType {
  // Theme
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  
  // Global Config
  globalConfig: GlobalConfig;
  setGlobalConfig: (config: GlobalConfig) => void;
  
  // Niches
  niches: NicheConfig[];
  setNiches: (niches: NicheConfig[]) => void;
  updateNiche: (id: string, niche: NicheConfig) => void;
  
  // Current Niche
  currentNicheId: string | null;
  setCurrentNicheId: (id: string | null) => void;
  currentNiche: NicheConfig | null;
  
  // Chat State
  chatState: ChatState;
  setChatState: (state: ChatState | ((prev: ChatState) => ChatState)) => void;
  addMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  resetChat: () => void;
  
  // API Key
  geminiApiKey: string;
  setGeminiApiKey: (key: string) => void;
  hasApiKey: boolean;
  
  // Admin
  adminSession: AdminSession;
  loginAdmin: (username: string, password: string) => boolean;
  logoutAdmin: () => void;
  
  // Persistence
  exportConfig: () => string;
  importConfig: (json: string) => boolean;
  resetAll: () => void;
}

const defaultGlobalConfig: GlobalConfig = {
  appName: 'Demo de Agentes de IA',
  defaultTheme: 'dark',
  geminiModel: 'gemini-2.0-flash',
  temperature: 0.7,
  topP: 0.95,
  maxOutputTokens: 1024,
  demoWarning: 'Ambiente de demonstração. Nenhum dado real é enviado para uma agenda.',
};

const defaultChatState: ChatState = {
  messages: [],
  onboarding: {
    step: 'greeting',
    userName: '',
    businessName: '',
    extraValue: '',
  },
  isTyping: false,
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [globalConfig, setGlobalConfig] = useState<GlobalConfig>(defaultGlobalConfig);
  const [niches, setNiches] = useState<NicheConfig[]>(defaultNiches);
  const [currentNicheId, setCurrentNicheId] = useState<string | null>(null);
  const [chatState, setChatState] = useState<ChatState>(defaultChatState);
  const [geminiApiKey, setGeminiApiKey] = useState<string>('');
  const [adminSession, setAdminSession] = useState<AdminSession>({
    isAuthenticated: false,
    expiresAt: null,
  });

  // Load from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('ai-agent-theme');
    if (savedTheme === 'light' || savedTheme === 'dark') {
      setTheme(savedTheme);
    }

    const savedConfig = localStorage.getItem('ai-agent-global-config');
    if (savedConfig) {
      try {
        const parsed = JSON.parse(savedConfig) as GlobalConfig;
        const geminiModel = typeof parsed?.geminiModel === 'string' ? parsed.geminiModel.replace(/^models\//i, '') : defaultGlobalConfig.geminiModel;
        setGlobalConfig({ ...parsed, geminiModel });
      } catch {}
    }

    const savedNiches = localStorage.getItem('ai-agent-niches');
    if (savedNiches) {
      try {
        setNiches(JSON.parse(savedNiches));
      } catch {}
    }

    const savedApiKey = localStorage.getItem('ai-agent-api-key');
    if (savedApiKey) {
      setGeminiApiKey(savedApiKey);
    }

    const savedSession = localStorage.getItem('ai-agent-admin-session');
    if (savedSession) {
      try {
        const session = JSON.parse(savedSession);
        if (session.expiresAt && session.expiresAt > Date.now()) {
          setAdminSession(session);
        }
      } catch {}
    }

    const savedNicheId = localStorage.getItem('ai-agent-current-niche');
    if (savedNicheId) {
      setCurrentNicheId(savedNicheId);
    }
  }, []);

  // Apply theme to document
  useEffect(() => {
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme);
    localStorage.setItem('ai-agent-theme', theme);
  }, [theme]);

  // Save global config
  useEffect(() => {
    localStorage.setItem('ai-agent-global-config', JSON.stringify(globalConfig));
  }, [globalConfig]);

  // Save niches
  useEffect(() => {
    localStorage.setItem('ai-agent-niches', JSON.stringify(niches));
  }, [niches]);

  // Save API key
  useEffect(() => {
    if (geminiApiKey) {
      localStorage.setItem('ai-agent-api-key', geminiApiKey);
    } else {
      localStorage.removeItem('ai-agent-api-key');
    }
  }, [geminiApiKey]);

  // Save admin session
  useEffect(() => {
    if (adminSession.isAuthenticated) {
      localStorage.setItem('ai-agent-admin-session', JSON.stringify(adminSession));
    } else {
      localStorage.removeItem('ai-agent-admin-session');
    }
  }, [adminSession]);

  // Save current niche
  useEffect(() => {
    if (currentNicheId) {
      localStorage.setItem('ai-agent-current-niche', currentNicheId);
    } else {
      localStorage.removeItem('ai-agent-current-niche');
    }
  }, [currentNicheId]);

  const currentNiche = niches.find(n => n.id === currentNicheId) || null;

  const updateNiche = (id: string, niche: NicheConfig) => {
    setNiches(prev => prev.map(n => n.id === id ? niche : n));
  };

  const addMessage = (message: Omit<ChatMessage, 'id' | 'timestamp'>) => {
    const newMessage: ChatMessage = {
      ...message,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
    };
    setChatState(prev => ({
      ...prev,
      messages: [...prev.messages, newMessage],
    }));
  };

  const resetChat = () => {
    setChatState(defaultChatState);
  };

  const loginAdmin = (username: string, password: string): boolean => {
    // Normalize username: trim, lowercase, remove accents
    const normalizedUser = username
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, ''); // Remove diacritics
    
    // Normalize password: remove accents for comparison
    const normalizedPassword = password
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
    
    // Accept both "icaro" and "ícaro" as username, and "icaro123" with/without accent
    if (normalizedUser === 'icaro' && normalizedPassword === 'icaro123') {
      const expiresAt = Date.now() + 12 * 60 * 60 * 1000; // 12 hours
      setAdminSession({ isAuthenticated: true, expiresAt });
      return true;
    }
    return false;
  };

  const logoutAdmin = () => {
    setAdminSession({ isAuthenticated: false, expiresAt: null });
  };

  const exportConfig = (): string => {
    return JSON.stringify({
      globalConfig,
      niches,
      geminiApiKey,
    }, null, 2);
  };

  const importConfig = (json: string): boolean => {
    try {
      const data = JSON.parse(json);
      if (data.globalConfig) setGlobalConfig(data.globalConfig);
      if (data.niches) setNiches(data.niches);
      if (data.geminiApiKey) setGeminiApiKey(data.geminiApiKey);
      return true;
    } catch {
      return false;
    }
  };

  const resetAll = () => {
    setGlobalConfig(defaultGlobalConfig);
    setNiches(defaultNiches);
    setGeminiApiKey('');
    setChatState(defaultChatState);
    setCurrentNicheId(null);
    localStorage.clear();
  };

  return (
    <AppContext.Provider
      value={{
        theme,
        setTheme,
        globalConfig,
        setGlobalConfig,
        niches,
        setNiches,
        updateNiche,
        currentNicheId,
        setCurrentNicheId,
        currentNiche,
        chatState,
        setChatState,
        addMessage,
        resetChat,
        geminiApiKey,
        setGeminiApiKey,
        hasApiKey: !!geminiApiKey,
        adminSession,
        loginAdmin,
        logoutAdmin,
        exportConfig,
        importConfig,
        resetAll,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}

import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { ChatInput } from './components/ChatInput';
import { ChatMessage } from './components/ChatMessage';
import { SidePanel } from './components/SidePanel';
import { createChatSession, sendMessage } from './services/geminiService';
import { Theme, Message, FileAttachment, Conversation } from './types';

function App() {
  const [theme, setTheme] = useState<Theme>('dark');
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(true);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const savedConversations = localStorage.getItem('studywise-conversations');
      if (savedConversations) {
        setConversations(JSON.parse(savedConversations));
      }
    } catch (error) {
      console.error("Failed to load conversations from localStorage", error);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('studywise-conversations', JSON.stringify(conversations));
    } catch (error) {
      console.error("Failed to save conversations to localStorage", error);
    }
  }, [conversations]);

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);
  
  useEffect(() => {
    if (chatContainerRef.current) {
        chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [conversations, activeConversationId, isLoading]);

  // Handle responsive side panel
  useEffect(() => {
    const mediaQuery = window.matchMedia('(min-width: 768px)');
    
    const handleMediaQueryChange = (e: MediaQueryListEvent) => {
      setIsSidePanelOpen(e.matches); // Open if desktop, close if mobile
    };
    
    // Set initial state based on media query
    setIsSidePanelOpen(mediaQuery.matches);

    mediaQuery.addEventListener('change', handleMediaQueryChange);
    
    return () => {
      mediaQuery.removeEventListener('change', handleMediaQueryChange);
    };
  }, []);


  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  const toggleSidePanel = () => setIsSidePanelOpen(prev => !prev);

  const handleNewChat = () => {
    setActiveConversationId(null);
  };

  const handleSelectChat = (id: string) => {
    setActiveConversationId(id);
  };

  const handleSendMessage = async (prompt: string, file?: File) => {
    if (isLoading || (!prompt.trim() && !file)) return;
    setIsLoading(true);

    const fileAttachment: FileAttachment | undefined = file ? { name: file.name, type: file.type, size: file.size } : undefined;
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      parts: [{ text: prompt }],
      file: fileAttachment
    };

    let conversationId = activeConversationId;
    let history: Message[] = [];

    // Determine the state of the conversation before this new message
    if (conversationId) {
        history = conversations.find(c => c.id === conversationId)?.messages || [];
    } else {
        conversationId = Date.now().toString();
    }

    const modelMessageId = (Date.now() + 1).toString();
    const modelMessage: Message = {
      id: modelMessageId,
      role: 'model',
      parts: [{ text: '' }],
    };

    // Update the UI immediately with user message and model placeholder
    setConversations(prevConvos => {
        const existingConvo = prevConvos.find(c => c.id === conversationId);
        if (existingConvo) {
            return prevConvos.map(c => 
                c.id === conversationId
                    ? { ...c, messages: [...c.messages, userMessage, modelMessage] }
                    : c
            );
        } else {
            const newConvo: Conversation = {
                id: conversationId,
                title: (prompt || file?.name || "New Chat").substring(0, 40),
                messages: [userMessage, modelMessage],
            };
            return [...prevConvos, newConvo];
        }
    });

    if (!activeConversationId) {
        setActiveConversationId(conversationId);
    }

    try {
      // Create a chat session with the history *before* the new message
      const chatSession = createChatSession(history);
      const stream = await sendMessage(chatSession, prompt, file);
      
      let fullResponse = '';
      for await (const chunk of stream) {
        fullResponse += chunk;
        setConversations(prev => 
          prev.map(convo => {
            if (convo.id !== conversationId) return convo;
            const updatedMessages = convo.messages.map(msg => 
              msg.id === modelMessageId ? { ...msg, parts: [{ text: fullResponse }] } : msg
            );
            return { ...convo, messages: updatedMessages };
          })
        );
      }
    } catch (error) {
        console.error("Error sending message:", error);
        const errorMessage = error instanceof Error 
            ? error.message 
            : `Sorry, I encountered an error and could not proceed. Please try again.`;
        
        setConversations(prev => 
            prev.map(convo => {
                if (convo.id !== conversationId) return convo;
                const updatedMessages = convo.messages.map(msg => 
                  msg.id === modelMessageId ? { ...msg, parts: [{ text: errorMessage }] } : msg
                );
                return { ...convo, messages: updatedMessages };
            })
        );
    } finally {
        setIsLoading(false);
    }
  };


  const activeMessages = conversations.find(c => c.id === activeConversationId)?.messages || [];
  const isLastMessageModel = activeMessages.length > 0 && activeMessages[activeMessages.length - 1].role === 'model';

  return (
    <div className="flex h-screen bg-gradient-to-br from-blue-100 via-white to-purple-100 dark:from-slate-950 dark:via-black dark:to-slate-950 transition-colors duration-300 overflow-hidden">
      <div className={`absolute z-30 h-full transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isSidePanelOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <SidePanel
          conversations={[...conversations].reverse()}
          activeConversationId={activeConversationId}
          onNewChat={handleNewChat}
          onSelectChat={handleSelectChat}
        />
      </div>
      
      <div className="flex flex-col flex-1 h-screen relative">
         {isSidePanelOpen && (
            <div 
            onClick={toggleSidePanel}
            className="fixed inset-0 bg-black/30 z-20 md:hidden"
            ></div>
        )}
        <Header theme={theme} toggleTheme={toggleTheme} toggleSidePanel={toggleSidePanel} />
        <main ref={chatContainerRef} className="flex-1 overflow-y-auto pt-16 pb-4">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {activeMessages.length === 0 && (
                    <div className="text-center py-16">
                        <h2 className="text-2xl font-bold text-slate-700 dark:text-slate-200">Welcome to StudyWise</h2>
                        <p className="text-slate-500 dark:text-slate-400 mt-2">Your personalized AI tutor. Ask a question or upload a file to get started.</p>
                    </div>
                )}
                <div className="divide-y divide-slate-200 dark:divide-slate-700">
                    {activeMessages.map((message, index) => (
                        <ChatMessage 
                            key={message.id} 
                            message={message} 
                            isLoading={isLoading && isLastMessageModel && index === activeMessages.length - 1} 
                        />
                    ))}
                </div>
            </div>
        </main>
        <div className="sticky bottom-0">
            <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
}

export default App;
import React from 'react';
import { Conversation } from '../types';
import { PlusIcon } from './icons/PlusIcon';
import { ChatBubbleIcon } from './icons/ChatBubbleIcon';

interface SidePanelProps {
  conversations: Conversation[];
  activeConversationId: string | null;
  onNewChat: () => void;
  onSelectChat: (id: string) => void;
}

export const SidePanel: React.FC<SidePanelProps> = ({
  conversations,
  activeConversationId,
  onNewChat,
  onSelectChat,
}) => {
  return (
    <div className="h-full bg-slate-100 dark:bg-slate-800 flex flex-col w-64 p-3 border-r border-slate-200 dark:border-slate-700">
       <div className="flex justify-between items-center mb-4">
        <button
            onClick={onNewChat}
            className="flex items-center justify-between w-full p-3 text-sm font-medium text-left text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 rounded-lg shadow-sm hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors"
        >
            <span>New Chat</span>
            <PlusIcon className="w-5 h-5" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto">
        <h2 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 px-2">
          Chat History
        </h2>
        <nav className="flex flex-col space-y-1">
          {conversations.map((convo) => (
            <button
              key={convo.id}
              onClick={() => onSelectChat(convo.id)}
              className={`flex items-center space-x-3 p-2 rounded-md text-sm truncate transition-colors w-full text-left ${
                activeConversationId === convo.id
                  ? 'bg-brand-accent-light/20 dark:bg-brand-accent-dark/30 text-brand-accent-light dark:text-slate-200 font-semibold'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <ChatBubbleIcon className="w-5 h-5 flex-shrink-0" />
              <span className="truncate">{convo.title || 'New Chat'}</span>
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
};
import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Message } from '../types';
import { SparklesIcon } from './icons/SparklesIcon';
import { UserIcon } from './icons/UserIcon';
import { ClipboardIcon } from './icons/ClipboardIcon';
import { CheckIcon } from './icons/CheckIcon';

const TypingIndicator: React.FC = () => {
    return (
        <div className="flex items-center space-x-1.5 py-2">
            <span className="w-2 h-2 bg-slate-400 dark:bg-slate-500 rounded-full animate-dot-pulse" style={{ animationDelay: '0s' }}></span>
            <span className="w-2 h-2 bg-slate-400 dark:bg-slate-500 rounded-full animate-dot-pulse" style={{ animationDelay: '0.2s' }}></span>
            <span className="w-2 h-2 bg-slate-400 dark:bg-slate-500 rounded-full animate-dot-pulse" style={{ animationDelay: '0.4s' }}></span>
        </div>
    );
};

const CodeBlock: React.FC<{ className?: string; children: React.ReactNode }> = ({ className, children }) => {
    const [isCopied, setIsCopied] = useState(false);
    
    const match = /language-(\w+)/.exec(className || '');
    const lang = match ? match[1] : '';
    const codeContent = String(children).replace(/\n$/, '');

    const handleCopy = () => {
        navigator.clipboard.writeText(codeContent).then(() => {
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        });
    };

    return (
        <div className="relative bg-[#282c34] rounded-md my-2">
            <div className="flex items-center justify-between text-xs text-slate-400 px-4 py-1.5 border-b border-slate-700">
                <span>{lang || 'code'}</span>
                <button 
                    onClick={handleCopy} 
                    className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors disabled:cursor-not-allowed"
                    disabled={isCopied}
                >
                    {isCopied ? (
                        <>
                            <CheckIcon className="w-4 h-4 text-green-400" />
                            <span className="text-green-400">Copied!</span>
                        </>
                    ) : (
                        <>
                            <ClipboardIcon className="w-4 h-4" />
                            <span>Copy code</span>
                        </>
                    )}
                </button>
            </div>
            <SyntaxHighlighter
                style={oneDark}
                language={lang}
                PreTag="div"
                customStyle={{ margin: 0, padding: '1rem', background: 'transparent', borderRadius: '0 0 0.375rem 0.375rem' }}
                codeTagProps={{ style: { fontFamily: 'monospace' }}}
            >
                {codeContent}
            </SyntaxHighlighter>
        </div>
    );
};


interface ChatMessageProps {
  message: Message;
  isLoading: boolean;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message, isLoading }) => {
  const isModel = message.role === 'model';
  const text = message.parts.map(part => part.text).join('');

  return (
    <div className={`flex items-start gap-4 py-6 ${!isModel ? 'flex-row' : ''}`}>
      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${isModel ? 'bg-brand-accent-dark text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>
        {isModel ? <SparklesIcon className="w-5 h-5" /> : <UserIcon className="w-5 h-5" />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-slate-800 dark:text-slate-200 mb-2">
          {isModel ? 'StudyWise' : 'You'}
        </p>
        <div className="prose prose-slate dark:prose-invert max-w-none text-slate-800 dark:text-slate-300 whitespace-pre-wrap leading-relaxed prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-a:underline hover:prose-a:text-blue-800 dark:hover:prose-a:text-blue-300">
           {isModel && isLoading && text.length === 0 ? (
            <TypingIndicator />
          ) : (
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                    a: ({node, ...props}) => <a {...props} target="_blank" rel="noopener noreferrer" />,
                    code({ node, className, children, ...props }) {
                        const isBlock = String(children).includes('\n') || /language-(\w+)/.exec(className || '');

                        if (isBlock) {
                            return <CodeBlock className={className}>{children}</CodeBlock>;
                        }
                        
                        return (
                            <code className="bg-slate-200 dark:bg-slate-700 rounded-sm px-1.5 py-1 text-sm font-mono" {...props}>
                                {children}
                            </code>
                        );
                    }
                }}
            >
                {text}
            </ReactMarkdown>
          )}
        </div>
        {message.file && (
            <div className="mt-2 text-xs bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 px-2 py-1 rounded-md inline-block">
                Attached: {message.file.name}
            </div>
        )}
      </div>
    </div>
  );
};
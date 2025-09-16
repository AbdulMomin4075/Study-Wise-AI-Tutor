import React, { useState, useRef, useCallback, useEffect } from 'react';
import { SendIcon } from './icons/SendIcon';
import { PaperclipIcon } from './icons/PaperclipIcon';

interface ChatInputProps {
  onSendMessage: (prompt: string, file?: File) => void;
  isLoading: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isLoading }) => {
  const [prompt, setPrompt] = useState('');
  const [file, setFile] = useState<File | undefined>(undefined);
  const [filePreviewUrl, setFilePreviewUrl] = useState<string | undefined>(undefined);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    // Clean up the object URL when the component unmounts or the URL changes
    return () => {
      if (filePreviewUrl) {
        URL.revokeObjectURL(filePreviewUrl);
      }
    };
  }, [filePreviewUrl]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (filePreviewUrl) {
        URL.revokeObjectURL(filePreviewUrl);
        setFilePreviewUrl(undefined);
    }
    if (event.target.files && event.target.files.length > 0) {
      const selectedFile = event.target.files[0];
      setFile(selectedFile);
      if (selectedFile.type.startsWith('image/')) {
        setFilePreviewUrl(URL.createObjectURL(selectedFile));
      }
    }
  };

  const handleAttachClick = () => {
    fileInputRef.current?.click();
  };

  const removeFile = () => {
    setFile(undefined);
    if (filePreviewUrl) {
        URL.revokeObjectURL(filePreviewUrl);
        setFilePreviewUrl(undefined);
    }
    if (fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim() || file) {
      onSendMessage(prompt.trim(), file);
      setPrompt('');
      removeFile();
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSubmit(e as unknown as React.FormEvent);
    }
  }

  const autoResizeTextarea = useCallback(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      const scrollHeight = textarea.scrollHeight;
      textarea.style.height = `${scrollHeight}px`;
    }
  }, []);

  useEffect(() => {
    autoResizeTextarea();
  }, [prompt, autoResizeTextarea]);

  return (
    <div className="bg-white dark:bg-slate-900 w-full">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <form 
                onSubmit={handleSubmit}
                className="relative flex items-end p-2 bg-slate-100 dark:bg-slate-800 rounded-2xl shadow-sm"
            >
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                />
                <button
                    type="button"
                    onClick={handleAttachClick}
                    aria-label="Attach file"
                    className="p-2 mr-2 text-slate-500 dark:text-slate-400 hover:text-brand-accent-light dark:hover:text-brand-accent-dark rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                    <PaperclipIcon className="w-6 h-6" />
                </button>
                <div className="flex-1 flex-col">
                    {file && (
                        <div className="relative mb-2 inline-block">
                            <div className="bg-slate-200 dark:bg-slate-700 rounded-lg p-2 flex items-center">
                                {filePreviewUrl ? (
                                    <img src={filePreviewUrl} alt="File preview" className="w-16 h-16 object-cover rounded-md mr-2" />
                                ) : (
                                    <PaperclipIcon className="w-6 h-6 mr-2 text-slate-500 dark:text-slate-400" />
                                )}
                                <span className="text-sm text-slate-700 dark:text-slate-300 truncate max-w-xs">{file.name}</span>
                            </div>
                            <button
                                type="button"
                                onClick={removeFile}
                                aria-label="Remove attached file"
                                className="absolute -top-2 -right-2 bg-slate-600 hover:bg-slate-800 text-white rounded-full w-5 h-5 flex items-center justify-center text-sm font-bold transition-colors"
                            >
                                &times;
                            </button>
                        </div>
                    )}
                    <textarea
                        ref={textareaRef}
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Ask StudyWise anything..."
                        className="w-full bg-transparent resize-none focus:outline-none text-slate-800 dark:text-slate-200 placeholder-slate-500 dark:placeholder-slate-400 max-h-48"
                        rows={1}
                        disabled={isLoading}
                    />
                </div>
                <button
                    type="submit"
                    disabled={isLoading || (!prompt.trim() && !file)}
                    aria-label="Send message"
                    className="p-2 ml-2 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed enabled:bg-brand-accent-light dark:enabled:bg-brand-accent-dark enabled:text-white"
                >
                    {isLoading ? 
                        <div className="w-6 h-6 border-2 border-white/50 border-t-white rounded-full animate-spin"></div>
                        :
                        <SendIcon className="w-6 h-6" />
                    }
                </button>
            </form>
        </div>
    </div>
  );
};
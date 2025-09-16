import React from 'react';
import { Theme } from '../types';
import { SunIcon } from './icons/SunIcon';
import { MoonIcon } from './icons/MoonIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { MenuIcon } from './icons/MenuIcon';

interface HeaderProps {
  theme: Theme;
  toggleTheme: () => void;
  toggleSidePanel: () => void;
}

export const Header: React.FC<HeaderProps> = ({ theme, toggleTheme, toggleSidePanel }) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm shadow-sm">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-2">
             <button
              onClick={toggleSidePanel}
              className="p-2 -ml-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
            >
              <MenuIcon className="h-6 w-6" />
            </button>
             <SparklesIcon className="h-7 w-7 text-brand-accent-light dark:text-brand-accent-dark" />
            <h1 className="text-xl font-bold text-slate-800 dark:text-slate-200">
              StudyWise
            </h1>
          </div>
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-100 dark:focus:ring-offset-slate-800 focus:ring-brand-accent-dark"
          >
            {theme === 'light' ? (
              <MoonIcon className="h-6 w-6" />
            ) : (
              <SunIcon className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
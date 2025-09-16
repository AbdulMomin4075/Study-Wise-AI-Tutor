
import React from 'react';

export const PaperclipIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <path
      fillRule="evenodd"
      d="M18.97 3.659a2.25 2.25 0 00-3.182 0l-10.5 10.5a.75.75 0 001.061 1.06l10.5-10.5a.75.75 0 011.06 0l-9.192 9.192a2.25 2.25 0 01-3.182 0l-1.414-1.414a2.25 2.25 0 010-3.182l9.192-9.192a.75.75 0 00-1.06-1.06l-9.192 9.192a3.75 3.75 0 000 5.304l1.414 1.414a3.75 3.75 0 005.304 0l9.192-9.192a.75.75 0 000-1.061l-1.272-1.272z"
      clipRule="evenodd"
    />
  </svg>
);

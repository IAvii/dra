'use client';

import { ReactNode } from 'react';

interface ButtonProps {
  children: ReactNode;
  appName: string;
}

export const Button = ({ children, appName }: ButtonProps) => {
  return (
    <button
      className="
    inline-flex items-center justify-center gap-2
    rounded-lg
    bg-blue-600
    px-4 py-2.5
    text-sm font-medium text-white
    shadow-sm
    transition-all duration-200
    hover:bg-blue-700
    hover:shadow-md
    active:scale-[0.98]
    focus-visible:outline-none
    focus-visible:ring-2
    focus-visible:ring-blue-500
    focus-visible:ring-offset-2
    disabled:pointer-events-none
    disabled:opacity-50"
      onClick={() => alert(`Hello from your ${appName} app!`)}
    >
      {children}
    </button>
  );
};

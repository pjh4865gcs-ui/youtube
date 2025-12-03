import React from 'react';

interface LoadingSpinnerProps {
  message?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ message }) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 space-y-6 animate-fade-in">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-slate-700 rounded-full"></div>
        <div className="absolute top-0 left-0 w-16 h-16 border-4 border-indigo-500 rounded-full border-t-transparent animate-spin"></div>
      </div>
      {message && (
        <p className="text-xl font-medium text-indigo-300 animate-pulse">{message}</p>
      )}
    </div>
  );
};

import React from 'react';
import { Input } from './Input';

export interface SearchBarProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const SearchBar: React.FC<SearchBarProps> = ({ className = '', ...props }) => {
  return (
    <div className={`relative ${className}`}>
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
        <svg className="h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
        </svg>
      </div>
      <Input
        type="text"
        className="pl-10"
        placeholder="Search..."
        {...props}
      />
    </div>
  );
};

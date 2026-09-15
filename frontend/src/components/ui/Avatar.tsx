import React from 'react';

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  alt?: string;
  fallback?: string;
}

export const Avatar: React.FC<AvatarProps> = ({ src, alt, fallback, className = '', ...props }) => {
  return (
    <div className={`relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full bg-gray-100 ${className}`} {...props}>
      {src ? (
        <img className="aspect-square h-full w-full" src={src} alt={alt} />
      ) : (
        <span className="flex h-full w-full items-center justify-center rounded-full bg-gray-100 text-gray-500 font-medium">
          {fallback || alt?.charAt(0) || '?'}
        </span>
      )}
    </div>
  );
};

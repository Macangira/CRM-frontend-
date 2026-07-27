import React, { useState } from 'react';
import { User as UserIcon } from 'lucide-react';

export interface AvatarProps {
  src?: string;
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  status?: 'online' | 'offline' | 'busy';
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  name = '',
  size = 'md',
  className = '',
  status
}) => {
  const [imageError, setImageError] = useState(false);

  const sizes = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-xl'
  };

  const iconSizes = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
    xl: 'w-8 h-8'
  }[size];

  const getInitials = (n: string) => {
    if (!n || !n.trim()) return '';
    const parts = n.trim().split(' ').filter(Boolean);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return parts[0].substring(0, 2).toUpperCase();
  };

  const statusColors = {
    online: 'bg-emerald-500 ring-white dark:ring-zinc-900',
    offline: 'bg-zinc-400 ring-white dark:ring-zinc-900',
    busy: 'bg-red-500 ring-white dark:ring-zinc-900'
  };

  const initials = getInitials(name);

  return (
    <div className={`relative inline-block shrink-0 ${className}`}>
      {src && !imageError ? (
        <img
          src={src}
          alt={name || 'User Profile'}
          onError={() => setImageError(true)}
          className={`${sizes[size]} rounded-full object-cover border border-zinc-200 dark:border-zinc-700/80 shadow-sm`}
        />
      ) : (
        /* No Profile Fallback Badge */
        <div
          className={`${sizes[size]} rounded-full bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 text-white font-bold flex items-center justify-center border-0 shadow-sm select-none`}
        >
          {initials ? (
            <span>{initials}</span>
          ) : (
            <UserIcon className={`${iconSizes} text-blue-100`} />
          )}
        </div>
      )}

      {status && (
        <span
          className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full ring-2 ${statusColors[status]}`}
        />
      )}
    </div>
  );
};

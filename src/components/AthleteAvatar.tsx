import React from 'react';
import { User } from 'lucide-react';

interface AthleteAvatarProps {
  name: string;
  avatarUrl?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  role?: string;
}

export default function AthleteAvatar({
  name,
  avatarUrl,
  size = 'md',
  className = '',
  role
}: AthleteAvatarProps) {
  const [imgError, setImgError] = React.useState(false);

  // Derive stable initials and color palette from name
  const initials = (name || 'Atleta')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(p => p[0].toUpperCase())
    .join('');

  const sizeClasses = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-16 h-16 text-lg font-bold',
    xl: 'w-20 h-20 text-xl font-black'
  };

  // Deterministic sporty background color based on name
  const colors = [
    'bg-gradient-to-br from-orange-500 to-amber-600 text-white',
    'bg-gradient-to-br from-blue-600 to-indigo-700 text-white',
    'bg-gradient-to-br from-emerald-600 to-teal-700 text-white',
    'bg-gradient-to-br from-slate-700 to-slate-900 text-white',
    'bg-gradient-to-br from-purple-600 to-pink-700 text-white'
  ];

  let hash = 0;
  for (let i = 0; i < (name || '').length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const colorClass = colors[Math.abs(hash) % colors.length];

  // If role is coach, give distinctive coach badge styling
  const isCoach = role === 'treinador' || name.toLowerCase().includes('max');

  const trimmedUrl = typeof avatarUrl === 'string' ? avatarUrl.trim() : '';
  const hasValidImage = trimmedUrl.length > 0 && !imgError && !trimmedUrl.includes('unsplash.com');

  if (hasValidImage) {
    return (
      <img
        src={trimmedUrl}
        alt={name || 'Atleta'}
        onError={() => setImgError(true)}
        className={`${sizeClasses[size]} rounded-full object-cover shrink-0 ${className}`}
      />
    );
  }

  return (
    <div
      className={`${sizeClasses[size]} ${isCoach ? 'bg-gradient-to-br from-orange-600 to-red-600 text-white ring-2 ring-orange-300' : colorClass} rounded-full flex items-center justify-center font-bold tracking-wider shrink-0 shadow-xs select-none ${className}`}
      title={name}
    >
      {initials || <User className="w-1/2 h-1/2" />}
    </div>
  );
}

// components/ui/orbit-progress.tsx
import React from 'react';

interface OrbitProgressProps {
  variant?: 'disc' | 'orbit';
  dense?: boolean;
  color?: string;
  size?: 'small' | 'medium' | 'large';
}

export function OrbitProgress({ 
  variant = 'disc', 
  dense = false, 
  color = '', 
  size = 'medium' 
}: OrbitProgressProps) {
  const sizeClasses = {
    small: 'w-8 h-8',
    medium: 'w-12 h-12',
    large: 'w-16 h-16'
  };

  return (
    <div className={`${sizeClasses[size]} relative`}>
      <div className={`absolute inset-0 rounded-full border-2 ${color || 'border-primary'} border-t-transparent animate-spin`}></div>
      {variant === 'disc' && (
        <div className={`absolute inset-2 rounded-full ${color || 'bg-primary'} opacity-20`}></div>
      )}
    </div>
  );
}
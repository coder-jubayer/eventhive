import React from 'react';

const SIZES = {
  sm: 'h-8',
  md: 'h-11',
  lg: 'h-16',
  xl: 'h-24',
} as const;

type LogoProps = {
  size?: keyof typeof SIZES;
  className?: string;
};

export const Logo: React.FC<LogoProps> = ({ size = 'md', className = '' }) => (
  <img
    src="/eventhive-logo.png"
    alt="EventHive"
    className={`${SIZES[size]} w-auto object-contain ${className}`}
  />
);

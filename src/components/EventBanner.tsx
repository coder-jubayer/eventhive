import React from 'react';
import { getEventImageUrl } from '../utils/categoryImages';

interface EventBannerProps {
  imageUrl?: string;
  category?: string;
  seed?: string;
  name: string;
  className?: string;
  children?: React.ReactNode;
}

export const EventBanner: React.FC<EventBannerProps> = ({
  imageUrl,
  category,
  seed,
  name,
  className = '',
  children,
}) => {
  const [imageError, setImageError] = React.useState(false);
  const resolvedUrl = imageUrl?.trim()
    ? imageUrl.trim()
    : getEventImageUrl({ imageUrl: '', category, name, _id: seed });

  const showImage = resolvedUrl && !imageError;

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {showImage ? (
        <img
          src={resolvedUrl}
          alt={name}
          className="absolute inset-0 w-full h-full object-cover"
          onError={() => setImageError(true)}
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600" />
      )}
      {showImage && <div className="absolute inset-0 bg-black/20" />}
      <div className="relative z-10 h-full">{children}</div>
    </div>
  );
};

export function getCapacityLabel(attendeeCount: number, capacity?: number | null) {
  if (!capacity || capacity <= 0) return `${attendeeCount} attending`;
  return `${attendeeCount}/${capacity} spots`;
}

export function isEventFull(attendeeCount: number, capacity?: number | null) {
  return capacity != null && capacity > 0 && attendeeCount >= capacity;
}

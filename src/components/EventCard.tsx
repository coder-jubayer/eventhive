import React from 'react';
import { Link } from 'react-router-dom';
import { Event, RegistrationStatusType } from '../types';
import { format, isPast, isToday } from 'date-fns';
import { MapPin, Clock, Users, Heart } from 'lucide-react';
import { motion } from 'motion/react';
import { EventBanner, getCapacityLabel } from './EventBanner';
import { EventPriceTag, isPaidEvent } from './EventPriceTag';
import { CATEGORY_COLORS, EventCategory } from '../constants/categories';
import { useAuth } from '../context/AuthContext';

const STATUS_BADGES: Record<RegistrationStatusType, { label: string; className: string } | null> = {
  none: null,
  approved: { label: 'Registered', className: 'bg-emerald-100 text-emerald-800' },
  pending: { label: 'Pending', className: 'bg-amber-100 text-amber-800' },
  rejected: { label: 'Rejected', className: 'bg-red-100 text-red-800' },
};

interface EventCardProps {
  event: Event;
  onSaveToggle?: (eventId: string, saved: boolean) => void;
  onUnsave?: (eventId: string) => void;
}

export const EventCard: React.FC<EventCardProps> = ({ event, onSaveToggle, onUnsave }) => {
  const { user, token } = useAuth();
  const eventDate = new Date(`${event.date.split('T')[0]}T${event.time}`);

  let status = 'Upcoming';
  let statusColor = 'bg-blue-100 text-blue-800';
  if (isPast(eventDate) && !isToday(eventDate)) {
    status = 'Completed';
    statusColor = 'bg-slate-100 text-slate-700';
  } else if (isToday(eventDate)) {
    status = 'Ongoing';
    statusColor = 'bg-emerald-100 text-emerald-800';
  }

  const category = (event.category || 'Other') as EventCategory;
  const categoryColor = CATEGORY_COLORS[category] || CATEGORY_COLORS.Other;
  const regBadge = event.registrationStatus ? STATUS_BADGES[event.registrationStatus] : null;

  const handleSave = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user || !token) return;

    const isSaved = event.isSaved;
    const method = isSaved ? 'DELETE' : 'POST';
    try {
      const res = await fetch(`/api/attendee/saved/${event._id}`, {
        method,
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        if (onUnsave && isSaved) onUnsave(event._id);
        if (onSaveToggle) onSaveToggle(event._id, !isSaved);
      }
    } catch (error) {
      console.error('Save toggle failed', error);
    }
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="bg-white rounded-[32px] border border-gray-100 overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col h-full group"
    >
      <Link
        to={`/events/${event._id}`}
        className="block m-2 rounded-[24px] overflow-hidden cursor-pointer group/cover"
      >
        <EventBanner imageUrl={event.imageUrl} category={event.category} seed={event._id} name={event.name} className="h-48 rounded-[24px] p-6 flex flex-col justify-between transition-transform duration-300 group-hover/cover:scale-[1.02]">
          <div className="flex justify-between items-start gap-2">
            <div className="flex flex-wrap gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${statusColor} shadow-sm backdrop-blur-md bg-white/90`}>
                {status}
              </span>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${categoryColor} shadow-sm backdrop-blur-md bg-white/90`}>
                {category}
              </span>
              {regBadge && (
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${regBadge.className} shadow-sm backdrop-blur-md`}>
                  {regBadge.label}
                </span>
              )}
            </div>
            <div className="flex items-start gap-2">
              {user && user.role === 'user' && (
                <button
                  type="button"
                  onClick={handleSave}
                  className="p-2 rounded-full bg-white/90 shadow-sm hover:scale-110 transition-transform relative z-10"
                  title={event.isSaved ? 'Remove from saved' : 'Save event'}
                >
                  <Heart className={`w-4 h-4 ${event.isSaved ? 'fill-pink-500 text-pink-500' : 'text-gray-500'}`} />
                </button>
              )}
              <div className="bg-white/20 backdrop-blur-md rounded-xl p-2 text-white text-center min-w-[64px] shrink-0">
                <div className="text-xs font-medium uppercase">{format(new Date(event.date), 'MMM')}</div>
                <div className="text-2xl font-bold leading-none">{format(new Date(event.date), 'dd')}</div>
              </div>
            </div>
          </div>
        </EventBanner>
      </Link>

      <div className="p-6 flex-1 flex flex-col">
        <div className="flex items-start justify-between gap-3 mb-2">
          <h3 className="text-xl font-bold text-gray-900 group-hover:text-indigo-600 transition-colors line-clamp-2 flex-1 min-w-0">
            {event.name}
          </h3>
          <EventPriceTag
            price={event.price}
            isPaid={isPaidEvent(event)}
            variant="title"
            className={isPaidEvent(event) ? 'text-lg' : undefined}
          />
        </div>
        <p className="text-gray-500 line-clamp-2 text-sm mb-6 flex-1">{event.description}</p>
        <div className="space-y-3 mb-6">
          <div className="flex items-center text-sm text-gray-600 gap-3">
            <Clock className="w-4 h-4 text-gray-400" />
            <span className="font-medium">{event.time}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600 gap-3">
            <MapPin className="w-4 h-4 text-gray-400" />
            <span className="truncate font-medium">{event.location}</span>
          </div>
        </div>
        <div className="pt-4 border-t border-gray-100 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-gray-500 font-medium min-w-0">
            <Users className="w-4 h-4 shrink-0" />
            <span className="truncate">{getCapacityLabel(event.attendees.length, event.capacity)}</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Link
              to={`/events/${event._id}`}
              className="text-sm font-semibold text-gray-900 hover:text-white bg-gray-50 hover:bg-black px-4 py-2 rounded-full transition-colors"
            >
              View Details
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

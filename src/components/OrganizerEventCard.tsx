import React from 'react';
import { Link } from 'react-router-dom';
import { Event } from '../types';
import { format } from 'date-fns';
import { Clock, MapPin, Users, Edit, Trash2, Eye } from 'lucide-react';
import { motion } from 'motion/react';
import { isEventPast, isEventToday } from '../utils/eventDate';
import { EventBanner, getCapacityLabel } from './EventBanner';
import { CATEGORY_COLORS, EventCategory } from '../constants/categories';

interface OrganizerEventCardProps {
  event: Event;
  onDelete: (id: string) => void;
}

export const OrganizerEventCard: React.FC<OrganizerEventCardProps> = ({ event, onDelete }) => {
  let status = 'Upcoming';
  let statusColor = 'bg-blue-100 text-blue-800';

  if (isEventPast(event)) {
    status = 'Past';
    statusColor = 'bg-slate-100 text-slate-700';
  } else if (isEventToday(event)) {
    status = 'Today';
    statusColor = 'bg-emerald-100 text-emerald-800';
  }

  const category = (event.category || 'Other') as EventCategory;
  const categoryColor = CATEGORY_COLORS[category] || CATEGORY_COLORS.Other;

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="bg-white rounded-[32px] border border-gray-100 overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col h-full"
    >
      <Link
        to={`/events/${event._id}`}
        className="block m-2 rounded-[24px] overflow-hidden cursor-pointer group/cover"
      >
        <EventBanner imageUrl={event.imageUrl} category={event.category} seed={event._id} name={event.name} className="h-40 rounded-[24px] p-6 flex flex-col justify-between transition-transform duration-300 group-hover/cover:scale-[1.02]">
          <div className="flex flex-wrap gap-2">
            <span className={`w-fit px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${statusColor} shadow-sm backdrop-blur-md bg-white/90`}>
              {status}
            </span>
            <span className={`w-fit px-3 py-1 rounded-full text-xs font-bold ${categoryColor} shadow-sm backdrop-blur-md bg-white/90`}>
              {category}
            </span>
          </div>
          <div className="text-white">
            <div className="text-xs font-medium uppercase opacity-80">{format(new Date(event.date), 'MMM dd, yyyy')}</div>
            <h3 className="text-xl font-bold line-clamp-2">{event.name}</h3>
          </div>
        </EventBanner>
      </Link>

      <div className="p-6 flex-1 flex flex-col">
        <p className="text-gray-500 line-clamp-2 text-sm mb-4 flex-1">{event.description}</p>

        <div className="space-y-2 mb-6">
          <div className="flex items-center text-sm text-gray-600 gap-2">
            <Clock className="w-4 h-4 text-gray-400" />
            <span>{event.time}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600 gap-2">
            <MapPin className="w-4 h-4 text-gray-400" />
            <span className="truncate">{event.location}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600 gap-2">
            <Users className="w-4 h-4 text-gray-400" />
            <span>{getCapacityLabel(event.attendees.length, event.capacity)}</span>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-100 flex items-center gap-2">
          <Link
            to={`/events/${event._id}`}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-50 hover:bg-black hover:text-white text-gray-900 rounded-xl font-semibold text-sm transition-colors"
          >
            <Eye className="w-4 h-4" /> View
          </Link>
          <Link
            to={`/events/${event._id}/edit`}
            className="inline-flex items-center justify-center p-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
          >
            <Edit className="w-4 h-4" />
          </Link>
          <button
            onClick={() => onDelete(event._id)}
            className="inline-flex items-center justify-center p-2.5 bg-white border border-red-100 text-red-600 rounded-xl hover:bg-red-50 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Event, OrganizerProfile } from '../types';
import { EventCard } from '../components/EventCard';
import { ArrowLeft, Globe, Linkedin, Mail, CalendarDays } from 'lucide-react';

export const OrganizerPublicProfile: React.FC = () => {
  const { id } = useParams();
  const [organizer, setOrganizer] = useState<OrganizerProfile | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, [id]);

  const fetchProfile = async () => {
    try {
      const res = await fetch(`/api/organizers/${id}`);
      if (res.ok) {
        const data = await res.json();
        setOrganizer(data.organizer);
        setEvents(data.events);
      }
    } catch (error) {
      console.error('Failed to fetch organizer profile', error);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-32">
        <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!organizer) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Organizer not found</h1>
        <Link to="/events" className="text-indigo-600 font-semibold hover:underline">Browse events</Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link to="/events" className="inline-flex items-center gap-2 text-gray-500 hover:text-indigo-600 transition-colors font-medium mb-8">
        <ArrowLeft className="w-4 h-4" /> Back to events
      </Link>

      <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm p-8 md:p-12 mb-10">
        <div className="flex flex-col md:flex-row gap-8 items-start">
          <div className="w-24 h-24 rounded-full bg-indigo-100 text-indigo-700 font-black text-4xl flex items-center justify-center uppercase shrink-0">
            {organizer.name.charAt(0)}
          </div>
          <div className="flex-1">
            <h1 className="text-4xl font-extrabold text-gray-900 mb-2">{organizer.name}</h1>
            <p className="text-indigo-600 font-semibold mb-4">Event Organizer</p>

            {organizer.bio && (
              <p className="text-gray-600 leading-relaxed text-lg mb-6 max-w-2xl">{organizer.bio}</p>
            )}

            <div className="flex flex-wrap gap-4 text-sm">
              <span className="flex items-center gap-2 text-gray-500">
                <Mail className="w-4 h-4" /> {organizer.email}
              </span>
              <span className="flex items-center gap-2 text-gray-500">
                <CalendarDays className="w-4 h-4" /> {events.length} events hosted
              </span>
              {organizer.website && (
                <a href={organizer.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-indigo-600 font-medium hover:underline">
                  <Globe className="w-4 h-4" /> Website
                </a>
              )}
              {organizer.linkedin && (
                <a href={organizer.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-indigo-600 font-medium hover:underline">
                  <Linkedin className="w-4 h-4" /> LinkedIn
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mb-6">Events by {organizer.name}</h2>

      {events.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {events.map((event) => (
            <EventCard key={event._id} event={event} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-[32px] border border-gray-200 border-dashed">
          <p className="text-gray-500">No events from this organizer yet.</p>
        </div>
      )}
    </div>
  );
};

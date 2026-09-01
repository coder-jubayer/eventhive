import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Event } from '../types';
import { OrganizerEventCard } from '../components/OrganizerEventCard';
import { Plus, CalendarDays } from 'lucide-react';
import { motion } from 'motion/react';

type Tab = 'upcoming' | 'past';

export const MyEvents: React.FC = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('upcoming');
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (user.role !== 'organizer') {
      navigate('/dashboard');
      return;
    }
    fetchEvents();
  }, [user, navigate, tab]);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/organizer/events?status=${tab}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setEvents(await res.json());
      }
    } catch (error) {
      console.error('Failed to fetch events', error);
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;

    try {
      const res = await fetch(`/api/events/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setEvents((prev) => prev.filter((e) => e._id !== id));
      }
    } catch (error) {
      console.error('Failed to delete event', error);
    }
  };

  if (!user || user.role !== 'organizer') return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">My Events</h1>
          <p className="text-gray-500 font-medium mt-1">Manage all events you have created.</p>
        </div>
        <Link
          to="/events/create"
          className="bg-black text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-black/10 hover:bg-gray-800 transition-all"
        >
          <Plus className="w-5 h-5" />
          Create Event
        </Link>
      </header>

      <div className="flex gap-2 mb-8 bg-white p-2 rounded-2xl border border-gray-100 w-fit">
        {(['upcoming', 'past'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-5 py-2.5 rounded-xl font-bold text-sm capitalize transition-colors ${
              tab === t ? 'bg-indigo-600 text-white' : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
        </div>
      ) : events.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {events.map((event, index) => (
            <motion.div
              key={event._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
            >
              <OrganizerEventCard event={event} onDelete={handleDelete} />
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-[32px] border border-gray-200 border-dashed">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
            <CalendarDays className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            No {tab} events
          </h3>
          <p className="text-gray-500 mb-6">
            {tab === 'upcoming'
              ? 'Create a new event to get started.'
              : 'Past events will appear here after they end.'}
          </p>
          {tab === 'upcoming' && (
            <Link
              to="/events/create"
              className="inline-flex px-6 py-3 bg-black hover:bg-gray-800 text-white rounded-xl font-bold transition-colors"
            >
              Create Event
            </Link>
          )}
        </div>
      )}
    </div>
  );
};

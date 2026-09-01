import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Event } from '../types';
import { EventCard } from '../components/EventCard';
import { Heart } from 'lucide-react';
import { motion } from 'motion/react';

export const SavedEvents: React.FC = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchSaved();
  }, [user, navigate]);

  const fetchSaved = async () => {
    try {
      const res = await fetch('/api/attendee/saved', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setEvents(await res.json());
    } catch (error) {
      console.error('Failed to fetch saved events', error);
    }
    setLoading(false);
  };

  const handleUnsave = async (eventId: string) => {
    try {
      const res = await fetch(`/api/attendee/saved/${eventId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setEvents((prev) => prev.filter((e) => e._id !== eventId));
    } catch (error) {
      console.error('Failed to unsave', error);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Saved Events</h1>
        <p className="text-gray-500 font-medium mt-1">Events you bookmarked for later.</p>
      </header>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
        </div>
      ) : events.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {events.map((event, index) => (
            <motion.div key={event._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
              <EventCard event={{ ...event, isSaved: true }} onUnsave={handleUnsave} />
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-[32px] border border-gray-200 border-dashed">
          <Heart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">No saved events</h3>
          <p className="text-gray-500 mb-6">Save events while browsing to find them here later.</p>
          <Link to="/events" className="inline-flex px-6 py-3 bg-black text-white rounded-xl font-bold hover:bg-gray-800">
            Explore Events
          </Link>
        </div>
      )}
    </div>
  );
};

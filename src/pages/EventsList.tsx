import React, { useState, useEffect } from 'react';
import { Event } from '../types';
import { EventCard } from '../components/EventCard';
import { Search } from 'lucide-react';
import { motion } from 'motion/react';
import { EVENT_CATEGORIES } from '../constants/categories';
import { useAuth } from '../context/AuthContext';

export const EventsList: React.FC = () => {
  const { token } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [priceType, setPriceType] = useState('all');
  const [sort, setSort] = useState('date');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, [search, category, priceType, sort]);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (category !== 'all') params.set('category', category);
      if (priceType !== 'all') params.set('priceType', priceType);
      if (sort !== 'date') params.set('sort', sort);
      const url = params.toString() ? `/api/events?${params}` : '/api/events';
      const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await fetch(url, { headers });
      if (res.ok) {
        setEvents(await res.json());
      }
    } catch (error) {
      console.error('Failed to fetch events', error);
    }
    setLoading(false);
  };

  const handleSaveToggle = (eventId: string, saved: boolean) => {
    setEvents((prev) =>
      prev.map((e) => (e._id === eventId ? { ...e, isSaved: saved } : e))
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-8">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-4">Discover Events</h1>
          <p className="text-lg text-gray-500 max-w-2xl">Find your next experience from our curated list of upcoming activities and gatherings.</p>
        </div>

        <div className="w-full md:w-auto relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-indigo-500 transition-colors">
            <Search className="w-5 h-5" />
          </div>
          <input
            type="text"
            placeholder="Search events by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full md:w-80 pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm text-gray-900 placeholder:text-gray-400"
          />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'all', label: 'All' },
            { id: 'free', label: 'Free' },
            { id: 'paid', label: 'Paid' },
          ].map((opt) => (
            <button
              key={opt.id}
              onClick={() => setPriceType(opt.id)}
              className={`px-4 py-2 rounded-full text-sm font-bold transition-colors ${
                priceType === opt.id ? 'bg-black text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
        >
          <option value="date">Sort by Date</option>
          <option value="newest">Newest First</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
        </select>
      </div>

      <div className="flex flex-wrap gap-2 mb-10">
        <button
          onClick={() => setCategory('all')}
          className={`px-4 py-2 rounded-full text-sm font-bold transition-colors ${
            category === 'all' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
          }`}
        >
          All Categories
        </button>
        {EVENT_CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`px-4 py-2 rounded-full text-sm font-bold transition-colors ${
              category === cat ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {cat}
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
              <EventCard event={event} onSaveToggle={handleSaveToggle} />
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-[32px] border border-gray-200 border-dashed">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
            <Search className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No events found</h3>
          <p className="text-gray-500">Try adjusting your search or filters.</p>
        </div>
      )}
    </div>
  );
};

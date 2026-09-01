import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ScheduleItem } from '../types';
import { EventCard } from '../components/EventCard';
import { CalendarDays } from 'lucide-react';
import { motion } from 'motion/react';

type Tab = 'upcoming' | 'past' | 'pending';

export const MySchedule: React.FC = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('upcoming');
  const [items, setItems] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (user.role === 'organizer') {
      navigate('/my-events');
      return;
    }
    fetchSchedule();
  }, [user, navigate, tab]);

  const fetchSchedule = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/attendee/schedule?status=${tab}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setItems(await res.json());
    } catch (error) {
      console.error('Failed to fetch schedule', error);
    }
    setLoading(false);
  };

  if (!user || user.role !== 'user') return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">My Schedule</h1>
        <p className="text-gray-500 font-medium mt-1">Your upcoming events, past events, and pending payments.</p>
      </header>

      <div className="flex gap-2 mb-8 bg-white p-2 rounded-2xl border border-gray-100 w-fit flex-wrap">
        {(['upcoming', 'past', 'pending'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-5 py-2.5 rounded-xl font-bold text-sm capitalize transition-colors ${
              tab === t ? 'bg-indigo-600 text-white' : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            {t === 'pending' ? 'Pending Payment' : t}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
        </div>
      ) : items.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {items.map((item, index) => (
            <motion.div
              key={item.event._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
            >
              <EventCard
                event={{
                  ...item.event,
                  registrationStatus: item.registrationStatus,
                }}
              />
              {tab === 'pending' && item.payment && (
                <div className="mt-2 px-4 py-3 bg-amber-50 border border-amber-100 rounded-xl text-sm">
                  <span className="text-amber-800 font-medium">
                    TrxID: <span className="font-mono">{item.payment.transactionId}</span> · ৳{item.payment.amount}
                  </span>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-[32px] border border-gray-200 border-dashed">
          <CalendarDays className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            {tab === 'pending' ? 'No pending payments' : `No ${tab} events`}
          </h3>
          <p className="text-gray-500 mb-6">
            {tab === 'upcoming' ? 'Browse events and register for something new.' : 'Nothing here yet.'}
          </p>
          {tab === 'upcoming' && (
            <Link to="/events" className="inline-flex px-6 py-3 bg-black text-white rounded-xl font-bold hover:bg-gray-800">
              Explore Events
            </Link>
          )}
        </div>
      )}
    </div>
  );
};

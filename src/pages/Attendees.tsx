import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AttendeeEntry } from '../types';
import { format } from 'date-fns';
import { Search, Users, Mail, Calendar } from 'lucide-react';

export const Attendees: React.FC = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [attendees, setAttendees] = useState<AttendeeEntry[]>([]);
  const [search, setSearch] = useState('');
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
  }, [user, navigate]);

  useEffect(() => {
    if (!user || user.role !== 'organizer') return;

    const timer = setTimeout(() => {
      fetchAttendees();
    }, 300);

    return () => clearTimeout(timer);
  }, [user, search]);

  const fetchAttendees = async () => {
    setLoading(true);
    try {
      const url = search
        ? `/api/organizer/attendees?search=${encodeURIComponent(search)}`
        : '/api/organizer/attendees';
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setAttendees(await res.json());
      }
    } catch (error) {
      console.error('Failed to fetch attendees', error);
    }
    setLoading(false);
  };

  if (!user || user.role !== 'organizer') return null;

  const uniqueCount = new Set(attendees.map((a) => a.attendee._id)).size;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Attendees</h1>
          <p className="text-gray-500 font-medium mt-1">
            Everyone registered across your events.
          </p>
        </div>

        <div className="relative w-full md:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search name, email, or event..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm"
          />
        </div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="text-sm text-gray-500 font-medium mb-1">Total registrations</div>
          <div className="text-3xl font-black text-gray-900">{attendees.length}</div>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="text-sm text-gray-500 font-medium mb-1">Unique attendees</div>
          <div className="text-3xl font-black text-gray-900">{uniqueCount}</div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
        </div>
      ) : attendees.length > 0 ? (
        <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/80">
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Attendee</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Event</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Event date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {attendees.map((entry, i) => (
                  <tr key={`${entry.attendee._id}-${entry.event._id}-${i}`} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center uppercase shrink-0">
                          {entry.attendee.name.charAt(0)}
                        </div>
                        <span className="font-semibold text-gray-900">{entry.attendee.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-gray-400 shrink-0" />
                        {entry.attendee.email}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Link
                        to={`/events/${entry.event._id}`}
                        className="font-medium text-indigo-600 hover:text-indigo-800 hover:underline"
                      >
                        {entry.event.name}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400 shrink-0" />
                        {format(new Date(entry.event.date), 'MMM d, yyyy')} · {entry.event.time}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-[32px] border border-gray-200 border-dashed">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
            <Users className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No attendees yet</h3>
          <p className="text-gray-500">
            {search ? 'No results match your search.' : 'Registrations will show up here when people join your events.'}
          </p>
        </div>
      )}
    </div>
  );
};

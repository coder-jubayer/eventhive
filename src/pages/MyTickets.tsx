import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { TicketItem } from '../types';
import { format } from 'date-fns';
import { Ticket, MapPin, Clock, Calendar } from 'lucide-react';
import { EventBanner } from '../components/EventBanner';

export const MyTickets: React.FC = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [tickets, setTickets] = useState<TicketItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (user.role === 'organizer') {
      navigate('/dashboard');
      return;
    }
    fetchTickets();
  }, [user, navigate]);

  const fetchTickets = async () => {
    try {
      const res = await fetch('/api/attendee/tickets', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setTickets(await res.json());
    } catch (error) {
      console.error('Failed to fetch tickets', error);
    }
    setLoading(false);
  };

  if (!user || user.role !== 'user') return null;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">My Tickets</h1>
        <p className="text-gray-500 font-medium mt-1">All your confirmed event tickets in one place.</p>
      </header>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
        </div>
      ) : tickets.length > 0 ? (
        <div className="space-y-6">
          {tickets.map((ticket) => (
            <div key={`${ticket.event._id}-${ticket.ticketCode}`} className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
              <div className="flex flex-col md:flex-row">
                <EventBanner
                  imageUrl={ticket.event.imageUrl}
                  category={ticket.event.category}
                  seed={ticket.event._id}
                  name={ticket.event.name}
                  className="h-40 md:h-auto md:w-48 shrink-0"
                />
                <div className="p-6 flex-1 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{ticket.event.name}</h3>
                    <div className="space-y-1 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        {format(new Date(ticket.event.date), 'MMM d, yyyy')}
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-400" />
                        {ticket.event.time}
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        {ticket.event.location}
                      </div>
                    </div>
                    <div className="mt-3 font-mono text-sm bg-gray-50 px-3 py-1.5 rounded-lg inline-block">
                      {ticket.ticketCode}
                    </div>
                  </div>
                  <Link
                    to={`/events/${ticket.event._id}/ticket`}
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shrink-0"
                  >
                    <Ticket className="w-4 h-4" /> View Ticket
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-[32px] border border-gray-200 border-dashed">
          <Ticket className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">No tickets yet</h3>
          <p className="text-gray-500 mb-6">Register for events to get your tickets here.</p>
          <Link to="/events" className="inline-flex px-6 py-3 bg-black text-white rounded-xl font-bold hover:bg-gray-800">
            Explore Events
          </Link>
        </div>
      )}
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Event, RegistrationStatus } from '../types';
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';
import { Ticket, ArrowLeft, MapPin, Clock, Calendar, CalendarPlus } from 'lucide-react';
import { EventBanner } from '../components/EventBanner';
import { getGoogleCalendarUrl } from '../utils/calendar';

function getTicketCode(event: Event, registration: RegistrationStatus) {
  if (registration.payment?.ticketCode) return registration.payment.ticketCode;
  return `FREE-${event._id.slice(-6).toUpperCase()}`;
}

export const EventTicket: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [event, setEvent] = useState<Event | null>(null);
  const [registration, setRegistration] = useState<RegistrationStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchData();
  }, [user, id, navigate]);

  const fetchData = async () => {
    try {
      const [eventRes, statusRes] = await Promise.all([
        fetch(`/api/events/${id}`),
        fetch(`/api/events/${id}/registration-status`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      if (eventRes.ok) setEvent(await eventRes.json());
      if (statusRes.ok) setRegistration(await statusRes.json());
    } catch (error) {
      console.error('Failed to load ticket', error);
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

  if (!event || !registration || registration.status !== 'approved') {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Ticket not available</h1>
        <p className="text-gray-500 mb-6">You must be registered and approved for this event.</p>
        <Link to={`/events/${id}`} className="text-indigo-600 font-semibold hover:underline">
          Back to event
        </Link>
      </div>
    );
  }

  const ticketCode = getTicketCode(event, registration);
  const isPaid = registration.payment && registration.payment.amount > 0;

  return (
    <div className="max-w-lg mx-auto px-4 sm:px-6 py-8">
      <Link to={`/events/${id}`} className="inline-flex items-center gap-2 text-gray-500 hover:text-indigo-600 font-medium mb-8">
        <ArrowLeft className="w-4 h-4" /> Back to event
      </Link>

      <div className="bg-white rounded-[32px] border border-gray-100 shadow-lg overflow-hidden">
        <EventBanner imageUrl={event.imageUrl} category={event.category} seed={event._id} name={event.name} className="h-40">
          <div className="absolute bottom-4 left-4 right-4">
            <div className="flex items-center gap-2 text-white">
              <Ticket className="w-6 h-6" />
              <span className="font-bold text-lg">Your Ticket</span>
            </div>
          </div>
        </EventBanner>

        <div className="p-8">
          <h1 className="text-2xl font-extrabold text-gray-900 mb-2">{event.name}</h1>
          <p className="text-emerald-600 font-bold text-sm uppercase tracking-wider mb-6">
            Confirmed · {isPaid ? 'Paid' : 'Free'}
          </p>

          <div className="bg-gray-50 rounded-2xl p-6 mb-6 border border-dashed border-gray-200 text-center">
            <div className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-2">Ticket Code</div>
            <div className="text-2xl font-black text-gray-900 font-mono tracking-wide">
              {ticketCode}
            </div>
          </div>

          <div className="space-y-4 text-sm">
            <div className="flex items-center gap-3 text-gray-700">
              <Calendar className="w-4 h-4 text-gray-400" />
              {format(new Date(event.date), 'EEEE, MMMM do, yyyy')}
            </div>
            <div className="flex items-center gap-3 text-gray-700">
              <Clock className="w-4 h-4 text-gray-400" />
              {event.time}
            </div>
            <div className="flex items-center gap-3 text-gray-700">
              <MapPin className="w-4 h-4 text-gray-400" />
              {event.location}
            </div>
          </div>

          <div className="flex flex-wrap gap-3 mt-6">
            <a
              href={getGoogleCalendarUrl(event)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <CalendarPlus className="w-4 h-4" /> Google Calendar
            </a>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-100 text-sm text-gray-500">
            {isPaid && registration.payment && (
              <>
                <div>Amount paid: <span className="font-bold text-gray-900">৳{registration.payment.amount}</span></div>
                <div className="mt-1">TrxID: <span className="font-mono text-gray-700">{registration.payment.transactionId}</span></div>
              </>
            )}
            <div className="mt-1">Attendee: <span className="font-semibold text-gray-900">{user?.name}</span></div>
          </div>
        </div>
      </div>
    </div>
  );
};

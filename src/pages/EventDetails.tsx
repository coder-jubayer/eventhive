import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Event, RegistrationStatus } from '../types';
import { useAuth } from '../context/AuthContext';
import { format, isPast, isToday } from 'date-fns';
import { Calendar, MapPin, Clock, Users, User as UserIcon, ArrowLeft, Edit, Trash2, Ticket, Banknote, Share2, Heart, Navigation, CalendarPlus } from 'lucide-react';
import { EventBanner, getCapacityLabel, isEventFull } from '../components/EventBanner';
import { EventPriceTag, formatTicketPrice, isPaidEvent } from '../components/EventPriceTag';
import { CATEGORY_COLORS, EventCategory } from '../constants/categories';
import { shareEvent, getGoogleMapsUrl } from '../utils/share';
import { getGoogleCalendarUrl } from '../utils/calendar';

export const EventDetails: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [event, setEvent] = useState<Event | null>(null);
  const [registration, setRegistration] = useState<RegistrationStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [registerError, setRegisterError] = useState('');
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [transactionId, setTransactionId] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    fetchEvent();
  }, [id]);

  useEffect(() => {
    if (user && event) fetchRegistrationStatus();
  }, [user, event?._id]);

  const fetchEvent = async () => {
    try {
      const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await fetch(`/api/events/${id}`, { headers });
      if (res.ok) {
        const data = await res.json();
        setEvent(data);
        setIsSaved(!!data.isSaved);
      } else {
        navigate('/events');
      }
    } catch (error) {
      console.error('Failed to fetch event details', error);
    }
    setLoading(false);
  };

  const fetchRegistrationStatus = async () => {
    if (!token) return;
    try {
      const res = await fetch(`/api/events/${id}/registration-status`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setRegistration(await res.json());
    } catch (error) {
      console.error('Failed to fetch registration status', error);
    }
  };

  const handleFreeRegister = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    setRegistering(true);
    setRegisterError('');
    try {
      const res = await fetch(`/api/events/${id}/register`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        fetchEvent();
        fetchRegistrationStatus();
      } else {
        setRegisterError(data.error || 'Registration failed');
      }
    } catch {
      setRegisterError('Something went wrong. Please try again.');
    }
    setRegistering(false);
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }
    setRegistering(true);
    setRegisterError('');
    try {
      const res = await fetch(`/api/events/${id}/register`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ transactionId }),
      });
      const data = await res.json();
      if (res.ok) {
        setShowPaymentForm(false);
        setTransactionId('');
        fetchRegistrationStatus();
      } else {
        setRegisterError(data.error || 'Payment submission failed');
      }
    } catch {
      setRegisterError('Something went wrong. Please try again.');
    }
    setRegistering(false);
  };

  const handleCancel = async () => {
    setRegistering(true);
    setRegisterError('');
    try {
      const res = await fetch(`/api/events/${id}/register`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setShowPaymentForm(false);
        setTransactionId('');
        fetchEvent();
        fetchRegistrationStatus();
      }
    } catch {
      setRegisterError('Failed to cancel.');
    }
    setRegistering(false);
  };

  const handleSaveToggle = async () => {
    if (!user || !token) {
      navigate('/login');
      return;
    }
    const method = isSaved ? 'DELETE' : 'POST';
    try {
      const res = await fetch(`/api/attendee/saved/${id}`, {
        method,
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setIsSaved(!isSaved);
    } catch (error) {
      console.error('Save toggle failed', error);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;
    try {
      const res = await fetch(`/api/events/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) navigate('/dashboard');
    } catch (error) {
      console.error('Failed to delete event', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-32">
        <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!event) return null;

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
  const full = isEventFull(event.attendees.length, event.capacity);
  const isPaid = isPaidEvent(event);
  const bkashNumber = event.organizer.bkashNumber || '';
  const isOrganizer = user && (user._id === event.organizer._id || user.role === 'admin');
  const regStatus = registration?.status || 'none';
  const isRegistered = regStatus === 'approved';

  const renderParticipantActions = () => {
    if (regStatus === 'approved') {
      return (
        <div className="flex flex-col gap-3 w-full md:w-auto">
          <Link
            to={`/events/${id}/ticket`}
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold text-lg transition-all shadow-sm"
          >
            <Ticket className="w-5 h-5" /> View Ticket
          </Link>
          <button
            onClick={handleCancel}
            disabled={registering}
            className="px-8 py-3 rounded-2xl font-bold text-gray-600 hover:bg-gray-50 border border-gray-200 transition-all disabled:opacity-60"
          >
            Cancel Registration
          </button>
        </div>
      );
    }

    if (regStatus === 'pending') {
      return (
        <div className="flex flex-col gap-3 w-full md:w-auto">
          <div className="px-6 py-4 bg-amber-50 border border-amber-200 rounded-2xl text-center">
            <p className="font-bold text-amber-800">Payment pending approval</p>
            <p className="text-sm text-amber-700 mt-1">The organizer will verify your bKash payment.</p>
          </div>
          <button
            onClick={handleCancel}
            disabled={registering}
            className="px-8 py-3 rounded-2xl font-bold text-gray-600 hover:bg-gray-50 border border-gray-200 transition-all disabled:opacity-60"
          >
            Cancel Payment Request
          </button>
        </div>
      );
    }

    if (isPaid) {
      if (!showPaymentForm) {
        return (
          <button
            onClick={() => {
              if (!user) navigate('/login');
              else setShowPaymentForm(true);
            }}
            disabled={full}
            className="px-8 py-4 rounded-2xl font-bold text-lg bg-black text-white hover:bg-gray-800 transition-all shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {full ? 'Event Full' : `Register & Pay ৳${formatTicketPrice(event.price ?? 0)}`}
          </button>
        );
      }
      return null;
    }

    return (
      <button
        onClick={handleFreeRegister}
        disabled={registering || full}
        className={`px-8 py-4 rounded-2xl font-bold text-lg transition-all shadow-sm disabled:opacity-60 disabled:cursor-not-allowed ${
          full ? 'bg-gray-200 text-gray-500' : 'bg-black text-white hover:bg-gray-800'
        }`}
      >
        {registering ? 'Processing...' : full ? 'Event Full' : 'Register Now'}
      </button>
    );
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link to="/events" className="inline-flex items-center gap-2 text-gray-500 hover:text-indigo-600 transition-colors font-medium mb-8">
        <ArrowLeft className="w-4 h-4" /> Back to events
      </Link>

      <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
        <EventBanner imageUrl={event.imageUrl} category={event.category} seed={event._id} name={event.name} className="h-64 md:h-80 m-2 rounded-[24px] relative">
          <div className="absolute inset-0 p-6 flex flex-col justify-start z-10">
            <div className="flex flex-wrap gap-2">
              <span className={`px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-wider ${statusColor} shadow-sm backdrop-blur-md bg-white/90`}>
                {status}
              </span>
              <span className={`px-4 py-1.5 rounded-full text-sm font-bold ${categoryColor} shadow-sm backdrop-blur-md bg-white/90`}>
                {category}
              </span>
            </div>
          </div>
        </EventBanner>

        <div className="p-8 md:p-12">
          <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-8 mb-8">
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                <h1 className="text-4xl font-extrabold text-gray-900 flex-1 min-w-0">{event.name}</h1>
                <EventPriceTag price={event.price} isPaid={isPaid} variant="title" />
              </div>
              <Link
                to={`/organizers/${event.organizer._id}`}
                className="inline-flex items-center gap-3 text-gray-600 font-medium bg-gray-50 w-fit px-4 py-2 rounded-full border border-gray-100 hover:bg-indigo-50 hover:border-indigo-100 transition-colors"
              >
                <UserIcon className="w-4 h-4" />
                <span>Organized by <span className="text-gray-900 font-bold">{event.organizer.name}</span></span>
              </Link>
            </div>

            <div className="flex-shrink-0 flex flex-col gap-3 w-full md:w-72">
              {registerError && (
                <p className="text-sm text-red-600 font-medium text-center">{registerError}</p>
              )}
              {isOrganizer ? (
                <div className="flex gap-2">
                  <Link
                    to={`/events/${id}/edit`}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-white border-2 border-gray-200 text-gray-700 font-bold rounded-2xl hover:bg-gray-50 transition-colors"
                  >
                    <Edit className="w-4 h-4" /> Edit
                  </Link>
                  <button
                    onClick={handleDelete}
                    className="flex-shrink-0 inline-flex items-center justify-center p-3 bg-white border-2 border-red-100 text-red-600 rounded-2xl hover:bg-red-50 hover:border-red-200 transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                renderParticipantActions()
              )}
            </div>
          </div>

          {isPaid && showPaymentForm && !isOrganizer && regStatus !== 'pending' && regStatus !== 'approved' && (
            <div className="mb-8 bg-pink-50 border border-pink-100 rounded-2xl p-6 md:p-8">
              <div className="flex items-center gap-3 mb-4">
                <Banknote className="w-6 h-6 text-pink-600" />
                <h3 className="text-xl font-bold text-gray-900">Pay with bKash</h3>
              </div>

              <p className="text-gray-700 font-medium mb-4">
                Send money to this bKash number:{' '}
                <span className="font-black text-pink-700 text-lg">{bkashNumber || 'Not set by organizer'}</span>
              </p>

              <ol className="list-decimal list-inside space-y-2 text-gray-700 mb-6 bg-white rounded-xl p-4 border border-pink-100">
                <li>Open bKash app</li>
                <li>Tap <strong>Send Money</strong></li>
                <li>Enter number: <strong>{bkashNumber}</strong></li>
                <li>Enter amount: <strong>৳{formatTicketPrice(event.price ?? 0)}</strong></li>
                <li>Confirm the payment</li>
                <li>Copy the <strong>Transaction ID</strong></li>
                <li>Paste it below and submit</li>
              </ol>

              <form onSubmit={handlePaymentSubmit} className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  required
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  placeholder="Paste Transaction ID here"
                  className="flex-1 px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 font-mono"
                />
                <button
                  type="submit"
                  disabled={registering || !bkashNumber}
                  className="px-6 py-3 bg-pink-600 hover:bg-pink-700 text-white rounded-xl font-bold transition-colors disabled:opacity-60"
                >
                  {registering ? 'Submitting...' : 'Submit Payment'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowPaymentForm(false)}
                  className="px-6 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50"
                >
                  Cancel
                </button>
              </form>

              {regStatus === 'rejected' && (
                <p className="mt-4 text-sm text-red-600 font-medium">
                  Your previous payment was rejected. Please verify the transaction ID and try again.
                </p>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-8 border-y border-gray-100 mb-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <div className="text-sm text-gray-500 font-medium mb-1">Date</div>
                <div className="font-semibold text-gray-900">{format(new Date(event.date), 'EEEE, MMMM do, yyyy')}</div>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <div className="text-sm text-gray-500 font-medium mb-1">Time</div>
                <div className="font-semibold text-gray-900">{event.time}</div>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0">
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <div className="text-sm text-gray-500 font-medium mb-1">Location</div>
                <div className="font-semibold text-gray-900">{event.location}</div>
                {event.district && (
                  <div className="text-sm text-gray-500 font-medium mt-1">{event.district}, Bangladesh</div>
                )}
                <a
                  href={getGoogleMapsUrl(event)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-indigo-600 font-semibold mt-1 hover:underline"
                >
                  <Navigation className="w-3.5 h-3.5" /> Get directions
                </a>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 mb-8">
            <button
              onClick={() => shareEvent(event)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <Share2 className="w-4 h-4" /> Share
            </button>
            <a
              href={getGoogleCalendarUrl(event)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <CalendarPlus className="w-4 h-4" /> Google Calendar
            </a>
            {user && user.role === 'user' && !isOrganizer && (
              <button
                onClick={handleSaveToggle}
                className={`inline-flex items-center gap-2 px-4 py-2.5 border rounded-xl text-sm font-bold transition-colors ${
                  isSaved
                    ? 'bg-pink-50 border-pink-200 text-pink-700 hover:bg-pink-100'
                    : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Heart className={`w-4 h-4 ${isSaved ? 'fill-pink-500 text-pink-500' : ''}`} />
                {isSaved ? 'Saved' : 'Save Event'}
              </button>
            )}
          </div>

          <div className="max-w-none mb-12">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">About this event</h3>
            <p className="text-gray-600 leading-relaxed text-lg whitespace-pre-line">{event.description}</p>
          </div>

          <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 mb-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm text-gray-400 border border-gray-100">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <div className="font-bold text-gray-900 text-lg">
                  {getCapacityLabel(event.attendees.length, event.capacity)}
                </div>
                <div className="text-sm text-gray-500 font-medium">
                  {full ? 'No spots remaining' : 'People attending'}
                </div>
              </div>
            </div>

            {isOrganizer && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Registered attendees</h4>
                  <Link to="/payments" className="text-sm font-semibold text-pink-600 hover:text-pink-800">
                    Review pending payments →
                  </Link>
                </div>
                {event.attendees.length > 0 ? (
                  <div className="space-y-3">
                    {event.attendees.map((attendee) => {
                      const person = typeof attendee === 'string' ? null : attendee;
                      if (!person) return null;
                      return (
                        <div key={person._id} className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-100">
                          <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center uppercase text-sm">
                            {person.name.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <div className="font-semibold text-gray-900 truncate">{person.name}</div>
                            <div className="text-sm text-gray-500 truncate">{person.email}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No confirmed attendees yet.</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

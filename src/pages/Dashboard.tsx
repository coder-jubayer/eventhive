import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Event, OrganizerOverview, AttendeeOverview } from '../types';
import { EventCard } from '../components/EventCard';
import { format } from 'date-fns';
import {
  Plus,
  LayoutDashboard,
  Search,
  Calendar,
  Users,
  Clock,
  MapPin,
  ArrowRight,
  FolderOpen,
  UserCircle,
  Ticket,
  Heart,
} from 'lucide-react';
import { motion } from 'motion/react';

export const Dashboard: React.FC = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [events, setEvents] = useState<Event[]>([]);
  const [overview, setOverview] = useState<OrganizerOverview | AttendeeOverview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchDashboardData();
  }, [user, navigate]);

  const fetchDashboardData = async () => {
    try {
      if (user?.role === 'organizer') {
        const [overviewRes, eventsRes] = await Promise.all([
          fetch('/api/organizer/overview', { headers: { Authorization: `Bearer ${token}` } }),
          fetch('/api/users/dashboard', { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        if (overviewRes.ok) setOverview(await overviewRes.json());
        if (eventsRes.ok) {
          const data = await eventsRes.json();
          setEvents(data.events);
        }
      } else {
        const [overviewRes, eventsRes] = await Promise.all([
          fetch('/api/attendee/overview', { headers: { Authorization: `Bearer ${token}` } }),
          fetch('/api/users/dashboard', { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        if (overviewRes.ok) setOverview(await overviewRes.json());
        if (eventsRes.ok) {
          const data = await eventsRes.json();
          setEvents(data.events);
        }
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data', error);
    }
    setLoading(false);
  };

  if (!user) return null;

  if (user.role === 'organizer') {
    const stats = overview?.stats;
    const upcomingEvent = overview?.upcomingEvent;

    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Organizer Dashboard</h1>
            <p className="text-gray-500 font-medium mt-1">Welcome back, {user.name}. Here is your event overview.</p>
          </div>
          <Link
            to="/events/create"
            className="bg-black text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-black/10 hover:bg-gray-800 transition-all"
          >
            <Plus className="w-5 h-5" />
            Create Event
          </Link>
        </header>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {[
                { label: 'Total Events', value: stats?.totalEvents ?? 0, icon: LayoutDashboard },
                { label: 'Upcoming', value: stats?.upcomingEvents ?? 0, icon: Calendar },
                { label: 'Total Attendees', value: stats?.totalAttendees ?? 0, icon: Users },
                { label: 'This Month', value: stats?.eventsThisMonth ?? 0, icon: Calendar },
              ].map((stat) => (
                <div key={stat.label} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                      <stat.icon className="w-5 h-5" />
                    </div>
                    <span className="text-sm font-medium text-gray-500">{stat.label}</span>
                  </div>
                  <div className="text-3xl font-black text-gray-900">{stat.value}</div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <div className="lg:col-span-2 bg-white rounded-[32px] p-8 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">Next Upcoming Event</h2>
                  {upcomingEvent && (
                    <Link to={`/events/${upcomingEvent._id}`} className="text-sm font-semibold text-indigo-600 hover:text-indigo-800">
                      View details
                    </Link>
                  )}
                </div>
                {upcomingEvent ? (
                  <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-8 text-white">
                    <div className="text-sm font-medium text-indigo-100 mb-2">
                      {format(new Date(upcomingEvent.date), 'EEEE, MMMM do, yyyy')} · {upcomingEvent.time}
                    </div>
                    <h3 className="text-2xl font-bold mb-4">{upcomingEvent.name}</h3>
                    <div className="flex flex-wrap gap-4 text-sm text-indigo-100">
                      <span className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" /> {upcomingEvent.location}
                      </span>
                      <span className="flex items-center gap-2">
                        <Users className="w-4 h-4" /> {upcomingEvent.attendees.length} registered
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-200 rounded-2xl p-12 text-center">
                    <p className="text-gray-500 mb-4">No upcoming events scheduled.</p>
                    <Link to="/events/create" className="inline-flex items-center gap-2 text-indigo-600 font-bold hover:underline">
                      Create your first event <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                )}
              </div>

              <div className="bg-white rounded-[32px] p-8 shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h2>
                <div className="space-y-3">
                  <Link to="/events/create" className="flex items-center gap-3 p-4 rounded-2xl border border-gray-100 hover:bg-gray-50 transition-colors">
                    <div className="w-10 h-10 bg-black text-white rounded-xl flex items-center justify-center">
                      <Plus className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-bold text-gray-900">Create Event</div>
                      <div className="text-xs text-gray-500">Host a new gathering</div>
                    </div>
                  </Link>
                  <Link to="/my-events" className="flex items-center gap-3 p-4 rounded-2xl border border-gray-100 hover:bg-gray-50 transition-colors">
                    <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                      <FolderOpen className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-bold text-gray-900">My Events</div>
                      <div className="text-xs text-gray-500">Manage your events</div>
                    </div>
                  </Link>
                  <Link to="/attendees" className="flex items-center gap-3 p-4 rounded-2xl border border-gray-100 hover:bg-gray-50 transition-colors">
                    <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center">
                      <Users className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-bold text-gray-900">View Attendees</div>
                      <div className="text-xs text-gray-500">See who registered</div>
                    </div>
                  </Link>
                  <Link to="/profile" className="flex items-center gap-3 p-4 rounded-2xl border border-gray-100 hover:bg-gray-50 transition-colors">
                    <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
                      <UserCircle className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-bold text-gray-900">Edit Profile</div>
                      <div className="text-xs text-gray-500">Update your public page</div>
                    </div>
                  </Link>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <div className="bg-white rounded-[32px] p-8 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">Recent Registrations</h2>
                  <Link to="/attendees" className="text-sm font-semibold text-indigo-600 hover:text-indigo-800">
                    View all
                  </Link>
                </div>
                {overview?.recentRegistrations && overview.recentRegistrations.length > 0 ? (
                  <div className="space-y-3">
                    {overview.recentRegistrations.map((reg, i) => (
                      <div key={`${reg.attendee._id}-${reg.event._id}-${i}`} className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 border border-gray-100">
                        <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center uppercase shrink-0">
                          {reg.attendee.name.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-gray-900 truncate">{reg.attendee.name}</div>
                          <div className="text-sm text-gray-500 truncate">
                            registered for <span className="font-medium text-gray-700">{reg.event.name}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">No registrations yet.</p>
                )}
              </div>

              <div className="bg-white rounded-[32px] p-8 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">Your Events</h2>
                  <Link to="/my-events" className="text-sm font-semibold text-indigo-600 hover:text-indigo-800">
                    Manage all
                  </Link>
                </div>
                {events.length > 0 ? (
                  <div className="space-y-3">
                    {events.slice(0, 5).map((event) => (
                      <Link
                        key={event._id}
                        to={`/events/${event._id}`}
                        className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 border border-gray-100 hover:bg-gray-100 transition-colors"
                      >
                        <div className="min-w-0">
                          <div className="font-semibold text-gray-900 truncate">{event.name}</div>
                          <div className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                            <Clock className="w-3.5 h-3.5" />
                            {format(new Date(event.date), 'MMM d')} · {event.time}
                          </div>
                        </div>
                        <div className="text-sm font-bold text-indigo-600 shrink-0 ml-4">
                          {event.attendees.length} <span className="font-medium text-gray-500">going</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">No events created yet.</p>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    );
  }

  const attendeeOverview = overview as AttendeeOverview | null;
  const stats = attendeeOverview?.stats;
  const nextEvent = attendeeOverview?.nextEvent;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Your Dashboard</h1>
          <p className="text-gray-500 font-medium mt-1">Welcome back, {user.name}. Here is your event activity.</p>
        </div>
        <Link
          to="/events"
          className="bg-black text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-black/10 hover:bg-gray-800 transition-all"
        >
          <Search className="w-5 h-5" />
          Explore Events
        </Link>
      </header>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Registered', value: stats?.totalRegistered ?? 0, icon: LayoutDashboard },
              { label: 'Upcoming', value: stats?.upcomingEvents ?? 0, icon: Calendar },
              { label: 'Tickets', value: stats?.tickets ?? 0, icon: Ticket },
              { label: 'Saved', value: stats?.savedEvents ?? 0, icon: Heart },
            ].map((stat) => (
              <div key={stat.label} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <stat.icon className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-medium text-gray-500">{stat.label}</span>
                </div>
                <div className="text-3xl font-black text-gray-900">{stat.value}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="lg:col-span-2 bg-white rounded-[32px] p-8 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Next Event</h2>
                {nextEvent && (
                  <Link to={`/events/${nextEvent._id}`} className="text-sm font-semibold text-indigo-600 hover:text-indigo-800">
                    View details
                  </Link>
                )}
              </div>
              {nextEvent ? (
                <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-8 text-white">
                  <div className="text-sm font-medium text-indigo-100 mb-2">
                    {format(new Date(nextEvent.date), 'EEEE, MMMM do, yyyy')} · {nextEvent.time}
                  </div>
                  <h3 className="text-2xl font-bold mb-4">{nextEvent.name}</h3>
                  <div className="flex flex-wrap gap-4 text-sm text-indigo-100">
                    <span className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" /> {nextEvent.location}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-200 rounded-2xl p-12 text-center">
                  <p className="text-gray-500 mb-4">No upcoming events on your schedule.</p>
                  <Link to="/events" className="inline-flex items-center gap-2 text-indigo-600 font-bold hover:underline">
                    Find events to join <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              )}
            </div>

            <div className="bg-white rounded-[32px] p-8 shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h2>
              <div className="space-y-3">
                <Link to="/my-schedule" className="flex items-center gap-3 p-4 rounded-2xl border border-gray-100 hover:bg-gray-50 transition-colors">
                  <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">My Schedule</div>
                    <div className="text-xs text-gray-500">Upcoming & past events</div>
                  </div>
                </Link>
                <Link to="/my-tickets" className="flex items-center gap-3 p-4 rounded-2xl border border-gray-100 hover:bg-gray-50 transition-colors">
                  <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                    <Ticket className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">My Tickets</div>
                    <div className="text-xs text-gray-500">View your ticket codes</div>
                  </div>
                </Link>
                <Link to="/saved" className="flex items-center gap-3 p-4 rounded-2xl border border-gray-100 hover:bg-gray-50 transition-colors">
                  <div className="w-10 h-10 bg-pink-50 text-pink-600 rounded-xl flex items-center justify-center">
                    <Heart className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">Saved Events</div>
                    <div className="text-xs text-gray-500">Your bookmarked events</div>
                  </div>
                </Link>
                <Link to="/profile" className="flex items-center gap-3 p-4 rounded-2xl border border-gray-100 hover:bg-gray-50 transition-colors">
                  <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
                    <UserCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">Edit Profile</div>
                    <div className="text-xs text-gray-500">Update your account</div>
                  </div>
                </Link>
              </div>
            </div>
          </div>

          {(attendeeOverview?.pendingPayments?.length ?? 0) > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-[32px] p-8 mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-amber-900">Pending Payments</h2>
                <Link to="/my-payments" className="text-sm font-semibold text-amber-700 hover:text-amber-900">
                  View all
                </Link>
              </div>
              <div className="space-y-3">
                {attendeeOverview!.pendingPayments.slice(0, 3).map((payment) => (
                  <Link
                    key={payment._id}
                    to={`/events/${payment.event._id}`}
                    className="flex items-center justify-between p-4 rounded-2xl bg-white border border-amber-100 hover:bg-amber-50/50 transition-colors"
                  >
                    <div>
                      <div className="font-semibold text-gray-900">{payment.event.name}</div>
                      <div className="text-sm text-gray-500">TrxID: {payment.transactionId}</div>
                    </div>
                    <div className="text-sm font-bold text-amber-700">৳{payment.amount} · Pending</div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Your Upcoming Events</h2>
            <Link to="/my-schedule" className="text-sm font-semibold text-indigo-600 hover:text-indigo-800">
              View full schedule
            </Link>
          </div>

          {events.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {events.slice(0, 6).map((event, index) => (
                <motion.div
                  key={event._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                >
                  <EventCard event={{ ...event, registrationStatus: 'approved' }} />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-[32px] border border-gray-200 border-dashed">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                <LayoutDashboard className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No events here yet</h3>
              <p className="text-gray-500 mb-6">Explore the platform and register for upcoming events.</p>
              <Link
                to="/events"
                className="inline-flex px-6 py-3 bg-black hover:bg-gray-800 text-white rounded-xl font-bold transition-colors"
              >
                Explore Events
              </Link>
            </div>
          )}
        </>
      )}
    </div>
  );
};

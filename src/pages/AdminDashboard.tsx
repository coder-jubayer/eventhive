import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { useAuth } from '../context/AuthContext';
import { AdminOverview, Event, User } from '../types';
import {
  Users,
  FolderOpen,
  UserCircle,
  Calendar,
  Shield,
  Search,
  Ban,
  CheckCircle,
} from 'lucide-react';

type Tab = 'users' | 'events';

export const AdminDashboard: React.FC = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('users');
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);
  const [userRoleFilter, setUserRoleFilter] = useState('all');
  const [userStatusFilter, setUserStatusFilter] = useState('all');
  const [eventStatusFilter, setEventStatusFilter] = useState('all');
  const [userSearch, setUserSearch] = useState('');
  const [eventSearch, setEventSearch] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (user.role !== 'admin') {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchOverview();
    }
  }, [user]);

  useEffect(() => {
    if (user?.role === 'admin' && tab === 'users') {
      fetchUsers();
    }
  }, [user, tab, userRoleFilter, userStatusFilter, userSearch]);

  useEffect(() => {
    if (user?.role === 'admin' && tab === 'events') {
      fetchEvents();
    }
  }, [user, tab, eventStatusFilter, eventSearch]);

  const fetchOverview = async () => {
    try {
      const res = await fetch('/api/admin/overview', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setOverview(await res.json());
    } catch (error) {
      console.error('Failed to load admin overview', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (userRoleFilter !== 'all') params.set('role', userRoleFilter);
      if (userStatusFilter !== 'all') params.set('status', userStatusFilter);
      if (userSearch.trim()) params.set('search', userSearch.trim());
      const res = await fetch(`/api/admin/users?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setUsers(await res.json());
    } catch (error) {
      console.error('Failed to load users', error);
    }
    setLoading(false);
  };

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (eventStatusFilter !== 'all') params.set('status', eventStatusFilter);
      if (eventSearch.trim()) params.set('search', eventSearch.trim());
      const res = await fetch(`/api/admin/events?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setEvents(await res.json());
    } catch (error) {
      console.error('Failed to load events', error);
    }
    setLoading(false);
  };

  const toggleUserActive = async (target: User) => {
    setActionId(target._id);
    try {
      const res = await fetch(`/api/admin/users/${target._id}/active`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive: target.isActive === false }),
      });
      if (res.ok) {
        await fetchUsers();
        await fetchOverview();
      }
    } catch (error) {
      console.error('Failed to update user', error);
    }
    setActionId(null);
  };

  const toggleEventActive = async (event: Event) => {
    setActionId(event._id);
    try {
      const res = await fetch(`/api/admin/events/${event._id}/active`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive: event.isActive === false }),
      });
      if (res.ok) {
        await fetchEvents();
        await fetchOverview();
      }
    } catch (error) {
      console.error('Failed to update event', error);
    }
    setActionId(null);
  };

  if (!user || user.role !== 'admin') return null;

  const stats = overview?.stats;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <header className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-violet-100 text-violet-700 flex items-center justify-center">
            <Shield className="w-5 h-5" />
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Admin Panel</h1>
        </div>
        <p className="text-gray-500 font-medium">Manage organizers, participants, and events across the platform.</p>
      </header>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Organizers', value: stats?.organizers ?? 0, icon: FolderOpen },
          { label: 'Participants', value: stats?.participants ?? 0, icon: UserCircle },
          { label: 'Active Events', value: stats?.activeEvents ?? 0, icon: Calendar },
          { label: 'Inactive', value: (stats?.inactiveUsers ?? 0) + (stats?.inactiveEvents ?? 0), icon: Ban },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">
              <Icon className="w-5 h-5" />
            </div>
            <div className="text-2xl font-black text-gray-900">{value}</div>
            <div className="text-sm font-semibold text-gray-500">{label}</div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        <button
          type="button"
          onClick={() => setTab('users')}
          className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-colors ${
            tab === 'users' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
          }`}
        >
          <span className="inline-flex items-center gap-2"><Users className="w-4 h-4" /> Users</span>
        </button>
        <button
          type="button"
          onClick={() => setTab('events')}
          className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-colors ${
            tab === 'events' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
          }`}
        >
          <span className="inline-flex items-center gap-2"><Calendar className="w-4 h-4" /> Events</span>
        </button>
      </div>

      {tab === 'users' && (
        <div className="bg-white rounded-[28px] border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search users..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {['all', 'organizer', 'user'].map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => setUserRoleFilter(role)}
                  className={`px-3 py-2 rounded-lg text-xs font-bold capitalize ${
                    userRoleFilter === role ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {role === 'all' ? 'All Roles' : role === 'user' ? 'Participants' : 'Organizers'}
                </button>
              ))}
              {['all', 'active', 'inactive'].map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setUserStatusFilter(status)}
                  className={`px-3 py-2 rounded-lg text-xs font-bold capitalize ${
                    userStatusFilter === status ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-16">
              <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-left text-gray-500 uppercase text-xs tracking-wider">
                  <tr>
                    <th className="px-5 py-3 font-bold">Name</th>
                    <th className="px-5 py-3 font-bold">Email</th>
                    <th className="px-5 py-3 font-bold">Role</th>
                    <th className="px-5 py-3 font-bold">Status</th>
                    <th className="px-5 py-3 font-bold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {users.map((u) => {
                    const active = u.isActive !== false;
                    return (
                      <tr key={u._id} className="hover:bg-gray-50/80">
                        <td className="px-5 py-4 font-semibold text-gray-900">{u.name}</td>
                        <td className="px-5 py-4 text-gray-600">{u.email}</td>
                        <td className="px-5 py-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold capitalize ${
                            u.role === 'organizer' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                          }`}>
                            {u.role === 'user' ? 'Participant' : u.role}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                            active ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {active ? <CheckCircle className="w-3 h-3" /> : <Ban className="w-3 h-3" />}
                            {active ? 'Active' : 'Deactivated'}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <button
                            type="button"
                            disabled={actionId === u._id}
                            onClick={() => toggleUserActive(u)}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors disabled:opacity-50 ${
                              active
                                ? 'bg-red-50 text-red-600 hover:bg-red-100'
                                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                            }`}
                          >
                            {actionId === u._id ? 'Saving...' : active ? 'Deactivate' : 'Activate'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {users.length === 0 && (
                <p className="text-center text-gray-500 py-12 font-medium">No users found.</p>
              )}
            </div>
          )}
        </div>
      )}

      {tab === 'events' && (
        <div className="bg-white rounded-[28px] border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search events..."
                value={eventSearch}
                onChange={(e) => setEventSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {['all', 'active', 'inactive'].map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setEventStatusFilter(status)}
                  className={`px-3 py-2 rounded-lg text-xs font-bold capitalize ${
                    eventStatusFilter === status ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-16">
              <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-left text-gray-500 uppercase text-xs tracking-wider">
                  <tr>
                    <th className="px-5 py-3 font-bold">Event</th>
                    <th className="px-5 py-3 font-bold">Organizer</th>
                    <th className="px-5 py-3 font-bold">Date</th>
                    <th className="px-5 py-3 font-bold">Status</th>
                    <th className="px-5 py-3 font-bold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {events.map((event) => {
                    const active = event.isActive !== false;
                    return (
                      <tr key={event._id} className="hover:bg-gray-50/80">
                        <td className="px-5 py-4 font-semibold text-gray-900">{event.name}</td>
                        <td className="px-5 py-4 text-gray-600">{event.organizer?.name || '—'}</td>
                        <td className="px-5 py-4 text-gray-600">
                          {format(new Date(event.date), 'MMM d, yyyy')} · {event.time}
                        </td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                            active ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {active ? <CheckCircle className="w-3 h-3" /> : <Ban className="w-3 h-3" />}
                            {active ? 'Active' : 'Deactivated'}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <button
                            type="button"
                            disabled={actionId === event._id}
                            onClick={() => toggleEventActive(event)}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors disabled:opacity-50 ${
                              active
                                ? 'bg-red-50 text-red-600 hover:bg-red-100'
                                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                            }`}
                          >
                            {actionId === event._id ? 'Saving...' : active ? 'Deactivate' : 'Activate'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {events.length === 0 && (
                <p className="text-center text-gray-500 py-12 font-medium">No events found.</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

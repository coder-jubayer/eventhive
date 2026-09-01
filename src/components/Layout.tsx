import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CalendarDays, LayoutDashboard, User, FolderOpen, Users, CreditCard, Ticket, Heart, Clock, LogOut } from 'lucide-react';
import { motion } from 'motion/react';

export const Layout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(`${path}/`);

  return (
    <div className="flex h-screen w-full bg-[#F2F4F7] font-sans p-4 md:p-6 gap-6 overflow-hidden text-slate-900">
      {/* Sidebar for desktop */}
      <aside className="hidden md:flex w-64 bg-white rounded-[32px] shadow-sm border border-gray-100 p-8 flex-col justify-between">
        <div>
          <Link to="/" className="flex items-center justify-center mb-10 group w-full">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-lg tracking-tight transition-transform group-hover:scale-105">EM</div>
          </Link>
          
          <nav className="space-y-2">
            {user && (
              <Link 
                to="/dashboard" 
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-semibold transition-colors ${
                  isActive('/dashboard') ? 'bg-indigo-50 text-indigo-700' : 'text-gray-500 hover:bg-gray-50'
                }`}
              >
                <LayoutDashboard className="w-5 h-5" />
                Dashboard
              </Link>
            )}
            {user?.role === 'user' && (
              <>
                <Link
                  to="/my-schedule"
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-semibold transition-colors ${
                    isActive('/my-schedule') ? 'bg-indigo-50 text-indigo-700' : 'text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  <Clock className="w-5 h-5" />
                  My Schedule
                </Link>
                <Link
                  to="/my-tickets"
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-semibold transition-colors ${
                    isActive('/my-tickets') ? 'bg-indigo-50 text-indigo-700' : 'text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  <Ticket className="w-5 h-5" />
                  My Tickets
                </Link>
                <Link
                  to="/my-payments"
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-semibold transition-colors ${
                    isActive('/my-payments') ? 'bg-indigo-50 text-indigo-700' : 'text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  <CreditCard className="w-5 h-5" />
                  My Payments
                </Link>
                <Link
                  to="/saved"
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-semibold transition-colors ${
                    isActive('/saved') ? 'bg-indigo-50 text-indigo-700' : 'text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  <Heart className="w-5 h-5" />
                  Saved Events
                </Link>
              </>
            )}
            {user?.role === 'organizer' && (
              <>
                <Link 
                  to="/my-events" 
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-semibold transition-colors ${
                    isActive('/my-events') ? 'bg-indigo-50 text-indigo-700' : 'text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  <FolderOpen className="w-5 h-5" />
                  My Events
                </Link>
                <Link 
                  to="/attendees" 
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-semibold transition-colors ${
                    isActive('/attendees') ? 'bg-indigo-50 text-indigo-700' : 'text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  <Users className="w-5 h-5" />
                  Attendees
                </Link>
                <Link 
                  to="/payments" 
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-semibold transition-colors ${
                    isActive('/payments') ? 'bg-indigo-50 text-indigo-700' : 'text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  <CreditCard className="w-5 h-5" />
                  Payments
                </Link>
              </>
            )}
            <Link 
              to="/events" 
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-semibold transition-colors ${
                isActive('/events') && !location.pathname.includes('/create') && !location.pathname.match(/\/events\/[^/]+\/edit/) ? 'bg-indigo-50 text-indigo-700' : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              <CalendarDays className="w-5 h-5" />
              All Events
            </Link>
            {user?.role === 'organizer' && (
              <Link 
                to="/events/create" 
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-semibold transition-colors ${
                  isActive('/events/create') ? 'bg-indigo-50 text-indigo-700' : 'text-gray-500 hover:bg-gray-50'
                }`}
              >
                <div className="w-5 h-5 flex items-center justify-center bg-gray-200 rounded-full text-gray-700">
                  <span className="text-sm leading-none">+</span>
                </div>
                Create Event
              </Link>
            )}
          </nav>
        </div>
        
        {user ? (
          <div className="pt-6 border-t border-gray-100 space-y-3">
            <Link
              to="/profile"
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-semibold transition-colors ${
                isActive('/profile') ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold uppercase shrink-0 ${
                isActive('/profile') ? 'bg-indigo-200 text-indigo-800' : 'bg-indigo-100 text-indigo-700'
              }`}>
                {user.name.charAt(0)}
              </div>
              <span className="truncate">{user.name}</span>
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl border border-gray-200 bg-gray-50 text-gray-700 font-bold hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <Link to="/login" className="block w-full text-center px-4 py-2 bg-indigo-50 text-indigo-700 rounded-xl font-bold hover:bg-indigo-100 transition-colors">
              Log In
            </Link>
            <Link to="/register" className="block w-full text-center px-4 py-2 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition-colors">
              Sign Up
            </Link>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-y-auto rounded-[32px] md:pr-4">
        {/* Mobile Header */}
        <header className="md:hidden relative flex justify-end items-center mb-6 bg-white p-4 rounded-3xl shadow-sm border border-gray-100 shrink-0">
          <Link to="/" className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-sm tracking-tight">EM</div>
          </Link>
          <div className="flex gap-4">
            <Link to="/events" className="text-gray-500">
               <CalendarDays className="w-6 h-6" />
            </Link>
            {user ? (
              <Link to="/dashboard" className="text-gray-500">
                <LayoutDashboard className="w-6 h-6" />
              </Link>
            ) : (
              <Link to="/login" className="text-gray-500">
                <User className="w-6 h-6" />
              </Link>
            )}
          </div>
        </header>

        <div className="flex-1 pb-12">
          <Outlet />
        </div>
      </main>
    </div>
  );
};


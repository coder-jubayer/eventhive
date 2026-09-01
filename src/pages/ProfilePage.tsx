import React from 'react';
import { useAuth } from '../context/AuthContext';
import { OrganizerProfileEdit } from './OrganizerProfileEdit';
import { AttendeeProfileEdit } from './AttendeeProfileEdit';

export const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  if (!user) return null;
  if (user.role === 'admin') {
    return (
      <div className="max-w-lg mx-auto px-4 py-12">
        <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm p-8 text-center">
          <h1 className="text-2xl font-extrabold text-gray-900 mb-2">{user.name}</h1>
          <p className="text-violet-600 font-bold mb-1">Administrator</p>
          <p className="text-gray-500">{user.email}</p>
        </div>
      </div>
    );
  }
  if (user.role === 'organizer') return <OrganizerProfileEdit />;
  return <AttendeeProfileEdit />;
};

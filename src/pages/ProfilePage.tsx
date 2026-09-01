import React from 'react';
import { useAuth } from '../context/AuthContext';
import { OrganizerProfileEdit } from './OrganizerProfileEdit';
import { AttendeeProfileEdit } from './AttendeeProfileEdit';

export const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  if (!user) return null;
  if (user.role === 'organizer') return <OrganizerProfileEdit />;
  return <AttendeeProfileEdit />;
};

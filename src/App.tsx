/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { EventsList } from './pages/EventsList';
import { EventDetails } from './pages/EventDetails';
import { Dashboard } from './pages/Dashboard';
import { CreateEvent } from './pages/CreateEvent';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { MyEvents } from './pages/MyEvents';
import { Attendees } from './pages/Attendees';
import { ProfilePage } from './pages/ProfilePage';
import { OrganizerPublicProfile } from './pages/OrganizerPublicProfile';
import { PendingPayments } from './pages/PendingPayments';
import { EventTicket } from './pages/EventTicket';
import { MySchedule } from './pages/MySchedule';
import { MyTickets } from './pages/MyTickets';
import { MyPayments } from './pages/MyPayments';
import { SavedEvents } from './pages/SavedEvents';
import { AdminDashboard } from './pages/AdminDashboard';

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="events" element={<EventsList />} />
            <Route path="events/:id" element={<EventDetails />} />
            <Route path="events/:id/ticket" element={<EventTicket />} />
            <Route path="events/create" element={<CreateEvent />} />
            <Route path="events/:id/edit" element={<CreateEvent />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="admin" element={<AdminDashboard />} />
            <Route path="my-events" element={<MyEvents />} />
            <Route path="attendees" element={<Attendees />} />
            <Route path="payments" element={<PendingPayments />} />
            <Route path="my-schedule" element={<MySchedule />} />
            <Route path="my-tickets" element={<MyTickets />} />
            <Route path="my-payments" element={<MyPayments />} />
            <Route path="saved" element={<SavedEvents />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="organizers/:id" element={<OrganizerPublicProfile />} />
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

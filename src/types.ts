export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'organizer' | 'admin';
  isActive?: boolean;
  bio?: string;
  website?: string;
  linkedin?: string;
  bkashNumber?: string;
  createdAt?: string;
}

export type RegistrationStatusType = 'none' | 'pending' | 'approved' | 'rejected';

export interface Event {
  _id: string;
  name: string;
  description: string;
  date: string;
  time: string;
  location: string;
  district?: string;
  category: string;
  imageUrl?: string;
  capacity?: number | null;
  isPaid?: boolean;
  price?: number;
  organizer: User;
  attendees: User[] | string[];
  isActive?: boolean;
  registrationStatus?: RegistrationStatusType;
  isSaved?: boolean;
}

export interface RegistrationStatus {
  status: RegistrationStatusType;
  payment?: {
    transactionId: string;
    amount: number;
    ticketCode?: string;
  };
}

export interface PaymentRequest {
  _id: string;
  transactionId: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected';
  ticketCode?: string;
  createdAt: string;
  user: Pick<User, '_id' | 'name' | 'email'>;
  event: Event;
}

export interface AttendeeStats {
  totalRegistered: number;
  upcomingEvents: number;
  pastEvents: number;
  pendingPayments: number;
  tickets: number;
  savedEvents: number;
}

export interface AttendeeOverview {
  stats: AttendeeStats;
  nextEvent: Event | null;
  pendingPayments: PaymentRequest[];
}

export interface ScheduleItem {
  event: Event;
  registrationStatus: RegistrationStatusType;
  payment?: {
    _id: string;
    transactionId: string;
    amount: number;
    createdAt: string;
  };
}

export interface TicketItem {
  event: Event;
  ticketCode: string;
  transactionId: string | null;
  amount: number;
  type: 'paid' | 'free';
}

export interface OrganizerProfile extends User {
  eventCount?: number;
}

export interface OrganizerStats {
  totalEvents: number;
  upcomingEvents: number;
  pastEvents: number;
  totalAttendees: number;
  eventsThisMonth: number;
}

export interface OrganizerOverview {
  stats: OrganizerStats;
  upcomingEvent: Event | null;
  recentRegistrations: {
    attendee: Pick<User, '_id' | 'name' | 'email'>;
    event: Pick<Event, '_id' | 'name'>;
  }[];
}

export interface AttendeeEntry {
  attendee: Pick<User, '_id' | 'name' | 'email'>;
  event: Pick<Event, '_id' | 'name' | 'date' | 'time'>;
}

export interface AdminStats {
  totalUsers: number;
  organizers: number;
  participants: number;
  totalEvents: number;
  activeEvents: number;
  inactiveUsers: number;
  inactiveEvents: number;
}

export interface AdminOverview {
  stats: AdminStats;
}

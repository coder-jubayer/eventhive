export const EVENT_CATEGORIES = [
  'Workshop',
  'Meetup',
  'Conference',
  'Concert',
  'Sports',
  'Networking',
  'Other',
] as const;

export type EventCategory = (typeof EVENT_CATEGORIES)[number];

export const CATEGORY_COLORS: Record<EventCategory, string> = {
  Workshop: 'bg-amber-100 text-amber-800',
  Meetup: 'bg-blue-100 text-blue-800',
  Conference: 'bg-purple-100 text-purple-800',
  Concert: 'bg-pink-100 text-pink-800',
  Sports: 'bg-green-100 text-green-800',
  Networking: 'bg-indigo-100 text-indigo-800',
  Other: 'bg-gray-100 text-gray-800',
};

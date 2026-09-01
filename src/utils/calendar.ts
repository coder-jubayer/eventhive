import { Event } from '../types';
import { formatEventAddress } from './share';

export function getGoogleCalendarUrl(event: Event) {
  const start = new Date(`${event.date.split('T')[0]}T${event.time}`);
  const end = new Date(start.getTime() + 2 * 60 * 60 * 1000);
  const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.name,
    dates: `${fmt(start)}/${fmt(end)}`,
    details: event.description,
    location: formatEventAddress(event),
  });
  return `https://calendar.google.com/calendar/render?${params}`;
}

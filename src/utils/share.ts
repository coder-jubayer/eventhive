import { Event } from '../types';

export function shareEvent(event: Event) {
  const url = `${window.location.origin}/events/${event._id}`;
  const text = `Check out "${event.name}" on EventHive!`;

  if (navigator.share) {
    navigator.share({ title: event.name, text, url }).catch(() => {});
    return;
  }

  navigator.clipboard.writeText(url).then(() => {
    alert('Event link copied to clipboard!');
  });
}

export function formatEventAddress(event: Pick<Event, 'location' | 'district'>) {
  const parts = [event.location];
  if (event.district) parts.push(event.district);
  parts.push('Bangladesh');
  return parts.join(', ');
}

export function getGoogleMapsUrl(event: Pick<Event, 'location' | 'district'>) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(formatEventAddress(event))}`;
}

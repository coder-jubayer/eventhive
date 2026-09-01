export function getEventDateTime(event: { date: string; time: string }) {
  const dateStr = event.date.split('T')[0];
  return new Date(`${dateStr}T${event.time}`);
}

export function isEventPast(event: { date: string; time: string }) {
  const eventDate = getEventDateTime(event);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const eventDay = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate());
  return eventDay < today;
}

export function isEventToday(event: { date: string; time: string }) {
  const eventDate = getEventDateTime(event);
  const now = new Date();
  return (
    eventDate.getFullYear() === now.getFullYear() &&
    eventDate.getMonth() === now.getMonth() &&
    eventDate.getDate() === now.getDate()
  );
}

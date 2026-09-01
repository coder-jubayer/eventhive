import { EVENT_CATEGORIES, EventCategory } from '../constants/categories';

const CATEGORY_IMAGES: Record<EventCategory, string[]> = {
  Workshop: [
    'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=1200&q=80',
    'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&q=80',
    'https://images.unsplash.com/photo-1552664739-d307ca884978?w=1200&q=80',
    'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1200&q=80',
  ],
  Meetup: [
    'https://images.unsplash.com/photo-1515187022015-c6d503b4a8a0?w=1200&q=80',
    'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1200&q=80',
    'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1200&q=80',
    'https://images.unsplash.com/photo-1517457373958-b5891ce979ff?w=1200&q=80',
  ],
  Conference: [
    'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&q=80',
    'https://images.unsplash.com/photo-1505373877841-8d25f39d4666?w=1200&q=80',
    'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=1200&q=80',
    'https://images.unsplash.com/photo-1591115765373-5207764f72e7?w=1200&q=80',
  ],
  Concert: [
    'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=1200&q=80',
    'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=1200&q=80',
    'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1200&q=80',
    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200&q=80',
  ],
  Sports: [
    'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=1200&q=80',
    'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1200&q=80',
    'https://images.unsplash.com/photo-1517649763962-0c62306601b7?w=1200&q=80',
    'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=1200&q=80',
  ],
  Networking: [
    'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1200&q=80',
    'https://images.unsplash.com/photo-1556761175-b413da4baf72?w=1200&q=80',
    'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=1200&q=80',
    'https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=1200&q=80',
  ],
  Other: [
    'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200&q=80',
    'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=1200&q=80',
    'https://images.unsplash.com/photo-1511578314322-379afb476865?w=1200&q=80',
    'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&q=80',
  ],
};

function hashSeed(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function normalizeCategory(category?: string): EventCategory {
  if (category && EVENT_CATEGORIES.includes(category as EventCategory)) {
    return category as EventCategory;
  }
  return 'Other';
}

export function getCategoryImage(category: string | undefined, seed: string): string {
  const key = normalizeCategory(category);
  const images = CATEGORY_IMAGES[key];
  const index = hashSeed(seed) % images.length;
  return images[index];
}

export function getEventImageUrl(event: {
  _id?: string;
  name?: string;
  category?: string;
  imageUrl?: string;
}): string {
  if (event.imageUrl?.trim()) return event.imageUrl.trim();
  const seed = event._id || event.name || 'event';
  return getCategoryImage(event.category, seed);
}

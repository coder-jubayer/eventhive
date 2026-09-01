import React from 'react';
import { Ticket } from 'lucide-react';

type Variant = 'overlay' | 'compact' | 'panel' | 'title';

interface EventPriceTagProps {
  price?: number;
  isPaid?: boolean;
  variant?: Variant;
  className?: string;
}

export function isPaidEvent(event: { isPaid?: boolean; price?: number }) {
  return Boolean(event.isPaid && (event.price ?? 0) > 0);
}

export function formatTicketPrice(price: number) {
  return price.toLocaleString('en-BD');
}

export const EventPriceTag: React.FC<EventPriceTagProps> = ({
  price = 0,
  isPaid,
  variant = 'compact',
  className = '',
}) => {
  const paid = isPaid ?? price > 0;

  if (variant === 'title') {
    if (!paid) {
      return (
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-emerald-100 text-emerald-700 shrink-0 ${className}`}>
          Free
        </span>
      );
    }
    return (
      <span className={`inline-flex items-baseline gap-0.5 font-black text-gray-900 tabular-nums shrink-0 ${className || 'text-2xl'}`}>
        <span className="text-base font-bold text-gray-500">৳</span>
        {formatTicketPrice(price)}
      </span>
    );
  }

  if (!paid) {
    if (variant === 'overlay') {
      return (
        <div className={`inline-flex items-center bg-emerald-500 text-white rounded-2xl px-4 py-2 shadow-lg ${className}`}>
          <span className="text-sm font-bold uppercase tracking-wide">Free Entry</span>
        </div>
      );
    }
    if (variant === 'panel') return null;
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide bg-emerald-100 text-emerald-800 ${className}`}>
        Free
      </span>
    );
  }

  if (variant === 'overlay') {
    return (
      <div className={`bg-white/95 backdrop-blur-md rounded-2xl px-4 py-3 shadow-xl border border-white/60 min-w-[92px] ${className}`}>
        <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-gray-400">Ticket</div>
        <div className="text-2xl font-black text-gray-900 leading-tight tabular-nums">
          <span className="text-sm font-bold text-gray-500 mr-0.5">৳</span>
          {formatTicketPrice(price)}
        </div>
      </div>
    );
  }

  if (variant === 'panel') {
    return (
      <div className={`rounded-2xl border border-gray-100 bg-white p-5 shadow-sm ${className}`}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-gray-500 mb-1">Ticket price</p>
            <p className="text-3xl font-black text-gray-900 tabular-nums leading-none">
              <span className="text-lg font-bold text-gray-500">৳</span>
              {formatTicketPrice(price)}
            </p>
            <p className="text-sm text-gray-500 mt-2">Per person · Pay via bKash</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
            <Ticket className="w-5 h-5" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <span className={`inline-flex items-center gap-0.5 px-3 py-1.5 rounded-full text-sm font-bold bg-gray-900 text-white tabular-nums ${className}`}>
      <span className="text-xs font-semibold opacity-75">৳</span>
      {formatTicketPrice(price)}
    </span>
  );
};

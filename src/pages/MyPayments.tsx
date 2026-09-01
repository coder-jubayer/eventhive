import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { PaymentRequest } from '../types';
import { format } from 'date-fns';
import { CreditCard } from 'lucide-react';

export const MyPayments: React.FC = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [payments, setPayments] = useState<PaymentRequest[]>([]);
  const [tab, setTab] = useState<'pending' | 'rejected'>('pending');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (user.role === 'organizer') {
      navigate('/payments');
      return;
    }
    fetchPayments();
  }, [user, navigate, tab]);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/attendee/payments?status=${tab}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setPayments(await res.json());
    } catch (error) {
      console.error('Failed to fetch payments', error);
    }
    setLoading(false);
  };

  if (!user || user.role !== 'user') return null;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">My Payments</h1>
        <p className="text-gray-500 font-medium mt-1">Track your bKash payment submissions.</p>
      </header>

      <div className="flex gap-2 mb-8 bg-white p-2 rounded-2xl border border-gray-100 w-fit">
        {(['pending', 'rejected'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-5 py-2.5 rounded-xl font-bold text-sm capitalize transition-colors ${
              tab === t ? 'bg-indigo-600 text-white' : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
        </div>
      ) : payments.length > 0 ? (
        <div className="space-y-4">
          {payments.map((payment) => (
            <div key={payment._id} className="bg-white rounded-2xl border border-gray-100 p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <Link to={`/events/${payment.event._id}`} className="text-lg font-bold text-gray-900 hover:text-indigo-600">
                    {payment.event.name}
                  </Link>
                  <div className="text-sm text-gray-500 mt-1">
                    {format(new Date(payment.event.date), 'MMM d, yyyy')} · {payment.event.time}
                  </div>
                  <div className="mt-2 text-sm">
                    <span className="text-gray-500">TrxID:</span>{' '}
                    <span className="font-mono font-bold">{payment.transactionId}</span>
                    <span className="mx-2 text-gray-300">·</span>
                    <span className="font-bold text-gray-900">৳{payment.amount}</span>
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    Submitted {format(new Date(payment.createdAt), 'MMM d, yyyy · h:mm a')}
                  </div>
                </div>
                <div>
                  {tab === 'pending' ? (
                    <span className="inline-flex px-4 py-2 bg-amber-100 text-amber-800 rounded-full text-sm font-bold">
                      Awaiting approval
                    </span>
                  ) : (
                    <Link
                      to={`/events/${payment.event._id}`}
                      className="inline-flex px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700"
                    >
                      Try again
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-[32px] border border-gray-200 border-dashed">
          <CreditCard className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">No {tab} payments</h3>
          <p className="text-gray-500">Your payment submissions will appear here.</p>
        </div>
      )}
    </div>
  );
};

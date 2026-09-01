import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { PaymentRequest } from '../types';
import { format } from 'date-fns';
import { Check, X, Clock, CreditCard } from 'lucide-react';

export const PendingPayments: React.FC = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [payments, setPayments] = useState<PaymentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (user.role !== 'organizer') {
      navigate('/dashboard');
      return;
    }
    fetchPayments();
  }, [user, navigate]);

  const fetchPayments = async () => {
    try {
      const res = await fetch('/api/organizer/payments?status=pending', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setPayments(await res.json());
    } catch (error) {
      console.error('Failed to fetch payments', error);
    }
    setLoading(false);
  };

  const handleAction = async (id: string, action: 'approve' | 'reject') => {
    setProcessingId(id);
    try {
      const res = await fetch(`/api/organizer/payments/${id}/${action}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setPayments((prev) => prev.filter((p) => p._id !== id));
      }
    } catch (error) {
      console.error(`Failed to ${action} payment`, error);
    }
    setProcessingId(null);
  };

  if (!user || user.role !== 'organizer') return null;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Pending Payments</h1>
        <p className="text-gray-500 font-medium mt-1">
          Verify bKash payments and approve to issue tickets.
        </p>
      </header>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
        </div>
      ) : payments.length > 0 ? (
        <div className="space-y-4">
          {payments.map((payment) => (
            <div key={payment._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-700 font-bold flex items-center justify-center uppercase">
                      {payment.user.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-bold text-gray-900">{payment.user.name}</div>
                      <div className="text-sm text-gray-500">{payment.user.email}</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-gray-500">Event:</span>{' '}
                      <Link to={`/events/${payment.event._id}`} className="font-semibold text-indigo-600 hover:underline">
                        {payment.event.name}
                      </Link>
                    </div>
                    <div>
                      <span className="text-gray-500">Amount:</span>{' '}
                      <span className="font-bold text-gray-900">৳{payment.amount}</span>
                    </div>
                    <div className="sm:col-span-2">
                      <span className="text-gray-500">Transaction ID:</span>{' '}
                      <span className="font-mono font-bold text-gray-900 bg-gray-50 px-2 py-1 rounded">{payment.transactionId}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Submitted:</span>{' '}
                      {format(new Date(payment.createdAt), 'MMM d, yyyy · h:mm a')}
                    </div>
                  </div>
                </div>
                <div className="flex gap-3 shrink-0">
                  <button
                    onClick={() => handleAction(payment._id, 'approve')}
                    disabled={processingId === payment._id}
                    className="flex items-center gap-2 px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-colors disabled:opacity-60"
                  >
                    <Check className="w-4 h-4" /> Approve
                  </button>
                  <button
                    onClick={() => handleAction(payment._id, 'reject')}
                    disabled={processingId === payment._id}
                    className="flex items-center gap-2 px-5 py-3 bg-white border-2 border-red-100 text-red-600 hover:bg-red-50 rounded-xl font-bold transition-colors disabled:opacity-60"
                  >
                    <X className="w-4 h-4" /> Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-[32px] border border-gray-200 border-dashed">
          <CreditCard className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">No pending payments</h3>
          <p className="text-gray-500">New payment submissions will appear here for your approval.</p>
        </div>
      )}
    </div>
  );
};

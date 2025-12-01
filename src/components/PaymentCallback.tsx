import { useEffect, useState } from 'react';
import { getPhonePePaymentStatus } from '../lib/paymentApi';

type Status = 'idle' | 'loading' | 'success' | 'error';

export const PaymentCallback = () => {
  const [status, setStatus] = useState<Status>('idle');
  const [message, setMessage] = useState<string>('');

  useEffect(() => {
    const run = async () => {
      if (typeof window === 'undefined') return;

      const url = new URL(window.location.href);
      const transactionId = url.searchParams.get('transactionId') || '';

      if (!transactionId) {
        setStatus('error');
        setMessage('Missing transactionId in URL.');
        return;
      }

      setStatus('loading');
      setMessage('Verifying your payment with PhonePe...');

      const result = await getPhonePePaymentStatus(transactionId);

      if (!result.ok) {
        setStatus('error');
        setMessage(result.error || 'Failed to verify payment.');
        return;
      }

      const { token, user, state } = result;

      if (!token || !user || (state !== 'COMPLETED' && state !== 'SUCCESS')) {
        setStatus('error');
        setMessage('Payment is not completed yet. Please try again in a moment.');
        return;
      }

      if (typeof window !== 'undefined') {
        window.localStorage.setItem('qrAuthToken', token);
        if (user.phone) {
          window.localStorage.setItem('qrPhone', user.phone);
        }
        if (user.email) {
          window.localStorage.setItem('qrEmail', user.email);
        }

        setStatus('success');
        setMessage('Payment successful! Redirecting to your matrimony profile...');

        setTimeout(() => {
          // Adjust this path to where your MatrimonialProfile page lives
          window.location.href = '/matrimonial-profile';
        }, 1500);
      }
    };

    void run();
  }, []);

  return (
    <section className="min-h-screen flex items-center justify-center bg-rose-50/60">
      <div className="bg-white rounded-2xl shadow-md border border-rose-100 px-6 py-8 max-w-md w-full text-center">
        <h1 className="text-xl font-semibold text-gray-900 mb-2">Processing Payment</h1>
        <p className="text-sm text-gray-600 mb-4">
          {message || 'Please wait while we verify your payment.'}
        </p>
        {status === 'loading' && (
          <p className="text-xs text-gray-500">Do not close this window.</p>
        )}
        {status === 'error' && (
          <p className="text-xs text-rose-600 mt-2">
            If this keeps happening, please contact support or try again from the membership page.
          </p>
        )}
      </div>
    </section>
  );
};

import { Button } from './ui/Button';
import { createPhonePePayment } from '../lib/paymentApi';

export const MembershipPlans = () => {
  const handleSelectPlan = async (plan: string) => {
    if (plan === 'premium') {
      try {
        const result = await createPhonePePayment();

        if (!result.ok) {
          if (result.authError && typeof window !== 'undefined') {
            window.location.href = '#login';
            return;
          }

          if (typeof window !== 'undefined') {
            window.alert(result.error || 'Failed to initiate payment.');
          }
          return;
        }

        if (typeof window !== 'undefined') {
          window.location.href = result.redirectUrl;
        }
        return;
      } catch (error) {
        if (typeof window !== 'undefined') {
          window.alert('Failed to initiate payment. Please try again.');
        }
        return;
      }
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('qr:select-plan', { detail: { plan } }),
      );
      window.localStorage.setItem('qrSelectedPlan', plan);
      const form = document.getElementById('lead-form');
      if (form) {
        form.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };
  return (
    <section id="plans" className="py-20 bg-gradient-to-b from-white to-rose-50/60 border-t border-rose-100/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">
            Simple membership plans for every family
          </h2>
          <p className="text-gray-600 text-sm sm:text-base">
            Start free, then upgrade for deeper insights, advanced QR designs and more media space when you need it.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Free Plan */}
          <div className="relative bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-8 flex flex-col">
            <div className="text-xs font-semibold tracking-[0.18em] uppercase text-gray-500 mb-3">
              Starter
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Free Profile</h3>
            <p className="text-sm text-gray-600 mb-6">
              Perfect to get started with a QR-backed matrimony profile.
            </p>
            <div className="text-3xl font-extrabold text-gray-900 mb-1">₹0</div>
            <div className="text-xs text-gray-500 mb-6">for basic QR profile</div>
            <ul className="text-sm text-gray-600 space-y-2 mb-6 flex-1">
              <li>• Digital biodata with photos</li>
              <li>• Single QR code link</li>
              <li>• Share via WhatsApp or cards</li>
            </ul>
            <Button
              variant="outline"
              size="md"
              className="w-full"
              onClick={() => handleSelectPlan('free')}
            >
              Continue Free
            </Button>
          </div>

          {/* Popular Plan */}
          <div className="relative bg-white rounded-2xl border border-rose-200 shadow-lg shadow-rose-100 px-6 py-9 flex flex-col scale-[1.02]">
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-rose-600 text-white text-[10px] font-semibold tracking-[0.18em] px-3 py-1 rounded-full uppercase">
              Most Popular
            </span>
            <div className="text-xs font-semibold tracking-[0.18em] uppercase text-rose-600 mb-3">
              Premium
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Smart Family Plan</h3>
            <p className="text-sm text-gray-600 mb-6">
              For families actively sharing profiles with relatives, matchmakers and NRI contacts.
            </p>
            <div className="flex items-baseline gap-2 mb-1">
              <div className="text-3xl font-extrabold text-gray-900">₹499</div>
              <span className="text-xs text-gray-500">per profile / year</span>
            </div>
            <div className="text-xs text-rose-600 mb-6">Introductory pricing</div>
            <ul className="text-sm text-gray-600 space-y-2 mb-6 flex-1">
              <li>• Everything in Free</li>
              <li>• Multiple photos & media sections</li>
              <li>• Priority QR design themes</li>
              <li>• View analytics for scans & visits</li>
            </ul>
            <Button
              size="md"
              className="w-full bg-gradient-to-r from-rose-600 to-red-500 shadow-md shadow-rose-200"
              onClick={() => handleSelectPlan('premium')}
            >
              Upgrade to Premium
            </Button>
          </div>

          {/* Advanced Plan */}
          <div className="relative bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-8 flex flex-col">
            <div className="text-xs font-semibold tracking-[0.18em] uppercase text-gray-500 mb-3">
              Plus
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">NRI & Events Plan</h3>
            <p className="text-sm text-gray-600 mb-6">
              Best for NRI families, events or matchmakers managing many introductions.
            </p>
            <div className="flex items-baseline gap-2 mb-1">
              <div className="text-3xl font-extrabold text-gray-900">₹999</div>
              <span className="text-xs text-gray-500">per profile / year</span>
            </div>
            <div className="text-xs text-gray-500 mb-6">Billed annually</div>
            <ul className="text-sm text-gray-600 space-y-2 mb-6 flex-1">
              <li>• Everything in Premium</li>
              <li>• Custom QR & cover design variants</li>
              <li>• Extra media slots for videos, docs</li>
              <li>• Priority email support</li>
            </ul>
            <Button
              variant="secondary"
              size="md"
              className="w-full"
              onClick={() => handleSelectPlan('plus')}
            >
              Talk to our team
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

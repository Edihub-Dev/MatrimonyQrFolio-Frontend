import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { Button } from './ui/Button';
import { auth } from '../firebase';
import {
  ConfirmationResult,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  getIdToken,
} from 'firebase/auth';

type LoginStep = 'phone' | 'otp' | 'done';

export const LoginSection = () => {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<LoginStep>('phone');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);
  const confirmationResultRef = useRef<ConfirmationResult | null>(null);
  const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null);

  const handleSendOtp = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);
    setIsError(false);

    if (!phone.trim()) {
      setIsError(true);
      setMessage('Please enter your mobile number.');
      return;
    }

    setIsSubmitting(true);

    try {
      const appVerifier = recaptchaVerifierRef.current;
      if (!appVerifier) {
        throw new Error('RecaptchaVerifier not initialized');
      }

      const rawPhone = phone.trim();
      const e164Phone = rawPhone.startsWith('+')
        ? rawPhone
        : `+91${rawPhone}`;

      const confirmationResult = await signInWithPhoneNumber(
        auth,
        e164Phone,
        appVerifier,
      );
      confirmationResultRef.current = confirmationResult;
      setStep('otp');
      setMessage('OTP sent. Please enter the code you received.');
    } catch (error) {
      setIsError(true);
      setMessage('Failed to send OTP. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyOtp = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);
    setIsError(false);

    if (!otp.trim()) {
      setIsError(true);
      setMessage('Please enter the OTP you received.');
      return;
    }

    setIsSubmitting(true);

    try {
      const confirmationResult = confirmationResultRef.current;
      if (!confirmationResult) {
        throw new Error('Confirmation result not found');
      }

      const result = await confirmationResult.confirm(otp.trim());
      const idToken = await getIdToken(result.user);
      const response = await axios.post('/api/auth/firebase-phone-login', {
        idToken,
        sourceApp: 'matrimony',
      });

      const token: string | undefined = response.data?.token;
      const backendPhone: string | undefined = response.data?.user?.phone;
      const backendEmail: string | undefined = response.data?.user?.email;
      const matrimonyPremium = response.data?.user?.matrimonyPremium;
      const isMatrimonyPremiumActive = Boolean(matrimonyPremium?.isActive);

      const effectivePhone = backendPhone || result.user.phoneNumber || phone;
      const effectiveEmail = backendEmail || result.user.email;

      if (token && typeof window !== 'undefined') {
        window.localStorage.setItem('qrAuthToken', token);
        if (effectivePhone) {
          window.localStorage.setItem('qrPhone', effectivePhone);
        }
        if (effectiveEmail) {
          window.localStorage.setItem('qrEmail', effectiveEmail);
        }
      }

      if (!isMatrimonyPremiumActive) {
        if (typeof window !== 'undefined') {
          window.location.href = '/membership';
        }
        return;
      }

      setIsError(false);
      setMessage(response.data?.message ?? 'Logged in successfully.');
      setStep('done');
    } catch (error) {
      setIsError(true);
      setMessage('OTP verification failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    const verifier = new RecaptchaVerifier(
      auth,
      'firebase-send-otp',
      {
        size: 'invisible',
        callback: () => {
          // reCAPTCHA solved, allow signInWithPhoneNumber.
        },
      },
    );
    recaptchaVerifierRef.current = verifier;

    return () => {
      verifier.clear();
    };
  }, []);

  return (
    <section id="login" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-[1.2fr_minmax(0,1fr)] gap-12 items-center">
        <div className="space-y-4 max-w-xl">
          <h2 className="text-3xl font-bold text-gray-900">Login with mobile OTP</h2>
          <p className="text-sm sm:text-base text-gray-600">
            Verify your mobile number with a one-time password to create and manage your QR-backed matrimony profile.
          </p>
        </div>

        <div className="bg-rose-50/70 border border-rose-100 rounded-2xl p-6 sm:p-7 shadow-sm max-w-md w-full mx-auto">
          {step === 'phone' && (
            <form className="space-y-4" onSubmit={handleSendOtp}>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-600">Mobile number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  placeholder="10-digit mobile number"
                  className="w-full bg-white border border-rose-100 text-sm rounded-xl focus:ring-rose-500 focus:border-rose-500 block p-3"
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                id="firebase-send-otp"
                className="w-full bg-gradient-to-r from-rose-600 to-red-500 text-sm font-semibold shadow-md shadow-rose-200 flex items-center justify-center gap-2"
              >
                {isSubmitting ? 'Sending OTP…' : 'Send OTP'}
              </Button>
            </form>
          )}

          {step !== 'phone' && (
            <form className="space-y-4" onSubmit={handleVerifyOtp}>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-600">Enter OTP</label>
                <input
                  type="text"
                  value={otp}
                  onChange={(event) => setOtp(event.target.value)}
                  placeholder="6-digit code"
                  className="w-full bg-white border border-rose-100 text-sm rounded-xl focus:ring-rose-500 focus:border-rose-500 block p-3 tracking-[0.3em] text-center"
                  maxLength={6}
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-rose-600 to-red-500 text-sm font-semibold shadow-md shadow-rose-200 flex items-center justify-center gap-2"
              >
                {isSubmitting ? 'Verifying…' : 'Verify & Login'}
              </Button>
            </form>
          )}

          {message && (
            <p
              className={`mt-4 text-xs text-center ${
                isError ? 'text-rose-600' : 'text-emerald-600'
              }`}
            >
              {message}
            </p>
          )}
        </div>
      </div>
    </section>
  );
};

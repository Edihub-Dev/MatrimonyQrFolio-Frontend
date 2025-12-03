import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from 'firebase/auth';
import { Button } from './ui/Button';
import { qrfolioApi, QR_BASE_API_URL } from '../lib/qrfolioApi';
import { firebaseAuth } from '../lib/firebaseClient';

type AuthCardView = 'login' | 'register' | 'forgotPassword' | 'resetPassword' | 'verifyOtps';

export const LoginSection = ({ embedded }: { embedded?: boolean }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);
  const [authCardView, setAuthCardView] = useState<AuthCardView>('login');

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPhone, setRegisterPhone] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState('');
  const [registerEmailOtp, setRegisterEmailOtp] = useState('');
  const [verificationEmail, setVerificationEmail] = useState('');

  const [forgotEmail, setForgotEmail] = useState('');
  const [resetEmail, setResetEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [resetNewPassword, setResetNewPassword] = useState('');
  const [resetConfirmPassword, setResetConfirmPassword] = useState('');

  const [phoneOtp, setPhoneOtp] = useState('');
  const [isPhoneOtpSent, setIsPhoneOtpSent] = useState(false);
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  const [isSendingPhoneOtp, setIsSendingPhoneOtp] = useState(false);
  const [isVerifyingPhoneOtp, setIsVerifyingPhoneOtp] = useState(false);
  const [firebaseIdToken, setFirebaseIdToken] = useState<string | null>(null);

  const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null);
  const confirmationResultRef = useRef<ConfirmationResult | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const url = new URL(window.location.href);
      const emailFromQuery = url.searchParams.get('email');
      if (emailFromQuery) {
        setLoginEmail((current) => current || emailFromQuery);
        setRegisterEmail((current) => current || emailFromQuery);
        setForgotEmail((current) => current || emailFromQuery);
        setResetEmail((current) => current || emailFromQuery);
      }
    } catch {
      // ignore invalid URL
    }
  }, []);

  const clearMessage = () => {
    setMessage(null);
    setIsError(false);
  };

  const ensureRecaptchaVerifier = () => {
    if (typeof window === 'undefined') return null;

    if (!recaptchaVerifierRef.current) {
      recaptchaVerifierRef.current = new RecaptchaVerifier(
        firebaseAuth,
        'firebase-recaptcha-container',
        {
          size: 'invisible',
        },
      );
    }

    return recaptchaVerifierRef.current;
  };

  const handleSendPhoneOtp = async (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) => {
    event.preventDefault();
    clearMessage();

    const rawPhone = registerPhone.trim();
    if (!rawPhone) {
      setIsError(true);
      setMessage('Please enter your mobile number before requesting OTP.');
      return;
    }

    const fullPhone = rawPhone.startsWith('+') ? rawPhone : `+91${rawPhone}`;

    setIsSendingPhoneOtp(true);
    setFirebaseIdToken(null);
    setIsPhoneVerified(false);

    try {
      const verifier = ensureRecaptchaVerifier();
      if (!verifier) {
        throw new Error('Failed to initialize Firebase reCAPTCHA.');
      }

      const confirmation = await signInWithPhoneNumber(
        firebaseAuth,
        fullPhone,
        verifier,
      );

      confirmationResultRef.current = confirmation;
      setIsPhoneOtpSent(true);
      setIsError(false);
      setMessage('OTP sent to your phone via Firebase.');
    } catch (error: any) {
      console.error('Failed to send Firebase OTP:', error);
      setIsError(true);
      setMessage(
        error?.message ||
          'Failed to send OTP. Please check the phone number and try again.',
      );
    } finally {
      setIsSendingPhoneOtp(false);
    }
  };

  const handleVerifyPhoneOtp = async (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) => {
    event.preventDefault();
    clearMessage();

    if (!phoneOtp.trim()) {
      setIsError(true);
      setMessage('Please enter the OTP sent to your phone.');
      return;
    }

    const confirmation = confirmationResultRef.current;
    if (!confirmation) {
      setIsError(true);
      setMessage('OTP session not found. Please request a new OTP.');
      return;
    }

    setIsVerifyingPhoneOtp(true);

    try {
      const result = await confirmation.confirm(phoneOtp.trim());
      const firebaseUser = result.user;
      const token = await firebaseUser.getIdToken();

      setFirebaseIdToken(token);
      setIsPhoneVerified(true);
      setIsError(false);
      setMessage('Phone number verified successfully via Firebase.');
    } catch (error: any) {
      console.error('Failed to verify Firebase OTP:', error);
      setIsError(true);
      setMessage(
        error?.message ||
          'Failed to verify OTP. Please double-check the code and try again.',
      );
    } finally {
      setIsVerifyingPhoneOtp(false);
    }
  };

  const handleEmailLogin = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    clearMessage();

    if (!loginEmail.trim() || !loginPassword.trim()) {
      setIsError(true);
      setMessage('Please enter your email and password.');
      return;
    }

    setIsSubmitting(true);

    try {
      let qrPaid = false;
      // Step 1: validate email/password against main QrFolio backend if configured.
      if (QR_BASE_API_URL) {
        try {
          const qrResponse = await qrfolioApi.post('/auth/login', {
            email: loginEmail.trim(),
            password: loginPassword,
          });

          const qrToken: string | undefined = qrResponse.data?.token;
          const qrUser = qrResponse.data?.user;
          const requiresPayment: boolean | undefined =
            qrResponse.data?.requiresPayment;

          // Treat the user as paid if either the backend marks them as paid,
          // or if requiresPayment is explicitly false.
          qrPaid = requiresPayment === false || Boolean(qrUser?.isPaid);

          if (qrToken && typeof window !== 'undefined') {
            window.localStorage.setItem('qrfolioMainToken', qrToken);
            if (qrUser?.email && !window.localStorage.getItem('qrEmail')) {
              window.localStorage.setItem('qrEmail', qrUser.email);
            }
          }
        } catch (error: any) {
          setIsError(true);
          setMessage(
            error?.response?.data?.message ||
              'Login failed. Please check your email and password.',
          );
          return;
        }
      }

      // Step 2: perform existing matrimony backend login to obtain matrimony JWT & premium flags.
      const response = await axios.post('/api/auth/login', {
        email: loginEmail.trim(),
        password: loginPassword,
        sourceApp: 'matrimony',
        qrPaid,
      });

      const token: string | undefined = response.data?.token;
      const backendPhone: string | undefined = response.data?.user?.phone;
      const backendEmail: string | undefined = response.data?.user?.email;

      if (token && typeof window !== 'undefined') {
        window.localStorage.setItem('qrAuthToken', token);
        if (backendPhone) {
          window.localStorage.setItem('qrPhone', backendPhone);
        }
        if (backendEmail) {
          window.localStorage.setItem('qrEmail', backendEmail);
        }
      }

      setIsError(false);
      setMessage(
        response.data?.message ||
          'Logged in via your QR Folio account. Redirecting you to complete your matrimony profile...',
      );
      if (typeof window !== 'undefined') {
        window.location.href = '/matrimony-onboarding';
      }
    } catch (error: any) {
      setIsError(true);
      setMessage(
        error?.response?.data?.message ||
          'Login failed. Please check your email and password.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegister = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    clearMessage();

    if (!registerName.trim()) {
      setIsError(true);
      setMessage('Please enter your full name.');
      return;
    }

    if (!registerEmail.trim() || !registerPhone.trim()) {
      setIsError(true);
      setMessage('Please enter your email and mobile number.');
      return;
    }

    if (!registerPassword.trim() || !registerConfirmPassword.trim()) {
      setIsError(true);
      setMessage('Please enter and confirm your password.');
      return;
    }

    if (registerPassword !== registerConfirmPassword) {
      setIsError(true);
      setMessage('Passwords do not match.');
      return;
    }

    if (!isPhoneVerified || !firebaseIdToken) {
      setIsError(true);
      setMessage('Please verify your mobile number via OTP before registering.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await axios.post('/api/auth/register-matrimony', {
        name: registerName.trim(),
        email: registerEmail.trim(),
        phone: registerPhone.trim(),
        password: registerPassword,
        firebaseIdToken,
      });

      setVerificationEmail(registerEmail.trim());
      setAuthCardView('verifyOtps');
      setIsError(false);
      setMessage(
        response.data?.message ||
          'Registered successfully. Please verify the OTPs sent to your email and phone.',
      );
    } catch (error: any) {
      const backendMessage = error?.response?.data?.message;
      const details = error?.response?.data?.details;
      const combined =
        backendMessage ||
        (Array.isArray(details) ? details.join(', ') : undefined);
      setIsError(true);
      setMessage(
        combined ||
          'Failed to register. Please check your details and try again.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyOtps = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    clearMessage();

    if (!verificationEmail) {
      setIsError(true);
      setMessage('Registration context missing. Please register again.');
      setAuthCardView('register');
      return;
    }

    if (!registerEmailOtp.trim()) {
      setIsError(true);
      setMessage('Please enter the email OTP code.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await axios.post('/api/auth/verify-matrimony-otps', {
        email: verificationEmail,
        emailCode: registerEmailOtp.trim(),
      });

      const token: string | undefined = response.data?.token;
      const backendPhone: string | undefined = response.data?.user?.phone;
      const backendEmail: string | undefined = response.data?.user?.email;

      if (token && typeof window !== 'undefined') {
        window.localStorage.setItem('qrAuthToken', token);
        if (backendPhone) {
          window.localStorage.setItem('qrPhone', backendPhone);
        }
        if (backendEmail) {
          window.localStorage.setItem('qrEmail', backendEmail);
        }
      }

      setIsError(false);
      setMessage(
        response.data?.message ||
          'Verification successful. You can now access your matrimony profile.',
      );
      if (typeof window !== 'undefined') {
        window.location.href = '/matrimony-onboarding';
      }
    } catch (error: any) {
      setIsError(true);
      setMessage(
        error?.response?.data?.message ||
          'Failed to verify OTPs. Please double-check the codes and try again.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPasswordRequest = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    clearMessage();

    if (!forgotEmail.trim()) {
      setIsError(true);
      setMessage('Please enter your email address.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await axios.post('/api/auth/request-password-reset', {
        email: forgotEmail.trim(),
      });

      setResetEmail(forgotEmail.trim());
      setAuthCardView('resetPassword');
      setIsError(false);
      setMessage(
        response.data?.message ||
          'If an account exists, a reset code has been sent to your email.',
      );
    } catch (error: any) {
      setIsError(true);
      setMessage(
        error?.response?.data?.message ||
          'Failed to start password reset. Please try again.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    clearMessage();

    if (!resetEmail.trim() || !resetCode.trim()) {
      setIsError(true);
      setMessage('Please enter your email and reset code.');
      return;
    }

    if (!resetNewPassword.trim() || !resetConfirmPassword.trim()) {
      setIsError(true);
      setMessage('Please enter and confirm your new password.');
      return;
    }

    if (resetNewPassword !== resetConfirmPassword) {
      setIsError(true);
      setMessage('New passwords do not match.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await axios.post('/api/auth/reset-password-with-code', {
        email: resetEmail.trim(),
        code: resetCode.trim(),
        newPassword: resetNewPassword,
      });

      const token: string | undefined = response.data?.token;
      const backendPhone: string | undefined = response.data?.user?.phone;
      const backendEmail: string | undefined = response.data?.user?.email;

      if (token && typeof window !== 'undefined') {
        window.localStorage.setItem('qrAuthToken', token);
        if (backendPhone) {
          window.localStorage.setItem('qrPhone', backendPhone);
        }
        if (backendEmail) {
          window.localStorage.setItem('qrEmail', backendEmail);
        }
      }

      setIsError(false);
      setMessage(
        response.data?.message ||
          'Password reset successfully. You are now logged in.',
      );
      if (typeof window !== 'undefined') {
        window.location.href = '/matrimonial-profile';
      }
    } catch (error: any) {
      setIsError(true);
      setMessage(
        error?.response?.data?.message ||
          'Failed to reset password. Please check the details and try again.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const card = (
    <div className="bg-rose-50/70 border border-rose-100 rounded-2xl p-6 sm:p-7 shadow-sm max-w-md w-full mx-auto">
      <div className="flex items-center justify-between mb-5 text-xs font-semibold bg-white/70 rounded-full p-1">
        <button
          type="button"
          onClick={() => {
            clearMessage();
            setAuthCardView('login');
          }}
          className={`flex-1 px-3 py-1 rounded-full transition text-center ${
            authCardView === 'login' ||
            authCardView === 'forgotPassword' ||
            authCardView === 'resetPassword'
              ? 'bg-rose-600 text-white shadow-sm'
              : 'text-gray-700'
          }`}
        >
          Login
        </button>
        <button
          type="button"
          onClick={() => {
            clearMessage();
            setAuthCardView('register');
          }}
          className={`flex-1 px-3 py-1 rounded-full transition text-center ${
            authCardView === 'register' || authCardView === 'verifyOtps'
              ? 'bg-rose-600 text-white shadow-sm'
              : 'text-gray-700'
          }`}
        >
          Register
        </button>
      </div>

      {authCardView === 'login' && (
        <form className="space-y-4" onSubmit={handleEmailLogin}>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-600">
              Email
            </label>
            <input
              type="email"
              value={loginEmail}
              onChange={(event) => setLoginEmail(event.target.value)}
              placeholder="you@example.com"
              className="w-full bg-white border border-rose-100 text-sm rounded-xl focus:ring-rose-500 focus:border-rose-500 block p-3"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-600">
              Password
            </label>
            <input
              type="password"
              value={loginPassword}
              onChange={(event) => setLoginPassword(event.target.value)}
              placeholder="Your password"
              className="w-full bg-white border border-rose-100 text-sm rounded-xl focus:ring-rose-500 focus:border-rose-500 block p-3"
              required
            />
          </div>

          <div className="flex items-center justify-between text-[11px]">
            <button
              type="button"
              className="text-rose-600 hover:text-rose-700 font-medium"
              onClick={() => {
                clearMessage();
                setAuthCardView('forgotPassword');
                setForgotEmail(loginEmail);
              }}
            >
              Forgot password?
            </button>
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-rose-600 to-red-500 text-sm font-semibold shadow-md shadow-rose-200 flex items-center justify-center gap-2"
          >
            {isSubmitting ? 'Signing in…' : 'Login'}
          </Button>
        </form>
      )}

      {authCardView === 'register' && (
        <form className="space-y-4" onSubmit={handleRegister}>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-600">Full name</label>
            <input
              type="text"
              value={registerName}
              onChange={(event) => setRegisterName(event.target.value)}
              placeholder="Your full name"
              className="w-full bg-white border border-rose-100 text-sm rounded-xl focus:ring-rose-500 focus:border-rose-500 block p-3"
              required
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-600">Email</label>
            <input
              type="email"
              value={registerEmail}
              onChange={(event) => setRegisterEmail(event.target.value)}
              placeholder="you@example.com"
              className="w-full bg-white border border-rose-100 text-sm rounded-xl focus:ring-rose-500 focus:border-rose-500 block p-3"
              required
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-600">
              Mobile number
            </label>
            <input
              type="tel"
              value={registerPhone}
              onChange={(event) => setRegisterPhone(event.target.value)}
              placeholder="10-digit mobile number"
              className="w-full bg-white border border-rose-100 text-sm rounded-xl focus:ring-rose-500 focus:border-rose-500 block p-3"
              required
            />
          </div>
          <div className="space-y-2">
            <p className="text-[11px] text-gray-600">
              Verify your mobile number via SMS OTP powered by Firebase.
            </p>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <button
                type="button"
                onClick={handleSendPhoneOtp}
                className="px-3 py-2 text-[11px] font-semibold rounded-xl border border-rose-200 bg-white text-rose-600 hover:bg-rose-50 disabled:opacity-60"
                disabled={isSendingPhoneOtp || isVerifyingPhoneOtp}
              >
                {isSendingPhoneOtp
                  ? 'Sending OTP…'
                  : isPhoneOtpSent
                    ? 'Resend OTP'
                    : 'Send OTP'}
              </button>

              {isPhoneOtpSent && (
                <div className="flex-1 flex flex-col sm:flex-row sm:items-center gap-2">
                  <input
                    type="text"
                    value={phoneOtp}
                    onChange={(event) => setPhoneOtp(event.target.value)}
                    placeholder="6-digit OTP"
                    className="flex-1 bg-white border border-rose-100 text-sm rounded-xl focus:ring-rose-500 focus:border-rose-500 block px-3 py-2 tracking-[0.3em] text-center"
                    maxLength={6}
                  />
                  <button
                    type="button"
                    onClick={handleVerifyPhoneOtp}
                    className="px-3 py-2 text-[11px] font-semibold rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 disabled:opacity-60"
                    disabled={isVerifyingPhoneOtp}
                  >
                    {isVerifyingPhoneOtp
                      ? 'Verifying…'
                      : isPhoneVerified
                        ? 'Verified'
                        : 'Verify'}
                  </button>
                </div>
              )}
            </div>
            <div id="firebase-recaptcha-container" />
            {isPhoneVerified && (
              <p className="text-[11px] text-emerald-700 mt-1">
                Phone verified. You can now complete your registration.
              </p>
            )}
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-600">
              Password
            </label>
            <input
              type="password"
              value={registerPassword}
              onChange={(event) => setRegisterPassword(event.target.value)}
              placeholder="Create a password"
              className="w-full bg-white border border-rose-100 text-sm rounded-xl focus:ring-rose-500 focus:border-rose-500 block p-3"
              required
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-600">
              Confirm password
            </label>
            <input
              type="password"
              value={registerConfirmPassword}
              onChange={(event) => setRegisterConfirmPassword(event.target.value)}
              placeholder="Re-enter password"
              className="w-full bg-white border border-rose-100 text-sm rounded-xl focus:ring-rose-500 focus:border-rose-500 block p-3"
              required
            />
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-rose-600 to-red-500 text-sm font-semibold shadow-md shadow-rose-200 flex items-center justify-center gap-2"
          >
            {isSubmitting ? 'Creating account…' : 'Register'}
          </Button>
        </form>
      )}

      {authCardView === 'verifyOtps' && (
        <form className="space-y-4" onSubmit={handleVerifyOtps}>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-600">
              Email OTP
            </label>
            <input
              type="text"
              value={registerEmailOtp}
              onChange={(event) => setRegisterEmailOtp(event.target.value)}
              placeholder="6-digit code from email"
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
            {isSubmitting ? 'Verifying…' : 'Verify & Continue'}
          </Button>
        </form>
      )}

      {authCardView === 'forgotPassword' && (
        <form className="space-y-4" onSubmit={handleForgotPasswordRequest}>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-600">
              Email
            </label>
            <input
              type="email"
              value={forgotEmail}
              onChange={(event) => setForgotEmail(event.target.value)}
              placeholder="you@example.com"
              className="w-full bg-white border border-rose-100 text-sm rounded-xl focus:ring-rose-500 focus:border-rose-500 block p-3"
              required
            />
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-rose-600 to-red-500 text-sm font-semibold shadow-md shadow-rose-200 flex items-center justify-center gap-2"
          >
            {isSubmitting ? 'Sending code…' : 'Send reset code'}
          </Button>

          <button
            type="button"
            className="block w-full text-[11px] text-gray-600 mt-1"
            onClick={() => {
              clearMessage();
              setAuthCardView('login');
            }}
          >
            Back to login
          </button>
        </form>
      )}

      {authCardView === 'resetPassword' && (
        <form className="space-y-4" onSubmit={handleResetPassword}>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-600">
              Email
            </label>
            <input
              type="email"
              value={resetEmail}
              onChange={(event) => setResetEmail(event.target.value)}
              placeholder="you@example.com"
              className="w-full bg-white border border-rose-100 text-sm rounded-xl focus:ring-rose-500 focus:border-rose-500 block p-3"
              required
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-600">
              Reset code
            </label>
            <input
              type="text"
              value={resetCode}
              onChange={(event) => setResetCode(event.target.value)}
              placeholder="6-digit code from email"
              className="w-full bg-white border border-rose-100 text-sm rounded-xl focus:ring-rose-500 focus:border-rose-500 block p-3 tracking-[0.3em] text-center"
              maxLength={6}
              required
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-600">
              New password
            </label>
            <input
              type="password"
              value={resetNewPassword}
              onChange={(event) => setResetNewPassword(event.target.value)}
              placeholder="New password"
              className="w-full bg-white border border-rose-100 text-sm rounded-xl focus:ring-rose-500 focus:border-rose-500 block p-3"
              required
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-600">
              Confirm new password
            </label>
            <input
              type="password"
              value={resetConfirmPassword}
              onChange={(event) => setResetConfirmPassword(event.target.value)}
              placeholder="Re-enter new password"
              className="w-full bg-white border border-rose-100 text-sm rounded-xl focus:ring-rose-500 focus-border-rose-500 block p-3"
              required
            />
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-rose-600 to-red-500 text-sm font-semibold shadow-md shadow-rose-200 flex items-center justify-center gap-2"
          >
            {isSubmitting ? 'Updating password…' : 'Reset password & Login'}
          </Button>

          <button
            type="button"
            className="block w-full text-[11px] text-gray-600 mt-1"
            onClick={() => {
              clearMessage();
              setAuthCardView('login');
            }}
          >
            Back to login
          </button>
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
  );

  if (embedded) {
    return card;
  }

  return (
    <section id="login" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-[1.2fr_minmax(0,1fr)] gap-12 items-center">
        <div className="space-y-4 max-w-xl">
          <h2 className="text-3xl font-bold text-gray-900">Access your matrimony account</h2>
          <p className="text-sm sm:text-base text-gray-600">
            Login with email &amp; password, or create a new account to
            start managing your QR-backed matrimony profile.
          </p>
        </div>

        {card}
      </div>
    </section>
  );
};

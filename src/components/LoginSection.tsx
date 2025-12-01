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
type AuthCardView = 'login' | 'register' | 'forgotPassword' | 'resetPassword' | 'verifyOtps';
type LoginMethod = 'phone' | 'email';

export const LoginSection = () => {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<LoginStep>('phone');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);
  const [authCardView, setAuthCardView] = useState<AuthCardView>('login');
  const [loginMethod, setLoginMethod] = useState<LoginMethod>('phone');

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPhone, setRegisterPhone] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState('');
  const [registerEmailOtp, setRegisterEmailOtp] = useState('');
  const [registerPhoneOtp, setRegisterPhoneOtp] = useState('');
  const [verificationEmail, setVerificationEmail] = useState('');
  const [verificationPhone, setVerificationPhone] = useState('');

  const [forgotEmail, setForgotEmail] = useState('');
  const [resetEmail, setResetEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [resetNewPassword, setResetNewPassword] = useState('');
  const [resetConfirmPassword, setResetConfirmPassword] = useState('');

  const confirmationResultRef = useRef<ConfirmationResult | null>(null);
  const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null);

  const clearMessage = () => {
    setMessage(null);
    setIsError(false);
  };

  const handleSendOtp = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    clearMessage();

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
    clearMessage();

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
    } catch (error: any) {
      setIsError(true);
      setMessage(
        error?.response?.data?.message ||
          'OTP verification failed. Please try again.',
      );
    } finally {
      setIsSubmitting(false);
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
      const response = await axios.post('/api/auth/login', {
        email: loginEmail.trim(),
        password: loginPassword,
        sourceApp: 'matrimony',
      });

      const token: string | undefined = response.data?.token;
      const backendPhone: string | undefined = response.data?.user?.phone;
      const backendEmail: string | undefined = response.data?.user?.email;
      const matrimonyPremium = response.data?.user?.matrimonyPremium;
      const isMatrimonyPremiumActive = Boolean(matrimonyPremium?.isActive);

      if (token && typeof window !== 'undefined') {
        window.localStorage.setItem('qrAuthToken', token);
        if (backendPhone) {
          window.localStorage.setItem('qrPhone', backendPhone);
        }
        if (backendEmail) {
          window.localStorage.setItem('qrEmail', backendEmail);
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

    setIsSubmitting(true);

    try {
      const response = await axios.post('/api/auth/register-matrimony', {
        email: registerEmail.trim(),
        phone: registerPhone.trim(),
        password: registerPassword,
      });

      setVerificationEmail(registerEmail.trim());
      setVerificationPhone(registerPhone.trim());
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

    if (!verificationEmail || !verificationPhone) {
      setIsError(true);
      setMessage('Registration context missing. Please register again.');
      setAuthCardView('register');
      return;
    }

    if (!registerEmailOtp.trim() || !registerPhoneOtp.trim()) {
      setIsError(true);
      setMessage('Please enter both email and phone OTP codes.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await axios.post('/api/auth/verify-matrimony-otps', {
        email: verificationEmail,
        emailCode: registerEmailOtp.trim(),
        phone: verificationPhone,
        phoneCode: registerPhoneOtp.trim(),
      });

      const token: string | undefined = response.data?.token;
      const backendPhone: string | undefined = response.data?.user?.phone;
      const backendEmail: string | undefined = response.data?.user?.email;
      const matrimonyPremium = response.data?.user?.matrimonyPremium;
      const isMatrimonyPremiumActive = Boolean(matrimonyPremium?.isActive);
      const needsPayment: boolean = Boolean(response.data?.needsPayment);

      if (token && typeof window !== 'undefined') {
        window.localStorage.setItem('qrAuthToken', token);
        if (backendPhone) {
          window.localStorage.setItem('qrPhone', backendPhone);
        }
        if (backendEmail) {
          window.localStorage.setItem('qrEmail', backendEmail);
        }
      }

      if (needsPayment || !isMatrimonyPremiumActive) {
        if (typeof window !== 'undefined') {
          window.location.href = '/membership';
        }
        return;
      }

      setIsError(false);
      setMessage(
        response.data?.message ||
          'Verification successful. You can now access your matrimony profile.',
      );
      setAuthCardView('login');
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
      const matrimonyPremium = response.data?.user?.matrimonyPremium;
      const isMatrimonyPremiumActive = Boolean(matrimonyPremium?.isActive);

      if (token && typeof window !== 'undefined') {
        window.localStorage.setItem('qrAuthToken', token);
        if (backendPhone) {
          window.localStorage.setItem('qrPhone', backendPhone);
        }
        if (backendEmail) {
          window.localStorage.setItem('qrEmail', backendEmail);
        }
      }

      if (!isMatrimonyPremiumActive) {
        if (typeof window !== 'undefined') {
          window.location.href = '/membership';
        }
        return;
      }

      setIsError(false);
      setMessage(
        response.data?.message ||
          'Password reset successfully. You are now logged in.',
      );
      setAuthCardView('login');
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
          <h2 className="text-3xl font-bold text-gray-900">Access your matrimony account</h2>
          <p className="text-sm sm:text-base text-gray-600">
            Login with mobile OTP or email &amp; password, or create a new account to
            start managing your QR-backed matrimony profile.
          </p>
        </div>

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
            <>
              <div className="flex items-center justify-center gap-2 mb-4 text-[11px] font-medium">
                <button
                  type="button"
                  className={`px-3 py-1 rounded-full border text-xs ${
                    loginMethod === 'phone'
                      ? 'bg-white border-rose-200 text-rose-600 shadow-sm'
                      : 'border-transparent text-gray-600'
                  }`}
                  onClick={() => {
                    clearMessage();
                    setLoginMethod('phone');
                    setStep('phone');
                  }}
                >
                  Mobile OTP
                </button>
                <button
                  type="button"
                  className={`px-3 py-1 rounded-full border text-xs ${
                    loginMethod === 'email'
                      ? 'bg-white border-rose-200 text-rose-600 shadow-sm'
                      : 'border-transparent text-gray-600'
                  }`}
                  onClick={() => {
                    clearMessage();
                    setLoginMethod('email');
                  }}
                >
                  Email &amp; Password
                </button>
              </div>

              {loginMethod === 'phone' && (
                <>
                  {step === 'phone' && (
                    <form className="space-y-4" onSubmit={handleSendOtp}>
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-gray-600">
                          Mobile number
                        </label>
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
                        <label className="text-xs font-semibold text-gray-600">
                          Enter OTP
                        </label>
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
                </>
              )}

              {loginMethod === 'email' && (
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
            </>
          )}

          {authCardView === 'register' && (
            <form className="space-y-4" onSubmit={handleRegister}>
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
                  onChange={(event) =>
                    setRegisterConfirmPassword(event.target.value)
                  }
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
                {isSubmitting ? 'Creating account…' : 'Register & Send OTPs'}
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
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-600">
                  Phone OTP
                </label>
                <input
                  type="text"
                  value={registerPhoneOtp}
                  onChange={(event) => setRegisterPhoneOtp(event.target.value)}
                  placeholder="6-digit code from SMS"
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
            <form
              className="space-y-4"
              onSubmit={handleForgotPasswordRequest}
            >
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
                  onChange={(event) =>
                    setResetConfirmPassword(event.target.value)
                  }
                  placeholder="Re-enter new password"
                  className="w-full bg-white border border-rose-100 text-sm rounded-xl focus:ring-rose-500 focus:border-rose-500 block p-3"
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
      </div>
    </section>
  );
};

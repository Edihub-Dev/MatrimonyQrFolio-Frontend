import React, { useEffect, useState } from 'react';
import { Check, ChevronDown, Loader2 } from 'lucide-react';
import axios from 'axios';
import { Button } from './ui/Button';

export const Hero = () => {
  const [formData, setFormData] = useState({
    profileFor: 'Self',
    gender: 'Female',
    age: '',
    religion: 'Hindu',
    motherTongue: 'Hindi',
    city: '',
    email: '',
    phone: '',
    plan: 'free',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<
    { type: 'success' | 'error'; message: string } | null
  >(null);

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target;
    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    setStatus(null);

    const token =
      typeof window !== 'undefined'
        ? window.localStorage.getItem('qrAuthToken')
        : null;

    if (!token) {
      setStatus({
        type: 'error',
        message: 'Please verify your mobile number in the Login section first.',
      });
      return;
    }

    if (!formData.email.trim()) {
      setStatus({
        type: 'error',
        message: 'Please enter your email address.',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await axios.post('/api/leads', {
        profileFor: formData.profileFor,
        gender: formData.gender,
        age: formData.age,
        religion: formData.religion,
        motherTongue: formData.motherTongue,
        city: formData.city,
        email: formData.email,
        phone: formData.phone,
        plan: formData.plan,
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setStatus({
        type: 'success',
        message: 'Your QR-backed matrimony profile request has been submitted.',
      });

      setFormData({
        profileFor: 'Self',
        gender: 'Female',
        age: '',
        religion: 'Hindu',
        motherTongue: 'Hindi',
        city: '',
        email: '',
        phone: '',
        plan: 'free',
      });
    } catch (error) {
      setStatus({
        type: 'error',
        message: 'Something went wrong. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const storedPhone = window.localStorage.getItem('qrPhone');
    const storedPlan = window.localStorage.getItem('qrSelectedPlan');

    setFormData((previous) => ({
      ...previous,
      phone: storedPhone || previous.phone,
      plan: storedPlan || previous.plan,
    }));

    const handlePlanSelect = (event: Event) => {
      const custom = event as CustomEvent<{ plan?: string }>;
      const selectedPlan = custom.detail?.plan;
      if (!selectedPlan) return;
      setFormData((previous) => ({
        ...previous,
        plan: selectedPlan,
      }));
    };

    window.addEventListener('qr:select-plan', handlePlanSelect as EventListener);

    return () => {
      window.removeEventListener(
        'qr:select-plan',
        handlePlanSelect as EventListener,
      );
    };
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <section className="relative bg-gradient-to-b from-orange-50/50 to-white pt-12 pb-20 lg:pt-20 lg:pb-28 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          
          {/* Left Content */}
          <div className="space-y-8 text-center lg:text-left">
            <div className="inline-flex items-center space-x-2 bg-rose-100/80 border border-rose-200 rounded-full px-3 py-1">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              <span className="text-xs font-bold text-rose-700 tracking-wide uppercase">Verified QR Profiles • Instant Sharing</span>
            </div>

            <h1 className="text-4xl lg:text-6xl font-extrabold text-gray-900 leading-tight">
              Find your perfect match with <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-600 to-orange-600">QR-powered profiles.</span>
            </h1>

            <p className="text-lg text-gray-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              A modern matrimony platform where every profile comes with a unique, scannable QR powered by QRfolio. Share your story in seconds – at events, through WhatsApp, or in person.
            </p>

            <div className="flex flex-wrap justify-center lg:justify-start gap-y-2 gap-x-6 text-sm font-medium text-gray-700">
              <div className="flex items-center gap-2">
                <div className="bg-rose-100 p-0.5 rounded-full"><Check size={14} className="text-rose-600" /></div>
                Verified & permission-based sharing
              </div>
              <div className="flex items-center gap-2">
                <div className="bg-rose-100 p-0.5 rounded-full"><Check size={14} className="text-rose-600" /></div>
                Profile + photos + work portfolio
              </div>
              <div className="flex items-center gap-2">
                <div className="bg-rose-100 p-0.5 rounded-full"><Check size={14} className="text-rose-600" /></div>
                Perfect for families and networking events
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4">
              <Button
                size="lg"
                className="w-full sm:w-auto bg-gradient-to-r from-rose-600 to-red-500 shadow-lg shadow-rose-200/50"
                onClick={() => scrollToSection('lead-form')}
              >
                Start Free Matchmaking
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto"
                onClick={() => scrollToSection('plans')}
              >
                View Membership Plans
              </Button>
            </div>

            <p className="text-xs text-gray-400 pt-2">No printing, no paper. Just scan, connect, and take the next step confidently.</p>
          </div>

          {/* Right Form Card */}
          <div className="relative" id="lead-form">
            {/* Decorative elements */}
            <div className="absolute -top-10 -right-10 w-64 h-64 bg-orange-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
            <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-rose-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>

            <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 p-6 sm:p-8 relative z-10 border border-gray-100">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Begin your QR-backed matchmaking</h3>
                </div>
                <div className="hidden sm:block border border-dashed border-rose-300 bg-rose-50 px-3 py-1 rounded-lg">
                  <span className="text-[10px] font-bold text-rose-700 uppercase tracking-wide">Takes less than 2 min</span>
                </div>
              </div>

              <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-500">Profile For</label>
                    <div className="relative">
                      <select
                        name="profileFor"
                        value={formData.profileFor}
                        onChange={handleChange}
                        className="w-full appearance-none bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-rose-500 focus:border-rose-500 block p-3 pr-8"
                      >
                        <option value="Self">Self</option>
                        <option value="Son">Son</option>
                        <option value="Daughter">Daughter</option>
                        <option value="Sibling">Sibling</option>
                        <option value="Friend">Friend</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-3.5 text-gray-400 pointer-events-none" size={16} />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-500">Gender</label>
                    <div className="relative">
                      <select
                        name="gender"
                        value={formData.gender}
                        onChange={handleChange}
                        className="w-full appearance-none bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-rose-500 focus:border-rose-500 block p-3 pr-8"
                      >
                        <option value="Female">Female</option>
                        <option value="Male">Male</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-3.5 text-gray-400 pointer-events-none" size={16} />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-500">Age</label>
                    <input
                      type="number"
                      name="age"
                      value={formData.age}
                      onChange={handleChange}
                      placeholder="e.g. 27"
                      className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-rose-500 focus:border-rose-500 block p-3"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-500">Religion</label>
                    <div className="relative">
                      <select
                        name="religion"
                        value={formData.religion}
                        onChange={handleChange}
                        className="w-full appearance-none bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-rose-500 focus:border-rose-500 block p-3 pr-8"
                      >
                        <option value="Hindu">Hindu</option>
                        <option value="Muslim">Muslim</option>
                        <option value="Christian">Christian</option>
                        <option value="Sikh">Sikh</option>
                        <option value="Other">Other</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-3.5 text-gray-400 pointer-events-none" size={16} />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-500">Mother Tongue</label>
                    <div className="relative">
                      <select
                        name="motherTongue"
                        value={formData.motherTongue}
                        onChange={handleChange}
                        className="w-full appearance-none bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-rose-500 focus:border-rose-500 block p-3 pr-8"
                      >
                        <option value="Hindi">Hindi</option>
                        <option value="English">English</option>
                        <option value="Marathi">Marathi</option>
                        <option value="Tamil">Tamil</option>
                        <option value="Telugu">Telugu</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-3.5 text-gray-400 pointer-events-none" size={16} />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-500">City</label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      placeholder="e.g. Mumbai"
                      className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-rose-500 focus:border-rose-500 block p-3"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-500">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-rose-500 focus:border-rose-500 block p-3"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-500">Mobile number</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="10-digit mobile number"
                    className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-rose-500 focus:border-rose-500 block p-3"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-rose-600 to-red-600 text-lg font-semibold shadow-lg shadow-rose-200 mt-2 flex items-center justify-center gap-2"
                >
                  {isSubmitting && (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  )}
                  <span>{isSubmitting ? 'Submitting...' : 'Create My Profile & QR'}</span>
                </Button>

                {status && (
                  <p
                    className={`text-[11px] text-center ${
                      status.type === 'success'
                        ? 'text-emerald-600'
                        : 'text-rose-600'
                    }`}
                  >
                    {status.message}
                  </p>
                )}
                
                <p className="text-[10px] text-gray-400 text-center leading-tight px-4">
                  By continuing, you create a QRfolio-backed digital profile and agree to our Terms & Privacy Policy.
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

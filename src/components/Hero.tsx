import { useEffect } from 'react';
import { Check } from 'lucide-react';
import { Button } from './ui/Button';
import { LoginSection } from './LoginSection';

export const Hero = () => {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handlePlanSelect = (event: Event) => {
      // Hero no longer submits leads directly; keep listener in case of future use.
      void event;
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
    <section className="relative bg-gradient-to-b from-rose-950 via-rose-900 to-amber-50 pt-12 pb-20 lg:pt-20 lg:pb-28 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          
          {/* Left Content */}
          <div className="space-y-8 text-center lg:text-left">
            <div className="inline-flex items-center space-x-2 bg-amber-50/80 border border-amber-200 rounded-full px-3 py-1">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              <span className="text-xs font-bold text-amber-800 tracking-wide uppercase">Verified QR Profiles • Instant Sharing</span>
            </div>

            <h1 className="text-4xl lg:text-6xl font-extrabold text-amber-50 leading-tight">
              Find your perfect match with <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-amber-500">QR-powered profiles.</span>
            </h1>

            <p className="text-lg text-amber-100/90 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              A modern matrimony platform where every profile comes with a unique, scannable QR powered by QRfolio. Share your story in seconds – at events, through WhatsApp, or in person.
            </p>

            <div className="flex flex-wrap justify-center lg:justify-start gap-y-2 gap-x-6 text-sm font-medium text-amber-50">
              <div className="flex items-center gap-2">
                <div className="bg-amber-100/80 p-0.5 rounded-full"><Check size={14} className="text-amber-700" /></div>
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
                className="w-full sm:w-auto bg-gradient-to-r from-rose-800 to-amber-500 shadow-lg shadow-amber-500/40"
                onClick={() => scrollToSection('login')}
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

            <p className="text-xs text-amber-100/80 pt-2">No printing, no paper. Just scan, connect, and take the next step confidently.</p>
          </div>

          {/* Right: Full Login/Register form embedded into hero */}
          <div className="relative" id="login">
            {/* Decorative elements */}
            <div className="absolute -top-10 -right-10 w-64 h-64 bg-orange-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
            <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-rose-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>

            <div className="relative z-10">
              <LoginSection embedded />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

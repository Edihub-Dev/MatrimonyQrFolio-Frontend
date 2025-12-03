import { useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { DarkBanner } from './components/DarkBanner';
import { Stats } from './components/Stats';
import { Features } from './components/Features';
import { HowItWorks } from './components/HowItWorks';
import { SampleProfiles } from './components/SampleProfiles';
import { MembershipPlans } from './components/MembershipPlans';
import { ProfilesSection } from './components/ProfilesSection';
import { QrApp } from './components/QrApp';
import { Footer } from './components/Footer';

function App() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.location.pathname === '/membership') {
      const el = document.getElementById('plans');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }, []);

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 selection:bg-rose-100 selection:text-rose-900">
      <Navbar />
      <main>
        <Hero />
        <DarkBanner />
        <Stats />
        <Features />
        <HowItWorks />
        <SampleProfiles />
        <MembershipPlans />
        <ProfilesSection />
        <QrApp />
      </main>
      <Footer />
    </div>
  );
}

export default App;

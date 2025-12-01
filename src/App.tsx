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
import { LoginSection } from './components/LoginSection';
import { Footer } from './components/Footer';

function App() {
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
        <LoginSection />
      </main>
      <Footer />
    </div>
  );
}

export default App;

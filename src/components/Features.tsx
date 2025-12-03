import { Smartphone, FileText, Shield, Zap, Users, Globe } from 'lucide-react';

const FeatureCard = ({ icon: Icon, title, description, badge }: { icon: any, title: string, description: string, badge?: string }) => (
  <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 group">
    <div className="flex justify-between items-start mb-4">
      <div className="w-12 h-12 bg-rose-50 rounded-xl flex items-center justify-center group-hover:bg-rose-100 transition-colors">
        <Icon className="text-rose-600" size={24} />
      </div>
      {badge && (
        <span className="bg-rose-50 text-rose-600 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wide">
          {badge}
        </span>
      )}
    </div>
    <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
    <p className="text-sm text-gray-600 leading-relaxed">{description}</p>
  </div>
);

export const Features = () => {
  return (
    <section className="py-20 bg-white" id="features">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Modern matrimony, powered by QR & portfolios</h2>
          <p className="text-gray-600">
            Blend the trust of traditional matchmaking with the speed and transparency of QR-backed digital profiles.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <FeatureCard 
            icon={Smartphone}
            title="One QR. Everywhere."
            description="Use your unique QR on cards, event invites, or WhatsApp. Anyone who scans sees your curated matrimony profile powered by QRfolio."
            badge="QR First"
          />
          <FeatureCard 
            icon={FileText}
            title="Rich biodata + media"
            description="Go beyond basic biodata – add photos, videos, work samples, and achievements so families get a complete picture in one place."
          />
          <FeatureCard 
            icon={Shield}
            title="Privacy & control"
            description="Your profile link & QR can be shared only with people you trust. Update or hide details anytime without re-sending documents."
          />
          <FeatureCard 
            icon={Zap}
            title="Instant updates"
            description="Update your QRfolio profile once, and it reflects for everyone who scans your QR – no confusion, no outdated biodata files."
          />
          <FeatureCard 
            icon={Users}
            title="Family-friendly view"
            description="Clean, readable profile layout designed for parents and elders – minimal scrolling, clear sections, easy to print if needed."
          />
          <FeatureCard 
            icon={Globe}
            title="NRI & outstation ready"
            description="Shortlist and share profiles across cities & countries in one tap, without managing huge WhatsApp albums and PDFs."
          />
        </div>
      </div>
    </section>
  );
};

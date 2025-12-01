import React from 'react';

const Step = ({ number, title, description }: { number: string, title: string, description: string }) => (
  <div className="relative p-6 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
    <div className="w-10 h-10 rounded-full bg-rose-600 text-white flex items-center justify-center font-bold text-lg mb-4 shadow-lg shadow-rose-200">
      {number}
    </div>
    <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
    <p className="text-sm text-gray-600 leading-relaxed">{description}</p>
  </div>
);

export const HowItWorks = () => {
  return (
    <section className="py-20 bg-gray-50" id="how-it-works">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">How QRfolio Matrimony works</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            From sign up to scan – here's how you can turn your biodata into a smart, shareable QR-powered profile.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Step 
            number="1"
            title="Create your account"
            description="Register with basic details for yourself or your family member and verify your mobile number."
          />
          <Step 
            number="2"
            title="Build your QRfolio profile"
            description="Add biodata, education, profession, photos, and portfolio links. Everything stays organized in one digital card."
          />
          <Step 
            number="3"
            title="Get your unique QR"
            description="We generate a personalized QRfolio QR that opens your profile instantly when scanned from any smartphone."
          />
          <Step 
            number="4"
            title="Share & get responses faster"
            description="Share the QR/link with prospects, parents, or matchmakers. Track interest and update details anytime."
          />
        </div>
      </div>
    </section>
  );
};

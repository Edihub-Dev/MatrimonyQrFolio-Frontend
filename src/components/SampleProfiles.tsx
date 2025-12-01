import React from 'react';
import { QrCode } from 'lucide-react';

const ProfileCard = ({ name, age, role, location, caste, tags, isNri = false }: any) => (
  <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all flex items-center justify-between gap-4 min-w-[300px]">
    <div className="space-y-2">
      <div>
        <h3 className="font-bold text-gray-900 text-lg">{name}</h3>
        <p className="text-xs text-gray-500">{role} • {location} • {caste}</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag: string, i: number) => (
          <span key={i} className="bg-rose-50 text-rose-700 text-[10px] font-medium px-2 py-1 rounded-full border border-rose-100">
            {tag}
          </span>
        ))}
      </div>
    </div>
    <div className="flex flex-col items-center gap-1">
      <div className="bg-gray-900 p-2 rounded-lg shadow-lg">
        <QrCode className="text-white" size={32} />
      </div>
      <span className="text-[9px] text-gray-400 text-center leading-tight">
        {isNri ? "Perfect for global sharing" : "Scan to view full QRfolio"}
      </span>
    </div>
  </div>
);

export const SampleProfiles = () => {
  return (
    <section className="py-20 bg-white overflow-hidden" id="samples">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Sample QR-backed profiles</h2>
          <p className="text-gray-600">
            Every profile gets a unique QR – scannable from visiting cards, event stands, or directly on your phone.
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-6 justify-center items-center">
          <ProfileCard 
            name="Aditi Sharma, 27"
            role="Software Engineer"
            location="Mumbai"
            caste="Brahmin"
            tags={["B.Tech, IIT", "5'4\"", "Vegetarian"]}
          />
          <ProfileCard 
            name="Rohit Verma, 30"
            role="Entrepreneur"
            location="Bengaluru"
            caste="Khatri"
            tags={["MBA", "5'9\"", "Non-vegetarian"]}
          />
          <ProfileCard 
            name="NRI Profile"
            role="USA based"
            location="IT Professional"
            caste="Hindu"
            tags={["NRI", "Profile video", "Family photos"]}
            isNri={true}
          />
        </div>
      </div>
    </section>
  );
};

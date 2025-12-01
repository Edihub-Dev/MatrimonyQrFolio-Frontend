import React from 'react';

const StatCard = ({ value, label, subtext }: { value: string, label: string, subtext?: string }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
    <div className="text-3xl font-bold text-rose-600 mb-1">{value}</div>
    <div className="text-sm font-medium text-gray-900">{label}</div>
    {subtext && <div className="text-xs text-gray-500 mt-1">{subtext}</div>}
  </div>
);

export const Stats = () => {
  return (
    <section className="py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard value="50K+" label="QR-powered profiles created" />
          <StatCard value="3x faster" label="response rate" subtext="vs. traditional biodata" />
          <StatCard value="0" label="print cost for biodatas" />
          <StatCard value="24x7" label="secure, private access to details" />
        </div>
      </div>
    </section>
  );
};

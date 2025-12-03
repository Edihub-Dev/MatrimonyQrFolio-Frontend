import { QrCode } from 'lucide-react';

export const DarkBanner = () => {
  return (
    <section className="bg-[#1a1115] py-12 border-y border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 max-w-3xl">
            <h4 className="text-xs font-bold tracking-widest text-gray-400 uppercase">Unique QR For Every Profile</h4>
            <h2 className="text-2xl md:text-3xl font-bold text-white">
              One scan. Complete story – biodata, photos & work portfolio.
            </h2>
            <p className="text-gray-400 text-sm md:text-base leading-relaxed">
              Every matrimony profile is backed by a QRfolio QR. Families can scan once and revisit the profile anytime – no more resharing PDFs, images, or long messages.
            </p>
            <p className="text-xs text-gray-500 pt-2">
              Powered by <span className="text-white font-semibold underline decoration-rose-500 decoration-2 underline-offset-2">QRfolio</span> – the smart digital portfolio & business card platform.
            </p>
          </div>
          
          <div className="flex-shrink-0">
            <div className="flex items-center gap-4 bg-gray-800/50 p-4 rounded-2xl border border-gray-700/50 backdrop-blur-sm">
              <div className="bg-white p-2 rounded-lg">
                <QrCode size={48} className="text-gray-900" />
              </div>
              <div className="text-xs text-gray-300 max-w-[160px]">
                Share your QR on invites, WhatsApp or at family meetings and let them explore the full profile instantly.
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

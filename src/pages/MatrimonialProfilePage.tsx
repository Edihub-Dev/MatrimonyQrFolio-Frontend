// import { Navbar } from '../components/Navbar';
// import { Footer } from '../components/Footer';
import React, { useState } from 'react';
import { MatrimonySidebar, type MatrimonyDashboardTab } from '../components/MatrimonySidebar';
import { MatrimonyDashboardOverview } from '../components/MatrimonyDashboardOverview';
import { MatrimonyOnboardingWizard } from '../components/MatrimonyOnboardingWizard';
import { MatrimonyGallerySection } from '../components/MatrimonyGallerySection';

const MatrimonyQrCodeSection: React.FC = () => {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-slate-50">My QR code</h2>
      <p className="text-sm text-slate-200">
        We will soon show a QR code for your public matrimony profile here. For now, you can use the
        &quot;View public profile&quot; button on the Dashboard tab together with your main QR Folio
        account to create printed or digital QR cards.
      </p>
    </div>
  );
};

const MatrimonyPublicProfileSection: React.FC = () => {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-slate-50">Public matrimony page</h2>
      <p className="text-sm text-slate-200">
        Use the &quot;View public profile&quot; button on the Dashboard tab to open your live public
        matrimony page. A richer preview of that page, including gallery and videos, will be added
        here soon.
      </p>
    </div>
  );
};

const MatrimonialProfilePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<MatrimonyDashboardTab>('dashboard');
  const [isEditingDetails, setIsEditingDetails] = useState(false);

  const qrFolioUrl =
    (import.meta as any)?.env?.VITE_QRFOLIO_URL || 'https://www.qrfolio.net/dashboard';

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-950 via-rose-900 to-black font-sans text-slate-50">
      {/* <Navbar /> */}
      <main className="py-6 sm:py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-300">
                Matrimony
              </p>
              <h1 className="mt-1 text-xl sm:text-2xl font-semibold text-white">
                Matrimony dashboard
              </h1>
            </div>
            <a
              href={qrFolioUrl}
              className="inline-flex items-center justify-center rounded-full border border-amber-500/40 bg-rose-950/70 px-4 py-2 text-xs font-semibold text-amber-50 hover:bg-rose-900 hover:border-amber-400 transition-colors"
            >
              Back to QR Folio Dashboard
            </a>
          </div>

          <div className="grid gap-6 lg:grid-cols-[260px,1fr] items-start">
            <MatrimonySidebar
              activeTab={activeTab}
              onTabChange={(tab) => {
                setActiveTab(tab);
                if (tab !== 'dashboard') {
                  setIsEditingDetails(false);
                }
              }}
              qrFolioUrl={qrFolioUrl}
            />

            <section className="rounded-3xl border border-amber-500/15 bg-gradient-to-br from-rose-950/85 via-rose-900/80 to-slate-950/80 p-4 sm:p-6 lg:p-8 shadow-xl shadow-rose-950/70 min-h-[60vh] backdrop-blur-sm">
              {activeTab === 'dashboard' &&
                (isEditingDetails ? (
                  <div className="max-w-3xl">
                    <MatrimonyOnboardingWizard />
                  </div>
                ) : (
                  <MatrimonyDashboardOverview
                    onEditProfile={() => {
                      setIsEditingDetails(true);
                    }}
                  />
                ))}
              {activeTab === 'qrcode' && <MatrimonyQrCodeSection />}
              {activeTab === 'gallery' && <MatrimonyGallerySection />}
              {activeTab === 'public' && <MatrimonyPublicProfileSection />}
            </section>
          </div>
        </div>
      </main>
      {/* <Footer /> */}
    </div>
  );
};

export default MatrimonialProfilePage;

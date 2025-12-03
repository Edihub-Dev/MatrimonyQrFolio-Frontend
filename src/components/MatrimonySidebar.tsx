import React, { useEffect, useState } from "react";
import {
  LayoutDashboard,
  QrCode,
  Image,
  Eye,
  ArrowLeft,
  Menu,
} from "lucide-react";

export type MatrimonyDashboardTab =
  | "dashboard"
  | "qrcode"
  | "gallery"
  | "public";

type MatrimonySidebarProps = {
  activeTab: MatrimonyDashboardTab;
  onTabChange: (tab: MatrimonyDashboardTab) => void;
  qrFolioUrl?: string;
};

const navItems: Array<{
  id: MatrimonyDashboardTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "qrcode", label: "My QR Code", icon: QrCode },
  { id: "gallery", label: "Gallery", icon: Image },
  { id: "public", label: "Public profile", icon: Eye },
];

export const MatrimonySidebar: React.FC<MatrimonySidebarProps> = ({
  activeTab,
  onTabChange,
  qrFolioUrl,
}) => {
  const [isMobile, setIsMobile] = useState(false);
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      setIsOpen(!mobile);
    };

    handleResize();
    window.addEventListener("resize", handleResize, { passive: true });
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const sidebar = (
    <div className="h-full w-64 bg-gradient-to-b from-rose-950 via-rose-900 to-black border-r border-amber-500/20 text-slate-50 flex flex-col shadow-xl shadow-rose-950/80">
      <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-300">
            Matrimony
          </p>
          <p className="text-lg font-bold text-amber-50">QR Folio</p>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onTabChange(item.id)}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors transition-transform duration-150 ${
                isActive
                  ? "bg-amber-500/15 text-amber-100 border border-amber-400/70 shadow shadow-amber-500/30 translate-x-0.5"
                  : "text-slate-300 hover:bg-rose-900/70 hover:text-amber-50 hover:translate-x-0.5"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {qrFolioUrl && (
        <div className="px-4 pb-4 pt-2 border-t border-white/10">
          <button
            type="button"
            onClick={() => {
              if (typeof window !== "undefined") {
                window.location.href = qrFolioUrl;
              }
            }}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-amber-500/30 bg-rose-950/80 px-3 py-2 text-xs font-semibold text-amber-50 hover:bg-rose-900 hover:border-amber-400 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to QR Folio</span>
          </button>
        </div>
      )}
    </div>
  );

  return (
    <>
      {isMobile && (
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="fixed top-4 left-4 z-40 inline-flex items-center justify-center rounded-full bg-rose-950/90 p-2 text-amber-50 shadow-lg shadow-rose-950/80 lg:hidden transition-transform duration-150 active:scale-95"
        >
          <Menu className="w-5 h-5" />
        </button>
      )}

      {isMobile ? (
        <div
          className={`fixed inset-0 z-30 flex transition-transform duration-300 ${
            isOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          {sidebar}
          <button
            type="button"
            aria-label="Close sidebar"
            onClick={() => setIsOpen(false)}
            className="flex-1 bg-black/40"
          />
        </div>
      ) : (
        <div className="hidden lg:block h-[calc(100vh-48px)] lg:h-[calc(100vh-80px)] sticky top-6 rounded-3xl overflow-hidden shadow-xl shadow-rose-950/70">
          {sidebar}
        </div>
      )}
    </>
  );
};

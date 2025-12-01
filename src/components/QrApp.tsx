export const QrApp = () => {
  return (
    <section className="py-16 bg-gradient-to-r from-orange-50 via-rose-50 to-orange-50" id="app">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white/90 border border-orange-100 rounded-3xl shadow-sm px-6 py-10 sm:px-10 flex flex-col md:flex-row items-center gap-8">
          <div className="flex-1 space-y-3 text-center md:text-left">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
              Use your profile QR anywhere.
            </h2>
            <p className="text-sm md:text-base text-gray-600 max-w-xl">
              Add it to visiting cards, wedding invites, or WhatsApp messages. Scan once, view the complete profile 
              – no attachments or heavy PDFs needed.
            </p>
          </div>
          <div className="flex-shrink-0 text-xs text-gray-500 text-center md:text-right max-w-xs">
            Perfect for family introductions, matchmaking events, and sharing profiles securely across cities & countries.
          </div>
        </div>
      </div>
    </section>
  );
};

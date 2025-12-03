// import { Navbar } from '../components/Navbar';
// import { Footer } from '../components/Footer';
import { PublicMatrimonyProfile } from '../components/PublicMatrimonyProfile';

const PublicMatrimonyProfilePage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-950 via-rose-900 to-amber-50 font-sans text-gray-900">
      {/* <Navbar /> */}
      <main className="py-10 sm:py-14">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <PublicMatrimonyProfile />
        </div>
      </main>
      {/* <Footer /> */}
    </div>
  );
};

export default PublicMatrimonyProfilePage;

import { useState } from 'react';
import { Menu, X, QrCode } from 'lucide-react';
import { Button } from './ui/Button';

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center gap-2 cursor-pointer">
            <div className="bg-gradient-to-br from-orange-400 to-rose-600 p-1.5 rounded-lg text-white">
              <QrCode size={24} />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-xl leading-none text-gray-900">QRfolio Matrimony</span>
              <span className="text-[10px] font-medium text-rose-600 tracking-wider uppercase">Scan. Connect. Commit.</span>
            </div>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <a href="#how-it-works" className="text-gray-600 hover:text-rose-600 font-medium transition-colors">How it works</a>
            <a href="#features" className="text-gray-600 hover:text-rose-600 font-medium transition-colors">Features</a>
            <a href="#plans" className="text-gray-600 hover:text-rose-600 font-medium transition-colors">Plans</a>
            <a href="#samples" className="text-gray-600 hover:text-rose-600 font-medium transition-colors">Sample Profiles</a>
            <a href="#profiles" className="text-gray-600 hover:text-rose-600 font-medium transition-colors">Profiles</a>
            <a href="#app" className="text-gray-600 hover:text-rose-600 font-medium transition-colors">QR App</a>
          </div>

          {/* Desktop Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <Button
              variant="outline"
              size="sm"
              className="border-rose-200 text-rose-700 hover:bg-rose-50"
              onClick={() => {
                document.getElementById('login')?.scrollIntoView({
                  behavior: 'smooth',
                  block: 'start',
                });
              }}
            >
              Login
            </Button>
            <Button
              variant="primary"
              size="sm"
              className="bg-gradient-to-r from-rose-500 to-red-600"
              onClick={() => {
                document.getElementById('login')?.scrollIntoView({
                  behavior: 'smooth',
                  block: 'start',
                });
              }}
            >
              Register Free
            </Button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button onClick={() => setIsOpen(!isOpen)} className="text-gray-600 hover:text-gray-900">
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 absolute w-full shadow-lg">
          <div className="px-4 pt-2 pb-6 space-y-2">
            <a href="#how-it-works" className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-rose-600 hover:bg-gray-50 rounded-md">How it works</a>
            <a href="#features" className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-rose-600 hover:bg-gray-50 rounded-md">Features</a>
            <a href="#plans" className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-rose-600 hover:bg-gray-50 rounded-md">Plans</a>
            <a href="#samples" className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-rose-600 hover:bg-gray-50 rounded-md">Sample Profiles</a>
            <a href="#profiles" className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-rose-600 hover:bg-gray-50 rounded-md">Profiles</a>
            <div className="pt-4 flex flex-col space-y-3">
              <Button
                variant="outline"
                className="w-full justify-center"
                onClick={() => {
                  document.getElementById('login')?.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start',
                  });
                  setIsOpen(false);
                }}
              >
                Login
              </Button>
              <Button
                variant="primary"
                className="w-full justify-center"
                onClick={() => {
                  document.getElementById('login')?.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start',
                  });
                  setIsOpen(false);
                }}
              >
                Register Free
              </Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

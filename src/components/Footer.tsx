import React from 'react';
import { QrCode } from 'lucide-react';
import { Button } from './ui/Button';

export const Footer = () => {
  return (
    <footer className="bg-gray-50 pt-20 pb-10 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* CTA Section */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to give your biodata a smart QR?</h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Start with a free profile. Upgrade later for advanced analytics, custom QR designs, and more media space via QRfolio.
          </p>
          <Button size="lg" className="bg-gradient-to-r from-rose-600 to-red-600 shadow-lg shadow-rose-200">Create My Free Profile</Button>
        </div>

        <hr className="border-gray-200 mb-10" />

        <div className="grid md:grid-cols-4 gap-8 mb-10">
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-rose-600 p-1 rounded-md text-white">
                <QrCode size={20} />
              </div>
              <span className="font-bold text-lg text-gray-900">QRfolio</span>
            </div>
            <p className="text-sm text-gray-500">
              Reinventing how profiles are shared in the modern world.
            </p>
          </div>
          
          <div>
            <h4 className="font-bold text-gray-900 mb-4">Platform</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><a href="#" className="hover:text-rose-600">About Us</a></li>
              <li><a href="#" className="hover:text-rose-600">Pricing</a></li>
              <li><a href="#" className="hover:text-rose-600">Success Stories</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-gray-900 mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><a href="#" className="hover:text-rose-600">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-rose-600">Terms of Service</a></li>
              <li><a href="#" className="hover:text-rose-600">Cookie Policy</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-gray-900 mb-4">Contact</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>support@qrfolio.com</li>
              <li>+91 98765 43210</li>
            </ul>
          </div>
        </div>

        <div className="text-center text-xs text-gray-400">
          © 2025 QRfolio Matrimony. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

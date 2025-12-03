import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import MatrimonialProfilePage from './pages/MatrimonialProfilePage';
import MatrimonyOnboardingPage from './pages/MatrimonyOnboardingPage';
import PublicMatrimonyProfilePage from './pages/PublicMatrimonyProfilePage';
import { PaymentCallback } from './components/PaymentCallback';
import { AuthProvider } from './context/AuthContext';

const getRootComponent = () => {
  if (typeof window === 'undefined') {
    return App;
  }

  const path = window.location.pathname || '/';

  if (path.startsWith('/payment/callback')) {
    return PaymentCallback;
  }

  if (path.startsWith('/matrimonial-profile')) {
    return MatrimonialProfilePage;
  }

  if (path.startsWith('/matrimony-onboarding')) {
    return MatrimonyOnboardingPage;
  }

  if (path.startsWith('/public-matrimony/')) {
    return PublicMatrimonyProfilePage;
  }

  return App;
};

const RootComponent = getRootComponent();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <RootComponent />
    </AuthProvider>
  </StrictMode>,
);

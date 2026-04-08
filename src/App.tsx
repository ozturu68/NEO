import { Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';
import i18next from './lib/i18n';
import { ErrorBoundary } from './components/layout/ErrorBoundary';
import { LoadingScreen } from './components/layout/LoadingScreen';
import { LoginScreen } from './components/auth/LoginScreen';
import { MainLayout } from './components/layout/MainLayout';

function App() {
  return (
    <I18nextProvider i18n={i18next}>
      <ErrorBoundary>
        <BrowserRouter>
          <Suspense fallback={<LoadingScreen />}>
            <Routes>
              <Route path="/login" element={<LoginScreen />} />
              <Route path="/*" element={<MainLayout />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </ErrorBoundary>
    </I18nextProvider>
  );
}

export default App;
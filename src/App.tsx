import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { MainLayout } from './components/layout/MainLayout';
import { Skeleton } from './components/ui';
import { AuthProvider } from './context/AuthContext';

// Lazy-load pages for better performance
const HomePage = lazy(() => import('./pages/HomePage'));
const EventsPage = lazy(() => import('./pages/EventsPage'));
const EventDetailPage = lazy(() => import('./pages/EventDetailPage'));
const EventRegisterPage = lazy(() => import('./pages/EventRegisterPage'));
const OrganizersPage = lazy(() => import('./pages/OrganizersPage'));
const CommunitiesPage = lazy(() => import('./pages/CommunitiesPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));

// Page loading fallback
const PageLoader: React.FC = () => (
  <div className="min-h-[60vh] flex flex-col gap-4 p-8 max-w-7xl mx-auto w-full">
    <Skeleton className="h-10 w-1/3" />
    <Skeleton className="h-5 w-2/3" />
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="h-56 rounded-xl" />
      ))}
    </div>
  </div>
);

const App: React.FC = () => {
  return (
    <HelmetProvider>
      <AuthProvider>
        <BrowserRouter>
          <Suspense fallback={<div className="min-h-screen"><PageLoader /></div>}>
            <Routes>
              {/* Login page — no layout wrapper */}
            <Route path="/login" element={<LoginPage />} />

            {/* All other pages use MainLayout */}
            <Route
              path="/"
              element={
                <MainLayout>
                  <Suspense fallback={<PageLoader />}>
                    <HomePage />
                  </Suspense>
                </MainLayout>
              }
            />
            <Route
              path="/events"
              element={
                <MainLayout>
                  <Suspense fallback={<PageLoader />}>
                    <EventsPage />
                  </Suspense>
                </MainLayout>
              }
            />
            <Route
              path="/events/:eventId"
              element={
                <MainLayout>
                  <Suspense fallback={<PageLoader />}>
                    <EventDetailPage />
                  </Suspense>
                </MainLayout>
              }
            />
            <Route
              path="/events/:eventId/register"
              element={
                <MainLayout>
                  <Suspense fallback={<PageLoader />}>
                    <EventRegisterPage />
                  </Suspense>
                </MainLayout>
              }
            />
            <Route
              path="/dashboard"
              element={
                <MainLayout>
                  <Suspense fallback={<PageLoader />}>
                    <DashboardPage />
                  </Suspense>
                </MainLayout>
              }
            />
            <Route
              path="/organizers"
              element={
                <MainLayout>
                  <Suspense fallback={<PageLoader />}>
                    <OrganizersPage />
                  </Suspense>
                </MainLayout>
              }
            />
            <Route
              path="/communities"
              element={
                <MainLayout>
                  <Suspense fallback={<PageLoader />}>
                    <CommunitiesPage />
                  </Suspense>
                </MainLayout>
              }
            />
            <Route
              path="/about"
              element={
                <MainLayout>
                  <Suspense fallback={<PageLoader />}>
                    <AboutPage />
                  </Suspense>
                </MainLayout>
              }
            />

            {/* 404 redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
    </HelmetProvider>
  );
};

export default App;

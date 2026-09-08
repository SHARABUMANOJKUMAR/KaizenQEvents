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
const PrivacyPolicyPage = lazy(() => import('./pages/PrivacyPolicyPage'));
const TermsOfServicePage = lazy(() => import('./pages/TermsOfServicePage'));

// Event Pass & Verification
const EventPassPage = lazy(() => import('./pages/EventPassPage').then(m => ({ default: m.EventPassPage })));
const VerifyPassPage = lazy(() => import('./pages/VerifyPassPage').then(m => ({ default: m.VerifyPassPage })));

// Admin pages
const AdminLoginPage = lazy(() => import('./pages/admin/AdminLoginPage'));
const AdminDashboardPage = lazy(() => import('./pages/admin/AdminDashboardPage'));
const AdminLoginsPage = lazy(() => import('./pages/admin/AdminLoginsPage'));
const AdminAnalyticsPage = lazy(() => import('./pages/admin/AdminAnalyticsPage'));
const AdminSettingsPage = lazy(() => import('./pages/admin/AdminSettingsPage'));
import { AdminBootcampPage } from './pages/admin/AdminBootcampPage';
import { GoogleSheetsService } from './services/googleSheetsService';

import { AdminRoute } from './components/admin/AdminRoute';
import { AdminAuthProvider } from './context/AdminAuthContext';

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
        <AdminAuthProvider>
        <BrowserRouter>
          <Suspense fallback={<div className="min-h-screen"><PageLoader /></div>}>
            <Routes>
              {/* Admin Routes */}
              <Route path="/admin/login" element={<AdminLoginPage />} />
              <Route path="/admin" element={<AdminRoute />}>
                <Route path="dashboard" element={<AdminDashboardPage />} />
                <Route index element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="logins" element={<AdminLoginsPage />} />
                <Route 
                  path="generative-ai" 
                  element={
                    <AdminBootcampPage 
                      title="Generative AI BootCamp" 
                      fetchData={GoogleSheetsService.getGenerativeAIRegistrations}
                      fileName="generative_ai_registrations.csv"
                    />
                  } 
                />
                <Route 
                  path="python-ai" 
                  element={
                    <AdminBootcampPage 
                      title="Python with AI BootCamp" 
                      fetchData={GoogleSheetsService.getPythonAIRegistrations}
                      fileName="python_ai_registrations.csv"
                    />
                  } 
                />
                <Route 
                  path="git-github" 
                  element={
                    <AdminBootcampPage 
                      title="Git & GitHub BootCamp" 
                      fetchData={GoogleSheetsService.getGitGithubRegistrations}
                      fileName="git_github_registrations.csv"
                    />
                  } 
                />
                <Route 
                  path="java-ai" 
                  element={
                    <AdminBootcampPage 
                      title="Java with AI BootCamp" 
                      fetchData={GoogleSheetsService.getJavaAIRegistrations}
                      fileName="java_ai_registrations.csv"
                    />
                  } 
                />
                <Route path="analytics" element={<AdminAnalyticsPage />} />
                <Route path="settings" element={<AdminSettingsPage />} />
                
              </Route>

              {/* Login page — no layout wrapper */}
              <Route path="/login" element={<LoginPage />} />

              {/* Event Pass & Verify — no layout wrapper */}
              <Route 
                path="/pass/:ticketId" 
                element={
                  <Suspense fallback={<PageLoader />}>
                    <EventPassPage />
                  </Suspense>
                } 
              />
              <Route 
                path="/verify/:ticketId" 
                element={
                  <Suspense fallback={<PageLoader />}>
                    <VerifyPassPage />
                  </Suspense>
                } 
              />

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
            <Route
              path="/privacy-policy"
              element={
                <MainLayout>
                  <Suspense fallback={<PageLoader />}>
                    <PrivacyPolicyPage />
                  </Suspense>
                </MainLayout>
              }
            />
            <Route
              path="/terms"
              element={
                <MainLayout>
                  <Suspense fallback={<PageLoader />}>
                    <TermsOfServicePage />
                  </Suspense>
                </MainLayout>
              }
            />

            {/* 404 redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
      </AdminAuthProvider>

    </AuthProvider>
    </HelmetProvider>
  );
};

export default App;

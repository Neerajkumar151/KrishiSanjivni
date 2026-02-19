// App.tsx
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { Spinner } from "./components/ui/spinner";
import ScrollToTop from "./components/ScrollToTop";
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import ReactGA from "react-ga4";
import Demo from "@/pages/Demo";

// Pages
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Tools from "./pages/Tools";
import Warehouse from "./pages/Warehouse";
import SoilCheck from "./pages/SoilCheck";
import Profile from "./pages/Profile";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";
import PaymentHistory from "./pages/PaymentHistory";
import Resources from "./pages/Resources";
import Weather from "./pages/Weather";
import MarketPrices from "./pages/MarketPrices";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import CookiePolicy from "./pages/CookiePolicy";
import TermsOfService from "./pages/TermsOfService";
import { CommunityPage } from "./pages/CommunityPage";
import { ChatPage } from "./pages/ChatPage";

// Admin Pages
import { AdminLayout } from "./pages/admin/AdminLayout";
import { AdminDashboard } from "./pages/admin/Dashboard";
import { AdminTools } from "./pages/admin/AdminTools";
import { AdminWarehouses } from "./pages/admin/AdminWarehouses";
import { AdminSoilChecks } from "./pages/admin/AdminSoilChecks";
import { AdminUsers } from "./pages/admin/AdminUsers";
import AdminToolBookings from "./pages/admin/AdminToolBookings";
import AdminWarehouseBookings from "./pages/admin/AdminWarehouseBookings";


// GA init (outside components)
// ReactGA.initialize('G-7G47RJNRSM');
const queryClient = new QueryClient();

// App Routes Component
const AppRoutes: React.FC = () => {
  const { loading } = useAuth();
  const location = useLocation();

  useEffect(()=> {
    ReactGA.initialize('G-7G47RJNRSM');
    ReactGA.send({ hitType: "pageview",
       page: window.location.pathname, 
       title: "App.tsx" });
  },[]);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Spinner size="large" />
      </div>
    );
  }


  return (
    <>
      {/* Scroll to top on route change */}
      <ScrollToTop />

      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Index />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/tools" element={<Tools />} />
        <Route path="/warehouse" element={<Warehouse />} />
        <Route path="/soil-check" element={<SoilCheck />} />
        <Route path="/community" element={<CommunityPage />} />
        <Route path="/community/chat" element={<ChatPage />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/resources" element={<Resources />} />
        <Route path="/demo" element={<Demo />} />
        <Route path="/weather" element={<Weather />} />
        <Route path="/market-prices" element={<MarketPrices />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms-of-service" element={<TermsOfService />} />
        <Route path="/cookie-policy" element={<CookiePolicy />} />

        {/* Protected Routes */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/payment-history"
          element={
            <ProtectedRoute>
              <PaymentHistory />
            </ProtectedRoute>
          }
        />

        {/* Admin Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute adminOnly={true}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="tools" element={<AdminTools />} />
          <Route path="warehouses" element={<AdminWarehouses />} />
          <Route path="soil-checks" element={<AdminSoilChecks />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="tool-bookings" element={<AdminToolBookings />} />
          <Route path="warehouse-bookings" element={<AdminWarehouseBookings />} />
        </Route>

        {/* 404 Page */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
};

// Main App Component
const App: React.FC = () => {
  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <AuthProvider>
            <Toaster />
            <Sonner />
            <AppRoutes />
          </AuthProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
};

export default App;

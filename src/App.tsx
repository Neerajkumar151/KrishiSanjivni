// App.tsx
import React, { lazy, Suspense } from "react";
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

// Only the landing page is eagerly loaded
import Index from "./pages/Index";

// Lazy-loaded pages
const Auth = lazy(() => import("./pages/Auth"));
const Tools = lazy(() => import("./pages/Tools"));
const Warehouse = lazy(() => import("./pages/Warehouse"));
const SoilCheck = lazy(() => import("./pages/SoilCheck"));
const Profile = lazy(() => import("./pages/Profile"));
const Contact = lazy(() => import("./pages/Contact"));
const NotFound = lazy(() => import("./pages/NotFound"));
const PaymentHistory = lazy(() => import("./pages/PaymentHistory"));
const Resources = lazy(() => import("./pages/Resources"));
const Weather = lazy(() => import("./pages/Weather"));
const MarketPrices = lazy(() => import("./pages/MarketPrices"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const CookiePolicy = lazy(() => import("./pages/CookiePolicy"));
const TermsOfService = lazy(() => import("./pages/TermsOfService"));
const CommunityPage = lazy(() => import("./pages/CommunityPage").then(m => ({ default: m.CommunityPage })));
const ChatPage = lazy(() => import("./pages/ChatPage").then(m => ({ default: m.ChatPage })));
const Demo = lazy(() => import("./pages/Demo"));

// Admin Pages (lazy)
const AdminLayout = lazy(() => import("./pages/admin/AdminLayout").then(m => ({ default: m.AdminLayout })));
const AdminDashboard = lazy(() => import("./pages/admin/Dashboard").then(m => ({ default: m.AdminDashboard })));
const AdminTools = lazy(() => import("./pages/admin/AdminTools").then(m => ({ default: m.AdminTools })));
const AdminWarehouses = lazy(() => import("./pages/admin/AdminWarehouses").then(m => ({ default: m.AdminWarehouses })));
const AdminSoilChecks = lazy(() => import("./pages/admin/AdminSoilChecks").then(m => ({ default: m.AdminSoilChecks })));
const AdminUsers = lazy(() => import("./pages/admin/AdminUsers").then(m => ({ default: m.AdminUsers })));
const AdminToolBookings = lazy(() => import("./pages/admin/AdminToolBookings"));
const AdminWarehouseBookings = lazy(() => import("./pages/admin/AdminWarehouseBookings"));
const AdminModerationAlerts = lazy(() => import("./pages/admin/AdminModerationAlerts").then(m => ({ default: m.AdminModerationAlerts })));
const AdminMessagesPage = lazy(() => import("./pages/admin/AdminMessagesPage").then(m => ({ default: m.AdminMessagesPage })));
const UserAdminChatPage = lazy(() => import("./pages/UserAdminChatPage").then(m => ({ default: m.UserAdminChatPage })));

const queryClient = new QueryClient();

// Route-level loading fallback
const RouteLoader = () => (
  <div className="flex h-screen w-full items-center justify-center">
    <Spinner size="large" />
  </div>
);

// App Routes Component
const AppRoutes: React.FC = () => {
  const { loading } = useAuth();
  const location = useLocation();

  // Lazy-load GA only when needed
  useEffect(() => {
    import("react-ga4").then((ReactGA) => {
      ReactGA.default.initialize('G-7G47RJNRSM');
      ReactGA.default.send({
        hitType: "pageview",
        page: window.location.pathname,
        title: "App.tsx"
      });
    });
  }, []);

  if (loading) {
    return <RouteLoader />;
  }

  return (
    <>
      <ScrollToTop />
      <Suspense fallback={<RouteLoader />}>
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
            element={<ProtectedRoute><Profile /></ProtectedRoute>}
          />
          <Route
            path="/payment-history"
            element={<ProtectedRoute><PaymentHistory /></ProtectedRoute>}
          />
          <Route
            path="/admin-chat"
            element={<ProtectedRoute><UserAdminChatPage /></ProtectedRoute>}
          />

          {/* Admin Routes */}
          <Route
            path="/admin"
            element={<ProtectedRoute adminOnly={true}><AdminLayout /></ProtectedRoute>}
          >
            <Route index element={<AdminDashboard />} />
            <Route path="tools" element={<AdminTools />} />
            <Route path="warehouses" element={<AdminWarehouses />} />
            <Route path="soil-checks" element={<AdminSoilChecks />} />
            <Route path="tool-bookings" element={<AdminToolBookings />} />
            <Route path="warehouse-bookings" element={<AdminWarehouseBookings />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="messages" element={<AdminMessagesPage />} />
            <Route path="moderation" element={<AdminModerationAlerts />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
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

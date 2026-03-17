import { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { supabase } from "./lib/supabase";
import { useAuthStore } from "./stores/authStore";
import { Navbar } from "./components/layout/Navbar";
import { DemoBanner } from "./components/layout/DemoBanner";
import { ProtectedRoute } from "./components/layout/ProtectedRoute";
import HomePage from "./pages/HomePage";
import BookingPage from "./pages/BookingPage";
import ConfirmationPage from "./pages/ConfirmationPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import AdminPage from "./pages/AdminPage";

function App() {
  const { setSession } = useAuthStore();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => subscription.unsubscribe();
  }, [setSession]);

  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            borderRadius: "12px",
            fontFamily: "Inter, system-ui, sans-serif",
            fontSize: "14px",
            fontWeight: 500,
            boxShadow: "0 4px 6px -2px rgb(0 0 0/0.05), 0 10px 30px -3px rgb(0 0 0/0.12)",
          },
        }}
      />
      <div className="min-h-screen bg-surface">
        <DemoBanner />
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/book" element={<BookingPage />} />
          <Route
            path="/confirmation/:id"
            element={
              <ProtectedRoute>
                <ConfirmationPage />
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          {/* Admin routes — nested via /* so AdminPage can use its own <Routes> */}
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute adminOnly>
                <AdminPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="*"
            element={
              <div className="text-center py-24">
                <h1 className="text-6xl font-black text-gray-200">404</h1>
                <p className="mt-3 text-gray-500 text-lg font-medium">Page not found</p>
              </div>
            }
          />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;

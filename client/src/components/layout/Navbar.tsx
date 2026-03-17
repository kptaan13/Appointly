import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Calendar, LayoutDashboard, LogOut, User, ChevronDown, Shield } from "lucide-react";
import { useAuthStore, getUserRole } from "../../stores/authStore";
import { apiLogout } from "../../api/auth.api";
import { Avatar } from "../ui/Avatar";
import { Button } from "../ui/Button";
import { cn } from "../../utils/cn";
import toast from "react-hot-toast";

export function Navbar() {
  const { user, clearAuth } = useAuthStore();
  const navigate = useNavigate();
  const role = getUserRole(user);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  async function handleLogout() {
    setMenuOpen(false);
    try { await apiLogout(); } catch { /* ignore */ }
    clearAuth();
    navigate("/login");
    toast.success("Logged out");
  }

  const name = user?.user_metadata?.name as string | undefined;
  const email = user?.email;

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-40 px-4">
      <div className="max-w-6xl mx-auto h-14 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 bg-primary-600 rounded-[10px] flex items-center justify-center shadow-sm group-hover:bg-primary-700 transition-colors">
            <Calendar size={16} className="text-white" />
          </div>
          <div className="leading-none">
            <span className="font-bold text-gray-900 text-[15px]">Appointly</span>
          </div>
        </Link>

        {/* Right */}
        <div className="flex items-center gap-2">
          {user ? (
            <>
              <Link
                to="/dashboard"
                className="hidden sm:flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 px-3 py-1.5 rounded-[8px] hover:bg-gray-100 transition-colors font-medium"
              >
                <LayoutDashboard size={15} />
                My Bookings
              </Link>
              {role === "admin" && (
                <Link
                  to="/admin"
                  className="hidden sm:flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 px-3 py-1.5 rounded-[8px] hover:bg-gray-100 transition-colors font-medium"
                >
                  <Shield size={15} />
                  Admin
                </Link>
              )}

              {/* Profile dropdown */}
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setMenuOpen((v) => !v)}
                  className={cn(
                    "flex items-center gap-2 pl-1 pr-2 py-1 rounded-[10px] border border-transparent",
                    "hover:bg-gray-100 hover:border-gray-200 transition-all",
                    menuOpen && "bg-gray-100 border-gray-200"
                  )}
                >
                  <Avatar name={name} email={email} size="sm" />
                  <span className="hidden sm:block text-sm font-medium text-gray-700 max-w-[100px] truncate">
                    {name ?? email}
                  </span>
                  <ChevronDown
                    size={14}
                    className={cn("text-gray-400 transition-transform hidden sm:block", menuOpen && "rotate-180")}
                  />
                </button>

                {menuOpen && (
                  <div className="absolute right-0 top-full mt-1.5 w-52 bg-white rounded-xl shadow-dropdown border border-gray-100 py-1.5 animate-slide-down z-50">
                    <div className="px-3 py-2 border-b border-gray-100 mb-1">
                      <p className="text-xs font-semibold text-gray-900 truncate">{name ?? "User"}</p>
                      <p className="text-xs text-gray-400 truncate">{email}</p>
                    </div>
                    <Link
                      to="/dashboard"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <LayoutDashboard size={14} className="text-gray-400" />
                      My Bookings
                    </Link>
                    {role === "admin" && (
                      <Link
                        to="/admin"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <Shield size={14} className="text-gray-400" />
                        Admin Panel
                      </Link>
                    )}
                    <div className="border-t border-gray-100 mt-1 pt-1">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut size={14} />
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost" size="sm">
                  <User size={14} />
                  Log in
                </Button>
              </Link>
              <Link to="/register">
                <Button size="sm">Get started</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

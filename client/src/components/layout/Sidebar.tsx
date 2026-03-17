import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Calendar,
  Users,
  BookOpen,
  BarChart2,
  Settings,
  CalendarDays,
} from "lucide-react";
import { cn } from "../../utils/cn";

interface NavItem {
  label: string;
  to: string;
  icon: React.ElementType;
  end?: boolean;
}

const navItems: NavItem[] = [
  { label: "Overview",  to: "/admin",          icon: LayoutDashboard, end: true },
  { label: "Bookings",  to: "/admin/bookings",  icon: BookOpen },
  { label: "Slots",     to: "/admin/slots",     icon: CalendarDays },
  { label: "Services",  to: "/admin/services",  icon: Calendar },
  { label: "Customers", to: "/admin/customers", icon: Users },
  { label: "Analytics", to: "/admin/analytics", icon: BarChart2 },
];

export function Sidebar() {
  return (
    <aside className="hidden lg:flex flex-col w-56 bg-white border-r border-gray-100 min-h-screen sticky top-0">
      <div className="flex-1 py-6 px-3 space-y-0.5">
        <p className="px-3 text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-3">
          Management
        </p>
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              cn(
                "nav-item",
                isActive && "active"
              )
            }
          >
            {({ isActive }) => (
              <>
                <item.icon
                  size={16}
                  className={cn(
                    "shrink-0",
                    isActive ? "text-primary-600" : "text-gray-400"
                  )}
                />
                {item.label}
              </>
            )}
          </NavLink>
        ))}
      </div>

      <div className="px-3 pb-5 border-t border-gray-100 pt-4">
        <NavLink
          to="/admin/settings"
          className={({ isActive }) => cn("nav-item", isActive && "active")}
        >
          {({ isActive }) => (
            <>
              <Settings size={16} className={cn("shrink-0", isActive ? "text-primary-600" : "text-gray-400")} />
              Settings
            </>
          )}
        </NavLink>
      </div>
    </aside>
  );
}

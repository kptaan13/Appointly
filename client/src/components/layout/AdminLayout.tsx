import type { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { useAuthStore } from "../../stores/authStore";
import { Avatar } from "../ui/Avatar";
import { Shield } from "lucide-react";

interface AdminLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
}

export function AdminLayout({ children, title, subtitle }: AdminLayoutProps) {
  const { user } = useAuthStore();
  const name = user?.user_metadata?.name as string | undefined;

  return (
    <div className="flex min-h-[calc(100vh-60px)]">
      <Sidebar />
      <div className="flex-1 min-w-0">
        {/* Page header */}
        <div className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">{title}</h1>
            {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 bg-primary-50 text-primary-700 px-2.5 py-1 rounded-full text-xs font-semibold">
              <Shield size={11} />
              Admin
            </div>
            <Avatar name={name} email={user?.email} size="sm" />
          </div>
        </div>
        {/* Content */}
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

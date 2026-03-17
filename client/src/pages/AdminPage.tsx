import { useEffect, useState } from "react";
import { useCountUp } from "../hooks/useCountUp";
import { Routes, Route, Navigate } from "react-router-dom";
import {
  TrendingUp,
  BookOpen,
  Users,
  Calendar,
  DollarSign,
  ChevronRight,
  Search,
  Filter,
  Plus,
  AlertCircle,
} from "lucide-react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line, Doughnut } from "react-chartjs-2";
import { supabase } from "../lib/supabase";
import { AdminLayout } from "../components/layout/AdminLayout";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Spinner } from "../components/ui/Spinner";
import { Avatar } from "../components/ui/Avatar";
import { apiGetAllBookings, apiUpdateBookingStatus } from "../api/bookings.api";
import { apiGetServices } from "../api/services.api";
import { apiCreateSlot, apiToggleSlotBlock, apiGetAdminSlots } from "../api/slots.api";
import { formatDateTime } from "../utils/dates";
import type { Booking, Service, Slot } from "../types";
import toast from "react-hot-toast";

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, ArcElement, Title, Tooltip, Legend, Filler
);

// ─── Shared stat card with count-up ──────────────────────────────────────────
function StatCard({
  label, value, icon: Icon, trend, color, prefix = "", barColor,
}: {
  label: string;
  value: number;
  icon: React.ElementType;
  trend?: string;
  color: string;
  prefix?: string;
  barColor?: string;
}) {
  const animated = useCountUp(value, 1400);

  return (
    <div className="card p-5 overflow-hidden relative">
      {/* subtle shimmer bar at bottom */}
      {barColor && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-100">
          <div
            className={`h-full ${barColor} transition-all duration-[1400ms] ease-out`}
            style={{ width: value > 0 ? "100%" : "0%" }}
          />
        </div>
      )}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{label}</p>
          <p className="text-3xl font-black text-gray-900 mt-1 tabular-nums">
            {prefix}{animated.toLocaleString()}
          </p>
          {trend && (
            <p className="text-xs text-emerald-600 font-medium mt-1 flex items-center gap-1">
              <TrendingUp size={11} /> {trend}
            </p>
          )}
        </div>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
          <Icon size={18} />
        </div>
      </div>
    </div>
  );
}

// ─── Overview (Dashboard) ─────────────────────────────────────────────────────
function OverviewTab() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGetAllBookings({})
      .then(setBookings)
      .catch(() => toast.error("Failed to load bookings"))
      .finally(() => setLoading(false));
  }, []);

  const confirmed = bookings.filter((b) => b.status === "confirmed").length;
  const completed = bookings.filter((b) => b.status === "completed").length;
  const cancelled = bookings.filter((b) => b.status === "cancelled").length;
  const total = bookings.length;

  // Last 7 days bookings grouped by day
  const now = new Date();
  const dayLabels = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now);
    d.setDate(d.getDate() - (6 - i));
    return d.toLocaleDateString("en-US", { weekday: "short" });
  });
  const dayCounts = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now);
    d.setDate(d.getDate() - (6 - i));
    const key = d.toISOString().slice(0, 10);
    return bookings.filter((b) => b.slot_starts_at?.slice(0, 10) === key).length;
  });

  const lineData = {
    labels: dayLabels,
    datasets: [
      {
        label: "Bookings",
        data: dayCounts,
        borderColor: "#2563eb",
        backgroundColor: "rgba(37,99,235,0.08)",
        borderWidth: 2,
        pointRadius: 4,
        pointBackgroundColor: "#2563eb",
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const donutData = {
    labels: ["Confirmed", "Completed", "Cancelled"],
    datasets: [
      {
        data: [confirmed, completed, cancelled],
        backgroundColor: ["#10b981", "#3b82f6", "#d1d5db"],
        borderWidth: 0,
        hoverOffset: 4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    animation: {
      duration: 1000,
      easing: "easeOutQuart" as const,
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#1e293b",
        titleFont: { size: 12, weight: "bold" as const },
        bodyFont: { size: 11 },
        padding: 10,
        cornerRadius: 8,
      },
    },
    scales: {
      x: { grid: { display: false }, ticks: { font: { size: 11 }, color: "#94a3b8" } },
      y: {
        beginAtZero: true,
        ticks: { stepSize: 1, font: { size: 11 }, color: "#94a3b8" },
        grid: { color: "#f1f5f9" },
      },
    },
  };

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Bookings" value={total}           icon={BookOpen}    color="bg-primary-50 text-primary-600" trend="+12% this week"  barColor="bg-primary-500" />
        <StatCard label="Confirmed"      value={confirmed}       icon={Calendar}    color="bg-emerald-50 text-emerald-600"                           barColor="bg-emerald-400" />
        <StatCard label="Completed"      value={completed}       icon={Users}       color="bg-blue-50 text-blue-600"                                 barColor="bg-blue-400" />
        <StatCard label="Revenue Est."   value={completed * 65}  icon={DollarSign}  color="bg-violet-50 text-violet-600" trend="+8% this month"      barColor="bg-violet-400" prefix="$" />
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="card p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-gray-900">Bookings — Last 7 Days</h3>
              <p className="text-xs text-gray-400 mt-0.5">Daily booking volume</p>
            </div>
          </div>
          <Line data={lineData} options={chartOptions} height={100} />
        </div>

        <div className="card p-5">
          <h3 className="font-semibold text-gray-900 mb-1">Status Breakdown</h3>
          <p className="text-xs text-gray-400 mb-4">All-time distribution</p>
          {total > 0 ? (
            <>
              <Doughnut
                data={donutData}
                options={{ responsive: true, plugins: { legend: { position: "bottom", labels: { font: { size: 11 }, boxWidth: 10 } } }, cutout: "65%" }}
                height={160}
              />
            </>
          ) : (
            <div className="text-center py-8 text-gray-400 text-sm">No data yet</div>
          )}
        </div>
      </div>

      {/* Recent bookings */}
      <div className="card">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">Recent Bookings</h3>
          <button
            onClick={() => {}}
            className="text-xs text-primary-600 font-semibold hover:underline flex items-center gap-1"
          >
            View all <ChevronRight size={12} />
          </button>
        </div>
        <div className="divide-y divide-gray-50">
          {bookings.slice(0, 6).map((b) => (
            <div key={b.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50/50 transition-colors">
              <Avatar name={b.user_name} email={b.user_email} size="sm" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{b.user_name || b.user_email}</p>
                <p className="text-xs text-gray-400 truncate">{b.service_name} · {formatDateTime(b.slot_starts_at)}</p>
              </div>
              <Badge status={b.status} />
            </div>
          ))}
          {bookings.length === 0 && (
            <div className="text-center py-10 text-gray-400 text-sm">No bookings found</div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Bookings Tab ─────────────────────────────────────────────────────────────
function BookingsTab() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [search, setSearch] = useState("");

  function load() {
    setLoading(true);
    apiGetAllBookings({ status: statusFilter || undefined, date: dateFilter || undefined })
      .then(setBookings)
      .catch(() => toast.error("Failed to load bookings"))
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, [statusFilter, dateFilter]); // eslint-disable-line

  async function handleStatusChange(id: string, status: "confirmed" | "cancelled" | "completed") {
    try {
      const updated = await apiUpdateBookingStatus(id, status);
      setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, ...updated } : b)));
      toast.success("Status updated");
    } catch {
      toast.error("Failed to update status");
    }
  }

  const filtered = search
    ? bookings.filter(
        (b) =>
          b.user_name?.toLowerCase().includes(search.toLowerCase()) ||
          b.user_email?.toLowerCase().includes(search.toLowerCase()) ||
          b.service_name?.toLowerCase().includes(search.toLowerCase())
      )
    : bookings;

  return (
    <div className="card">
      {/* Toolbar */}
      <div className="px-5 py-4 border-b border-gray-100 flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-[180px]">
          <Input
            placeholder="Search customer or service…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search size={14} />}
          />
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Filter size={14} className="text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-[10px] border border-gray-200 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 h-[42px]"
          >
            <option value="">All statuses</option>
            <option value="confirmed">Confirmed</option>
            <option value="cancelled">Cancelled</option>
            <option value="completed">Completed</option>
          </select>
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="rounded-[10px] border border-gray-200 px-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 h-[42px]"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner size="lg" />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left">
                <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Reference</th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Customer</th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Service</th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Date &amp; Time</th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((b) => (
                <tr key={b.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-3.5">
                    <span className="font-mono text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                      #{b.id.slice(0, 8).toUpperCase()}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <Avatar name={b.user_name} email={b.user_email} size="sm" />
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{b.user_name || "—"}</p>
                        <p className="text-xs text-gray-400">{b.user_email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 font-medium text-gray-700">{b.service_name}</td>
                  <td className="px-5 py-3.5 whitespace-nowrap text-gray-600">{formatDateTime(b.slot_starts_at)}</td>
                  <td className="px-5 py-3.5"><Badge status={b.status} /></td>
                  <td className="px-5 py-3.5">
                    <select
                      value={b.status}
                      onChange={(e) =>
                        handleStatusChange(b.id, e.target.value as "confirmed" | "cancelled" | "completed")
                      }
                      className="rounded-lg border border-gray-200 px-2 py-1 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-primary-500"
                    >
                      <option value="confirmed">Confirmed</option>
                      <option value="cancelled">Cancelled</option>
                      <option value="completed">Completed</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-12">
              <AlertCircle size={32} className="text-gray-300 mx-auto mb-2" />
              <p className="text-gray-400 text-sm">No bookings found.</p>
            </div>
          )}
        </div>
      )}

      {filtered.length > 0 && (
        <div className="px-5 py-3 border-t border-gray-100 text-xs text-gray-400">
          Showing {filtered.length} booking{filtered.length !== 1 ? "s" : ""}
        </div>
      )}
    </div>
  );
}

// ─── Slots Tab ────────────────────────────────────────────────────────────────
function SlotsTab() {
  const [services, setServices] = useState<Service[]>([]);
  const [selectedServiceId, setSelectedServiceId] = useState("");
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [form, setForm] = useState({ starts_at: "", ends_at: "", capacity: 1 });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    apiGetServices().then((s) => {
      setServices(s);
      if (s.length > 0) setSelectedServiceId(s[0].id);
    });
  }, []);

  useEffect(() => {
    if (!selectedServiceId) return;
    setLoadingSlots(true);
    apiGetAdminSlots(selectedServiceId)
      .then(setSlots)
      .catch(() => toast.error("Failed to load slots"))
      .finally(() => setLoadingSlots(false));
  }, [selectedServiceId]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!form.starts_at || !form.ends_at) {
      toast.error("Please fill in start and end times");
      return;
    }
    setCreating(true);
    try {
      const slot = await apiCreateSlot({
        service_id: selectedServiceId,
        starts_at: new Date(form.starts_at).toISOString(),
        ends_at: new Date(form.ends_at).toISOString(),
        capacity: form.capacity,
      });
      setSlots((prev) => [...prev, slot]);
      setForm({ starts_at: "", ends_at: "", capacity: 1 });
      toast.success("Slot created");
    } catch {
      toast.error("Failed to create slot");
    } finally {
      setCreating(false);
    }
  }

  async function handleToggleBlock(slot: Slot) {
    try {
      const updated = await apiToggleSlotBlock(slot.id, !slot.is_blocked);
      setSlots((prev) => prev.map((s) => (s.id === slot.id ? { ...s, ...updated } : s)));
      toast.success(updated.is_blocked ? "Slot blocked" : "Slot unblocked");
    } catch {
      toast.error("Failed to update slot");
    }
  }

  return (
    <div className="grid lg:grid-cols-5 gap-6">
      {/* Create form */}
      <div className="lg:col-span-2">
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 bg-primary-50 text-primary-600 rounded-lg flex items-center justify-center">
              <Plus size={16} />
            </div>
            <h3 className="font-semibold text-gray-900">Create Slot</h3>
          </div>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Service</label>
              <select
                value={selectedServiceId}
                onChange={(e) => setSelectedServiceId(e.target.value)}
                className="w-full rounded-[10px] border border-gray-200 px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 h-[42px]"
              >
                {services.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
            <Input
              id="starts_at"
              type="datetime-local"
              label="Starts at"
              value={form.starts_at}
              onChange={(e) => setForm({ ...form, starts_at: e.target.value })}
            />
            <Input
              id="ends_at"
              type="datetime-local"
              label="Ends at"
              value={form.ends_at}
              onChange={(e) => setForm({ ...form, ends_at: e.target.value })}
            />
            <Input
              id="capacity"
              type="number"
              label="Capacity"
              min={1}
              value={form.capacity}
              onChange={(e) => setForm({ ...form, capacity: parseInt(e.target.value) })}
            />
            <Button type="submit" loading={creating} className="w-full">
              <Plus size={14} />
              Create Slot
            </Button>
          </form>
        </div>
      </div>

      {/* Slots list */}
      <div className="lg:col-span-3">
        <div className="card">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900">Upcoming Slots</h3>
            {loadingSlots && <Spinner size="sm" />}
          </div>
          {!loadingSlots && slots.length === 0 ? (
            <div className="text-center py-12 text-gray-400 text-sm">
              <Calendar size={32} className="mx-auto mb-2 text-gray-200" />
              No slots yet. Create one to get started.
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {slots.map((slot) => (
                <div
                  key={slot.id}
                  className={`flex items-center justify-between px-5 py-3.5 hover:bg-gray-50/50 transition-colors ${
                    slot.is_blocked ? "bg-red-50/40" : ""
                  }`}
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {formatDateTime(slot.starts_at)}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Capacity: {slot.capacity}
                      {slot.is_blocked && (
                        <span className="ml-2 text-red-500 font-semibold">Blocked</span>
                      )}
                    </p>
                  </div>
                  <Button
                    variant={slot.is_blocked ? "secondary" : "danger"}
                    size="sm"
                    onClick={() => handleToggleBlock(slot)}
                  >
                    {slot.is_blocked ? "Unblock" : "Block"}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Services Tab ─────────────────────────────────────────────────────────────
interface ServiceStat {
  service_id: string;
  service_name: string;
  total: number;
  confirmed: number;
  completed: number;
  cancelled: number;
  price: number;
}

function ServicesTab() {
  const [stats, setStats] = useState<ServiceStat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.resolve(supabase.rpc("get_service_stats"))
      .then(({ data, error }) => {
        if (error) throw error;
        setStats(data as ServiceStat[]);
      })
      .catch(() => toast.error("Failed to load services"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-24"><Spinner size="lg" /></div>;

  return (
    <div className="space-y-4">
      {/* Summary bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Services", value: stats.length, color: "text-primary-600", bg: "bg-primary-50" },
          { label: "Total Bookings", value: stats.reduce((s, r) => s + Number(r.total), 0), color: "text-gray-900", bg: "bg-gray-50" },
          { label: "Completed", value: stats.reduce((s, r) => s + Number(r.completed), 0), color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Cancelled", value: stats.reduce((s, r) => s + Number(r.cancelled), 0), color: "text-red-500", bg: "bg-red-50" },
        ].map((s) => (
          <div key={s.label} className={`card p-4 ${s.bg}`}>
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{s.label}</p>
            <p className={`text-2xl font-black mt-1 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">Service Performance</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left">
                {["Service", "Price", "Total", "Confirmed", "Completed", "Cancelled", "Fill Rate"].map((h) => (
                  <th key={h} className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {stats.map((s) => {
                const fillRate = s.total > 0 ? Math.round((s.completed / s.total) * 100) : 0;
                return (
                  <tr key={s.service_id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-3.5 font-medium text-gray-900">{s.service_name}</td>
                    <td className="px-5 py-3.5 text-gray-600">${Number(s.price).toFixed(2)}</td>
                    <td className="px-5 py-3.5 font-semibold">{Number(s.total)}</td>
                    <td className="px-5 py-3.5 text-emerald-600">{Number(s.confirmed)}</td>
                    <td className="px-5 py-3.5 text-blue-600">{Number(s.completed)}</td>
                    <td className="px-5 py-3.5 text-gray-400">{Number(s.cancelled)}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden w-20">
                          <div
                            className="h-full bg-primary-500 rounded-full transition-all duration-700"
                            style={{ width: `${fillRate}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-500 tabular-nums">{fillRate}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {stats.length === 0 && (
            <div className="text-center py-12 text-gray-400 text-sm">No services found.</div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Customers Tab ────────────────────────────────────────────────────────────
interface CustomerRow {
  id: string;
  email: string;
  name: string;
  role: string;
  created_at: string;
  total_bookings: number;
  confirmed_bookings: number;
  last_booking_at: string | null;
}

function CustomersTab() {
  const [customers, setCustomers] = useState<CustomerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    Promise.resolve(supabase.rpc("get_all_customers"))
      .then(({ data, error }) => {
        if (error) throw error;
        setCustomers(data as CustomerRow[]);
      })
      .catch(() => toast.error("Failed to load customers"))
      .finally(() => setLoading(false));
  }, []);

  const filtered = search
    ? customers.filter(
        (c) =>
          c.name?.toLowerCase().includes(search.toLowerCase()) ||
          c.email?.toLowerCase().includes(search.toLowerCase())
      )
    : customers;

  if (loading) return <div className="flex justify-center py-24"><Spinner size="lg" /></div>;

  return (
    <div className="card overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-3">
        <div className="flex-1">
          <Input
            placeholder="Search by name or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search size={14} />}
          />
        </div>
        <span className="text-sm text-gray-400 shrink-0">{filtered.length} customers</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-left">
              {["Customer", "Role", "Bookings", "Active", "Last Booking", "Joined"].map((h) => (
                <th key={h} className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.map((c) => (
              <tr key={c.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-2.5">
                    <Avatar name={c.name} email={c.email} size="sm" />
                    <div>
                      <p className="font-medium text-gray-900">{c.name}</p>
                      <p className="text-xs text-gray-400">{c.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3.5">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                    c.role === "admin"
                      ? "bg-violet-100 text-violet-700"
                      : "bg-gray-100 text-gray-600"
                  }`}>
                    {c.role}
                  </span>
                </td>
                <td className="px-5 py-3.5 font-semibold text-gray-900">{Number(c.total_bookings)}</td>
                <td className="px-5 py-3.5 text-emerald-600">{Number(c.confirmed_bookings)}</td>
                <td className="px-5 py-3.5 text-gray-500 text-xs">
                  {c.last_booking_at
                    ? new Date(c.last_booking_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                    : "—"}
                </td>
                <td className="px-5 py-3.5 text-gray-400 text-xs">
                  {new Date(c.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="text-center py-12 text-gray-400 text-sm">No customers found.</div>
        )}
      </div>
    </div>
  );
}

// ─── Analytics Tab ────────────────────────────────────────────────────────────
interface AnalyticsRow { day: string; total: number; confirmed: number; completed: number; cancelled: number; }

function AnalyticsTab() {
  const [rows, setRows] = useState<AnalyticsRow[]>([]);
  const [serviceStats, setServiceStats] = useState<ServiceStat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      supabase.rpc("get_analytics"),
      supabase.rpc("get_service_stats"),
    ]).then(([analytics, services]) => {
      if (analytics.error) throw analytics.error;
      if (services.error) throw services.error;
      setRows(analytics.data as AnalyticsRow[]);
      setServiceStats(services.data as ServiceStat[]);
    })
      .catch(() => toast.error("Failed to load analytics"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-24"><Spinner size="lg" /></div>;

  const labels = rows.map((r) =>
    new Date(r.day).toLocaleDateString("en-US", { month: "short", day: "numeric" })
  );

  const lineData = {
    labels,
    datasets: [
      {
        label: "Confirmed",
        data: rows.map((r) => Number(r.confirmed)),
        borderColor: "#10b981",
        backgroundColor: "rgba(16,185,129,0.08)",
        fill: true,
        tension: 0.4,
        borderWidth: 2,
        pointRadius: 3,
        pointBackgroundColor: "#10b981",
      },
      {
        label: "Completed",
        data: rows.map((r) => Number(r.completed)),
        borderColor: "#3b82f6",
        backgroundColor: "rgba(59,130,246,0.06)",
        fill: true,
        tension: 0.4,
        borderWidth: 2,
        pointRadius: 3,
        pointBackgroundColor: "#3b82f6",
      },
      {
        label: "Cancelled",
        data: rows.map((r) => Number(r.cancelled)),
        borderColor: "#e5e7eb",
        backgroundColor: "transparent",
        fill: false,
        tension: 0.4,
        borderWidth: 2,
        pointRadius: 3,
        pointBackgroundColor: "#e5e7eb",
        borderDash: [4, 4],
      },
    ],
  };

  const topServices = [...serviceStats].sort((a, b) => Number(b.total) - Number(a.total)).slice(0, 5);
  const maxBookings = Math.max(...topServices.map((s) => Number(s.total)), 1);

  const barColors = ["bg-primary-500", "bg-primary-400", "bg-primary-300", "bg-primary-200", "bg-primary-100"];

  return (
    <div className="space-y-6">
      {/* Line chart — 30-day trend */}
      <div className="card p-5">
        <h3 className="font-semibold text-gray-900 mb-1">30-Day Booking Trend</h3>
        <p className="text-xs text-gray-400 mb-5">Daily breakdown by status</p>
        {rows.length > 0 ? (
          <Line
            data={lineData}
            options={{
              responsive: true,
              animation: { duration: 1000, easing: "easeOutQuart" },
              plugins: {
                legend: { position: "top", labels: { font: { size: 11 }, boxWidth: 10, usePointStyle: true } },
                tooltip: { backgroundColor: "#1e293b", titleFont: { size: 12 }, bodyFont: { size: 11 }, padding: 10, cornerRadius: 8 },
              },
              scales: {
                x: { grid: { display: false }, ticks: { font: { size: 10 }, color: "#94a3b8", maxTicksLimit: 10 } },
                y: { beginAtZero: true, ticks: { stepSize: 1, font: { size: 11 }, color: "#94a3b8" }, grid: { color: "#f1f5f9" } },
              },
            }}
            height={80}
          />
        ) : (
          <div className="text-center py-12 text-gray-400 text-sm">No booking data in the last 30 days.</div>
        )}
      </div>

      {/* Top services */}
      <div className="card p-5">
        <h3 className="font-semibold text-gray-900 mb-1">Top Services by Bookings</h3>
        <p className="text-xs text-gray-400 mb-5">All-time ranking</p>
        <div className="space-y-4">
          {topServices.map((s, i) => {
            const pct = Math.round((Number(s.total) / maxBookings) * 100);
            return (
              <div key={s.service_id}>
                <div className="flex items-center justify-between text-sm mb-1.5">
                  <span className="font-medium text-gray-800">{s.service_name}</span>
                  <span className="text-gray-500 tabular-nums">{Number(s.total)} bookings</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${barColors[i]} rounded-full transition-all duration-700`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
          {topServices.length === 0 && (
            <div className="text-center py-8 text-gray-400 text-sm">No data yet.</div>
          )}
        </div>
      </div>

      {/* Revenue estimate per service */}
      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">Revenue Estimate by Service</h3>
          <p className="text-xs text-gray-400 mt-0.5">Based on completed bookings × service price</p>
        </div>
        <div className="divide-y divide-gray-50">
          {serviceStats.map((s) => {
            const rev = Number(s.completed) * Number(s.price);
            return (
              <div key={s.service_id} className="flex items-center justify-between px-5 py-3.5 hover:bg-gray-50/50 transition-colors">
                <div>
                  <p className="font-medium text-gray-900 text-sm">{s.service_name}</p>
                  <p className="text-xs text-gray-400">{Number(s.completed)} completed · ${Number(s.price).toFixed(2)} each</p>
                </div>
                <p className="font-bold text-gray-900">${rev.toLocaleString("en-US", { minimumFractionDigits: 2 })}</p>
              </div>
            );
          })}
        </div>
        <div className="px-5 py-3.5 bg-gray-50 border-t border-gray-100 flex justify-between">
          <span className="font-semibold text-gray-700 text-sm">Total</span>
          <span className="font-black text-gray-900">
            ${serviceStats
              .reduce((sum, s) => sum + Number(s.completed) * Number(s.price), 0)
              .toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Root admin router ────────────────────────────────────────────────────────
export default function AdminPage() {
  return (
    <Routes>
      <Route
        index
        element={
          <AdminLayout title="Dashboard" subtitle="Overview of your salon operations">
            <OverviewTab />
          </AdminLayout>
        }
      />
      <Route
        path="bookings"
        element={
          <AdminLayout title="Bookings" subtitle="Manage all customer appointments">
            <BookingsTab />
          </AdminLayout>
        }
      />
      <Route
        path="slots"
        element={
          <AdminLayout title="Time Slots" subtitle="Create and manage available appointment slots">
            <SlotsTab />
          </AdminLayout>
        }
      />
      <Route
        path="services"
        element={
          <AdminLayout title="Services" subtitle="Performance breakdown by service">
            <ServicesTab />
          </AdminLayout>
        }
      />
      <Route
        path="customers"
        element={
          <AdminLayout title="Customers" subtitle="All registered users and their booking history">
            <CustomersTab />
          </AdminLayout>
        }
      />
      <Route
        path="analytics"
        element={
          <AdminLayout title="Analytics" subtitle="Trends, revenue estimates, and service rankings">
            <AnalyticsTab />
          </AdminLayout>
        }
      />
      <Route path="*" element={<Navigate to="/admin" replace />} />
    </Routes>
  );
}

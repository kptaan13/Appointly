import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Calendar, CheckCircle, XCircle, Clock, ChevronRight } from "lucide-react";
import { apiGetMyBookings, apiCancelBooking } from "../api/bookings.api";
import { useAuthStore } from "../stores/authStore";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Spinner } from "../components/ui/Spinner";
import { Avatar } from "../components/ui/Avatar";
import { formatDateTime } from "../utils/dates";
import type { Booking } from "../types";
import toast from "react-hot-toast";

function StatCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: number;
  icon: React.ElementType;
  color: string;
}) {
  return (
    <div className="card p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-500 font-medium">{label}</p>
          <p className={`text-2xl font-black mt-0.5 ${color}`}>{value}</p>
        </div>
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${color} bg-current/10`}>
          <Icon size={16} className={color} />
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState<string | null>(null);

  useEffect(() => {
    apiGetMyBookings()
      .then(setBookings)
      .catch(() => toast.error("Failed to load bookings"))
      .finally(() => setLoading(false));
  }, []);

  const name = user?.user_metadata?.name as string | undefined;
  const confirmed = bookings.filter((b) => b.status === "confirmed").length;
  const completed = bookings.filter((b) => b.status === "completed").length;
  const cancelled = bookings.filter((b) => b.status === "cancelled").length;

  async function handleCancel(id: string) {
    if (!confirm("Cancel this booking?")) return;
    setCancelling(id);
    try {
      const updated = await apiCancelBooking(id);
      setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, ...updated } : b)));
      toast.success("Booking cancelled");
    } catch {
      toast.error("Failed to cancel booking");
    } finally {
      setCancelling(null);
    }
  }

  return (
    <div className="bg-surface min-h-screen">
      <div className="max-w-3xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Avatar name={name} email={user?.email} size="lg" />
            <div>
              <h1 className="text-xl font-black text-gray-900">
                {name ? `Hey, ${name.split(" ")[0]} 👋` : "My Bookings"}
              </h1>
              <p className="text-sm text-gray-500">{user?.email}</p>
            </div>
          </div>
          <Link to="/">
            <Button size="sm">
              <Plus size={14} />
              New Booking
            </Button>
          </Link>
        </div>

        {/* Stats */}
        {!loading && bookings.length > 0 && (
          <div className="grid grid-cols-3 gap-3 mb-8">
            <StatCard label="Upcoming"  value={confirmed} icon={Calendar}      color="text-emerald-600" />
            <StatCard label="Completed" value={completed} icon={CheckCircle}   color="text-blue-600" />
            <StatCard label="Cancelled" value={cancelled} icon={XCircle}       color="text-gray-400" />
          </div>
        )}

        {/* Bookings */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Spinner size="lg" />
          </div>
        ) : bookings.length === 0 ? (
          <div className="card p-12 text-center">
            <div className="w-14 h-14 bg-primary-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Calendar size={24} className="text-primary-600" />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">No bookings yet</h3>
            <p className="text-gray-500 text-sm mb-5">Book your first appointment today</p>
            <Link to="/">
              <Button>Browse services</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Upcoming */}
            {confirmed > 0 && (
              <section>
                <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 bg-emerald-400 rounded-full" />
                  Upcoming
                </h2>
                <div className="space-y-3">
                  {bookings
                    .filter((b) => b.status === "confirmed")
                    .map((booking) => (
                      <BookingCard
                        key={booking.id}
                        booking={booking}
                        onCancel={handleCancel}
                        cancelling={cancelling}
                      />
                    ))}
                </div>
              </section>
            )}

            {/* History */}
            {(completed + cancelled) > 0 && (
              <section>
                <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <Clock size={12} />
                  History
                </h2>
                <div className="space-y-3">
                  {bookings
                    .filter((b) => b.status !== "confirmed")
                    .map((booking) => (
                      <BookingCard
                        key={booking.id}
                        booking={booking}
                        onCancel={handleCancel}
                        cancelling={cancelling}
                      />
                    ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function BookingCard({
  booking,
  onCancel,
  cancelling,
}: {
  booking: Booking;
  onCancel: (id: string) => void;
  cancelling: string | null;
}) {
  return (
    <div className="card p-4 flex items-center justify-between gap-4 hover:shadow-card-hover transition-shadow">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center shrink-0">
          <Calendar size={18} className="text-primary-600" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-gray-900 text-sm">{booking.service_name}</h3>
            <Badge status={booking.status} />
          </div>
          <p className="text-xs text-gray-500 mt-0.5">{formatDateTime(booking.slot_starts_at)}</p>
          <p className="text-xs text-gray-400 font-mono mt-0.5">
            #{booking.id.slice(0, 8).toUpperCase()} · {booking.service_duration_min} min
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {booking.status === "confirmed" && (
          <Button
            variant="danger"
            size="sm"
            loading={cancelling === booking.id}
            onClick={() => onCancel(booking.id)}
          >
            Cancel
          </Button>
        )}
        {booking.status !== "confirmed" && (
          <ChevronRight size={16} className="text-gray-300" />
        )}
      </div>
    </div>
  );
}

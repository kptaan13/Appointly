import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { CheckCircle, Calendar, Clock, Hash, ArrowRight, LayoutDashboard } from "lucide-react";
import { apiGetBooking } from "../api/bookings.api";
import { useBookingStore } from "../stores/bookingStore";
import { Button } from "../components/ui/Button";
import { Spinner } from "../components/ui/Spinner";
import { formatDateTime } from "../utils/dates";
import type { Booking } from "../types";
import toast from "react-hot-toast";

export default function ConfirmationPage() {
  const { id } = useParams<{ id: string }>();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const { reset } = useBookingStore();

  useEffect(() => {
    reset();
    if (!id) return;
    apiGetBooking(id)
      .then(setBooking)
      .catch(() => toast.error("Could not load booking"))
      .finally(() => setLoading(false));
  }, [id, reset]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="text-center py-24">
        <p className="text-gray-500 mb-4">Booking not found.</p>
        <Link to="/" className="text-primary-600 underline">Back to home</Link>
      </div>
    );
  }

  return (
    <div className="bg-surface min-h-screen flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md animate-slide-up">
        {/* Success icon */}
        <div className="text-center mb-8">
          <div className="relative inline-block">
            <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle size={40} className="text-emerald-500" strokeWidth={1.5} />
            </div>
            <div className="absolute inset-0 rounded-full border-2 border-emerald-200 animate-ping opacity-30" />
          </div>
          <h1 className="text-3xl font-black text-gray-900 mt-5 mb-2">Booking Confirmed!</h1>
          <p className="text-gray-500 text-sm">
            A confirmation has been sent. We'll see you soon!
          </p>
        </div>

        {/* Booking details card */}
        <div className="card overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-5 py-4">
            <p className="text-xs text-primary-200 font-semibold uppercase tracking-wide">Appointment Details</p>
            <p className="text-xl font-bold text-white mt-0.5">{booking.service_name}</p>
          </div>

          <div className="divide-y divide-gray-50">
            <div className="flex items-center gap-3 px-5 py-3.5">
              <div className="w-8 h-8 bg-primary-50 rounded-lg flex items-center justify-center shrink-0">
                <Hash size={14} className="text-primary-600" />
              </div>
              <div>
                <p className="text-xs text-gray-400">Reference</p>
                <p className="font-mono font-bold text-gray-900 text-sm">
                  #{booking.id.slice(0, 8).toUpperCase()}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 px-5 py-3.5">
              <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center shrink-0">
                <Calendar size={14} className="text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-gray-400">Date &amp; Time</p>
                <p className="font-semibold text-gray-900 text-sm">
                  {formatDateTime(booking.slot_starts_at)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 px-5 py-3.5">
              <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center shrink-0">
                <Clock size={14} className="text-amber-600" />
              </div>
              <div>
                <p className="text-xs text-gray-400">Duration</p>
                <p className="font-semibold text-gray-900 text-sm">{booking.service_duration_min} minutes</p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Link to="/dashboard" className="flex-1">
            <Button className="w-full" size="lg">
              <LayoutDashboard size={16} />
              My Bookings
            </Button>
          </Link>
          <Link to="/" className="flex-1">
            <Button variant="secondary" className="w-full" size="lg">
              Book Another
              <ArrowRight size={16} />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

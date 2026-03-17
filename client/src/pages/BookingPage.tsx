import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { ArrowLeft, ArrowRight, Clock, DollarSign } from "lucide-react";
import { useBookingStore } from "../stores/bookingStore";
import { useAuthStore } from "../stores/authStore";
import { apiGetSlots } from "../api/slots.api";
import { apiCreateBooking } from "../api/bookings.api";
import { TimeSlotGrid } from "../components/booking/TimeSlotGrid";
import { Button } from "../components/ui/Button";
import { Spinner } from "../components/ui/Spinner";
import { toDateInputValue } from "../utils/dates";
import type { Slot } from "../types";
import toast from "react-hot-toast";

// Step indicator
function StepBar({ current }: { current: number }) {
  const steps = [
    { label: "Service" },
    { label: "Date & Time" },
    { label: "Confirm" },
  ];
  return (
    <div className="flex items-center gap-0 mb-8">
      {steps.map((step, i) => (
        <div key={step.label} className="flex items-center flex-1 last:flex-none">
          <div className="flex flex-col items-center">
            <div
              className={[
                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all",
                i < current
                  ? "bg-primary-600 border-primary-600 text-white"
                  : i === current
                  ? "bg-white border-primary-600 text-primary-600"
                  : "bg-white border-gray-200 text-gray-400",
              ].join(" ")}
            >
              {i < current ? "✓" : i + 1}
            </div>
            <span
              className={[
                "mt-1.5 text-xs font-medium",
                i <= current ? "text-primary-600" : "text-gray-400",
              ].join(" ")}
            >
              {step.label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div
              className={[
                "flex-1 h-px mx-2 mb-5",
                i < current ? "bg-primary-500" : "bg-gray-200",
              ].join(" ")}
            />
          )}
        </div>
      ))}
    </div>
  );
}

export default function BookingPage() {
  const { selectedService, selectedSlot, selectedDate, setSlot, setDate } = useBookingStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const [slots, setSlots] = useState<Slot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [booking, setBooking] = useState(false);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (!selectedService) navigate("/");
  }, [selectedService, navigate]);

  useEffect(() => {
    if (!selectedDate || !selectedService) return;
    setLoadingSlots(true);
    setSlot(null);
    apiGetSlots(selectedService.id, toDateInputValue(selectedDate))
      .then(setSlots)
      .catch(() => toast.error("Failed to load slots"))
      .finally(() => setLoadingSlots(false));
  }, [selectedDate, selectedService]); // eslint-disable-line

  async function handleConfirm() {
    if (!user) {
      navigate("/login", { state: { from: "/book" } });
      return;
    }
    if (!selectedSlot || !selectedService) return;
    setBooking(true);
    try {
      const b = await apiCreateBooking(selectedSlot.id, selectedService.id, notes || undefined);
      navigate(`/confirmation/${b.id}`);
    } catch (err: unknown) {
      const msg = (err as { message?: string })?.message ?? "Booking failed";
      toast.error(msg);
    } finally {
      setBooking(false);
    }
  }

  if (!selectedService) return null;

  return (
    <div className="bg-surface min-h-screen py-10 px-4">
      <div className="max-w-xl mx-auto">
        <StepBar current={1} />

        {/* Service summary */}
        <div className="card p-4 mb-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center shrink-0">
            <DollarSign size={18} className="text-primary-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="font-bold text-gray-900">{selectedService.name}</h1>
            <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-2">
              <Clock size={11} />
              {selectedService.duration_min} min &nbsp;·&nbsp;
              ${Number(selectedService.price).toFixed(2)}
            </p>
          </div>
          <button
            onClick={() => navigate("/")}
            className="text-xs text-primary-600 font-medium hover:underline shrink-0"
          >
            Change
          </button>
        </div>

        {/* Calendar */}
        <div className="card p-5 mb-4">
          <h2 className="font-semibold text-gray-900 mb-4">Pick a date</h2>
          <DayPicker
            mode="single"
            selected={selectedDate ?? undefined}
            onSelect={(day) => day && setDate(day)}
            disabled={{ before: new Date() }}
            className="mx-auto"
          />
        </div>

        {/* Time slots */}
        {selectedDate && (
          <div className="card p-5 mb-4 animate-fade-in">
            <h2 className="font-semibold text-gray-900 mb-1">
              Available times
            </h2>
            <p className="text-xs text-gray-400 mb-4">
              {selectedDate.toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}
            </p>
            {loadingSlots ? (
              <div className="flex justify-center py-8">
                <Spinner />
              </div>
            ) : (
              <TimeSlotGrid
                slots={slots}
                selectedSlot={selectedSlot}
                onSelect={setSlot}
              />
            )}
          </div>
        )}

        {/* Notes */}
        {selectedSlot && (
          <div className="card p-5 mb-6 animate-fade-in">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Notes <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="Any special requests or notes for your appointment…"
              className="block w-full rounded-[10px] border border-gray-200 px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 placeholder:text-gray-400"
            />
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-between gap-3">
          <Button
            variant="secondary"
            onClick={() => navigate("/")}
          >
            <ArrowLeft size={15} />
            Back
          </Button>
          <Button
            disabled={!selectedSlot}
            loading={booking}
            onClick={handleConfirm}
            size="lg"
          >
            {!user ? "Sign in to confirm" : "Confirm Booking"}
            {user && <ArrowRight size={15} />}
          </Button>
        </div>
      </div>
    </div>
  );
}

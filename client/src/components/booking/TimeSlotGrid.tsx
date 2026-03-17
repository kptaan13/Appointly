import { CalendarX } from "lucide-react";
import type { Slot } from "../../types";
import { formatTime } from "../../utils/dates";
import { cn } from "../../utils/cn";

interface TimeSlotGridProps {
  slots: Slot[];
  selectedSlot: Slot | null;
  onSelect: (slot: Slot) => void;
}

export function TimeSlotGrid({ slots, selectedSlot, onSelect }: TimeSlotGridProps) {
  if (slots.length === 0) {
    return (
      <div className="text-center py-10 text-gray-400">
        <CalendarX size={32} className="mx-auto mb-2 text-gray-300" />
        <p className="text-sm font-medium">No available slots for this date</p>
        <p className="text-xs mt-1">Try selecting a different day</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
      {slots.map((slot) => {
        const isSelected = selectedSlot?.id === slot.id;
        return (
          <button
            key={slot.id}
            onClick={() => onSelect(slot)}
            className={cn(
              "rounded-xl py-2.5 text-sm font-semibold transition-all duration-150 border-2",
              "focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1",
              "active:scale-[0.97]",
              isSelected
                ? "border-primary-600 bg-primary-600 text-white shadow-md"
                : "border-gray-100 bg-white text-gray-700 hover:border-primary-400 hover:bg-primary-50 hover:text-primary-700"
            )}
          >
            {formatTime(slot.starts_at)}
          </button>
        );
      })}
    </div>
  );
}

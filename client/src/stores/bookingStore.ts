import { create } from "zustand";
import type { Service, Slot } from "../types";

interface BookingState {
  selectedService: Service | null;
  selectedSlot: Slot | null;
  selectedDate: Date | null;
  setService: (service: Service) => void;
  setSlot: (slot: Slot | null) => void;
  setDate: (date: Date) => void;
  reset: () => void;
}

export const useBookingStore = create<BookingState>((set) => ({
  selectedService: null,
  selectedSlot: null,
  selectedDate: null,
  setService: (service) => set({ selectedService: service, selectedSlot: null, selectedDate: null }),
  setSlot: (slot) => set({ selectedSlot: slot ?? null }),
  setDate: (date) => set({ selectedDate: date, selectedSlot: null }),
  reset: () => set({ selectedService: null, selectedSlot: null, selectedDate: null }),
}));

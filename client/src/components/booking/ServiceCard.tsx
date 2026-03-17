import { Clock, DollarSign, CheckCircle } from "lucide-react";
import type { Service } from "../../types";
import { cn } from "../../utils/cn";

interface ServiceCardProps {
  service: Service;
  selected?: boolean;
  onSelect: (service: Service) => void;
}

const SERVICE_ICONS: Record<string, string> = {
  haircut:   "✂️",
  facial:    "✨",
  massage:   "💆",
  manicure:  "💅",
  pedicure:  "🦶",
  default:   "💎",
};

function getEmoji(name: string): string {
  const lower = name.toLowerCase();
  for (const [key, emoji] of Object.entries(SERVICE_ICONS)) {
    if (lower.includes(key)) return emoji;
  }
  return SERVICE_ICONS.default;
}

export function ServiceCard({ service, selected, onSelect }: ServiceCardProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(service)}
      className={cn(
        "w-full text-left rounded-xl border-2 p-5 transition-all duration-150 group",
        "hover:shadow-card-hover focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2",
        selected
          ? "border-primary-500 bg-primary-50 shadow-card"
          : "border-gray-100 bg-white hover:border-primary-300 shadow-card"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div
            className={cn(
              "text-2xl w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors",
              selected ? "bg-primary-100" : "bg-gray-50 group-hover:bg-primary-50"
            )}
          >
            {getEmoji(service.name)}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900">{service.name}</h3>
            {service.description && (
              <p className="mt-0.5 text-sm text-gray-500 line-clamp-2 leading-relaxed">
                {service.description}
              </p>
            )}
          </div>
        </div>
        {selected && (
          <CheckCircle size={20} className="text-primary-600 shrink-0 mt-0.5" />
        )}
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-3 text-sm">
          <span className="flex items-center gap-1 text-gray-500">
            <Clock size={13} />
            {service.duration_min} min
          </span>
          <span className="flex items-center gap-1 font-bold text-gray-900">
            <DollarSign size={13} className="text-gray-400" />
            {Number(service.price).toFixed(2)}
          </span>
        </div>

        <span
          className={cn(
            "text-xs font-semibold px-2.5 py-1 rounded-lg transition-colors",
            selected
              ? "bg-primary-600 text-white"
              : "bg-gray-100 text-gray-600 group-hover:bg-primary-100 group-hover:text-primary-700"
          )}
        >
          {selected ? "Selected" : "Select"}
        </span>
      </div>
    </button>
  );
}

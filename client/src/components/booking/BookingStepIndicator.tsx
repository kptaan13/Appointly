import { cn } from "../../utils/cn";

interface Step {
  label: string;
  done: boolean;
}

interface BookingStepIndicatorProps {
  steps: Step[];
  current: number;
}

export function BookingStepIndicator({ steps, current }: BookingStepIndicatorProps) {
  return (
    <div className="flex items-center gap-0 mb-8">
      {steps.map((step, i) => (
        <div key={step.label} className="flex items-center flex-1 last:flex-none">
          <div className="flex flex-col items-center">
            <div
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-colors",
                i < current
                  ? "bg-primary-600 border-primary-600 text-white"
                  : i === current
                  ? "bg-white border-primary-600 text-primary-600"
                  : "bg-white border-gray-300 text-gray-400"
              )}
            >
              {i < current ? "✓" : i + 1}
            </div>
            <span className={cn("mt-1 text-xs font-medium", i <= current ? "text-primary-600" : "text-gray-400")}>
              {step.label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div
              className={cn(
                "flex-1 h-0.5 mx-2 mb-5",
                i < current ? "bg-primary-500" : "bg-gray-200"
              )}
            />
          )}
        </div>
      ))}
    </div>
  );
}

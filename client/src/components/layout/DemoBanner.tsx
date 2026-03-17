import { useState } from "react";
import { X, Info } from "lucide-react";

export function DemoBanner() {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;

  return (
    <div className="bg-gray-950 text-gray-200 text-center py-2.5 px-4 text-xs flex items-center justify-center gap-3 relative">
      <Info size={13} className="shrink-0 text-primary-400" />
      <span>
        <span className="text-gray-400">Demo credentials —</span>{" "}
        <span className="font-semibold text-white">Admin:</span>{" "}
        <code className="bg-gray-800 rounded px-1.5 py-0.5 text-primary-300">admin@appointly.com</code>{" "}
        <code className="bg-gray-800 rounded px-1.5 py-0.5 text-primary-300">admin123</code>
        <span className="mx-2 text-gray-600">·</span>
        <span className="font-semibold text-white">Customer:</span>{" "}
        <code className="bg-gray-800 rounded px-1.5 py-0.5 text-primary-300">customer@test.com</code>{" "}
        <code className="bg-gray-800 rounded px-1.5 py-0.5 text-primary-300">test123</code>
      </span>
      <button
        onClick={() => setDismissed(true)}
        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded text-gray-500 hover:text-gray-300 transition-colors"
      >
        <X size={13} />
      </button>
    </div>
  );
}

import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Mail, Lock, Calendar, ArrowRight, Star } from "lucide-react";
import { apiLogin } from "../api/auth.api";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import toast from "react-hot-toast";

const PERKS = [
  "Book in under 60 seconds",
  "Real-time slot availability",
  "Instant confirmation emails",
  "Easy cancellation anytime",
];

export default function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState<Partial<typeof form>>({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: { pathname?: string } | string })?.from;
  const redirect = typeof from === "string" ? from : (from as { pathname?: string })?.pathname ?? "/dashboard";

  function validate() {
    const errs: Partial<typeof form> = {};
    if (!form.email) errs.email = "Email is required";
    if (!form.password) errs.password = "Password is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await apiLogin(form.email, form.password);
      toast.success("Welcome back!");
      navigate(redirect, { replace: true });
    } catch (err: unknown) {
      toast.error((err as { message?: string })?.message ?? "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-108px)] flex">
      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-between bg-gradient-to-br from-primary-700 via-primary-600 to-indigo-700 text-white w-[420px] shrink-0 p-10 relative overflow-hidden">
        {/* Blobs */}
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-white/5 rounded-full blur-3xl" />

        <div className="relative">
          <div className="flex items-center gap-2.5 mb-12">
            <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
              <Calendar size={18} />
            </div>
            <span className="font-bold text-lg">Appointly</span>
          </div>
          <h2 className="text-3xl font-black leading-tight mb-4">
            Your favourite salon,<br />at your fingertips.
          </h2>
          <p className="text-primary-200 text-sm leading-relaxed">
            Book appointments 24/7 for the services you love. No phone calls, no waiting.
          </p>
        </div>

        <div className="relative space-y-3">
          {PERKS.map((p) => (
            <div key={p} className="flex items-center gap-3 text-sm">
              <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                <ArrowRight size={11} />
              </div>
              {p}
            </div>
          ))}
        </div>

        <div className="relative">
          <div className="flex gap-0.5 mb-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} size={13} className="fill-amber-400 text-amber-400" />
            ))}
          </div>
          <p className="text-sm text-primary-200 italic">
            "Booking has never been this easy. Absolutely love it."
          </p>
          <p className="text-xs text-primary-400 mt-1">— Sarah M., regular client</p>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center px-4 py-12 bg-surface">
        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h1 className="text-2xl font-black text-gray-900">Welcome back</h1>
            <p className="mt-1 text-gray-500 text-sm">Sign in to manage your bookings</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              id="email"
              type="email"
              label="Email address"
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              error={errors.email}
              leftIcon={<Mail size={15} />}
              autoComplete="email"
            />
            <Input
              id="password"
              type="password"
              label="Password"
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              error={errors.password}
              leftIcon={<Lock size={15} />}
              autoComplete="current-password"
            />

            <Button type="submit" loading={loading} className="w-full" size="lg">
              {loading ? "Signing in…" : "Sign in"}
            </Button>
          </form>

          <p className="text-center mt-5 text-sm text-gray-500">
            Don't have an account?{" "}
            <Link to="/register" className="text-primary-600 hover:underline font-semibold">
              Sign up free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

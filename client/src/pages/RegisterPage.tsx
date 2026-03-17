import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, Mail, Lock, Calendar, CheckCircle } from "lucide-react";
import { apiRegister } from "../api/auth.api";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import toast from "react-hot-toast";

const BENEFITS = [
  "Free to create an account",
  "Book services in seconds",
  "Manage & cancel bookings",
  "Email reminders included",
];

export default function RegisterPage() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [errors, setErrors] = useState<Partial<typeof form>>({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  function validate() {
    const errs: Partial<typeof form> = {};
    if (!form.name) errs.name = "Name is required";
    if (!form.email) errs.email = "Email is required";
    if (form.password.length < 8) errs.password = "At least 8 characters";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await apiRegister(form.name, form.email, form.password);
      toast.success("Account created!");
      navigate("/dashboard");
    } catch (err: unknown) {
      toast.error((err as { message?: string })?.message ?? "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-108px)] flex">
      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-between bg-gradient-to-br from-indigo-700 via-primary-600 to-primary-700 text-white w-[420px] shrink-0 p-10 relative overflow-hidden">
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
            Join thousands of<br />happy clients.
          </h2>
          <p className="text-primary-200 text-sm leading-relaxed">
            Create your free account and start booking premium salon &amp; spa services today.
          </p>
        </div>

        <div className="relative space-y-3">
          {BENEFITS.map((b) => (
            <div key={b} className="flex items-center gap-3 text-sm">
              <CheckCircle size={16} className="text-emerald-400 shrink-0" />
              {b}
            </div>
          ))}
        </div>

        <div className="relative bg-white/10 rounded-xl p-4 border border-white/15">
          <p className="text-sm font-semibold mb-1">New York's #1 rated booking app</p>
          <div className="flex items-center gap-2 text-xs text-primary-300">
            <span>5,000+ bookings</span>
            <span className="text-white/30">·</span>
            <span>4.9 ★ rating</span>
            <span className="text-white/30">·</span>
            <span>Since 2022</span>
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center px-4 py-12 bg-surface">
        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h1 className="text-2xl font-black text-gray-900">Create your account</h1>
            <p className="mt-1 text-gray-500 text-sm">Free forever — no credit card required</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              id="name"
              label="Full name"
              placeholder="Jane Doe"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              error={errors.name}
              leftIcon={<User size={15} />}
              autoComplete="name"
            />
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
              placeholder="At least 8 characters"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              error={errors.password}
              hint={!errors.password ? "Min. 8 characters" : undefined}
              leftIcon={<Lock size={15} />}
              autoComplete="new-password"
            />

            <Button type="submit" loading={loading} className="w-full" size="lg">
              {loading ? "Creating account…" : "Create account"}
            </Button>
          </form>

          <p className="text-center mt-5 text-sm text-gray-500">
            Already have an account?{" "}
            <Link to="/login" className="text-primary-600 hover:underline font-semibold">
              Sign in
            </Link>
          </p>

          <p className="text-center mt-4 text-xs text-gray-400">
            By creating an account you agree to our{" "}
            <span className="underline cursor-pointer hover:text-gray-600">Terms of Service</span>
          </p>
        </div>
      </div>
    </div>
  );
}

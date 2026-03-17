import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  CheckCircle,
  Clock,
  Star,
  ArrowRight,
  Calendar,
  Shield,
  Zap,
  Award,
} from "lucide-react";
import { apiGetServices } from "../api/services.api";
import { useBookingStore } from "../stores/bookingStore";
import { ServiceCard } from "../components/booking/ServiceCard";
import { Button } from "../components/ui/Button";
import { Spinner } from "../components/ui/Spinner";
import type { Service } from "../types";
import toast from "react-hot-toast";

// ─── Static data ──────────────────────────────────────────────────────────────

const FEATURES = [
  {
    icon: Zap,
    title: "Instant Booking",
    desc: "Choose a service, pick a time, and you're confirmed in under 60 seconds.",
    color: "bg-amber-50 text-amber-600",
  },
  {
    icon: Calendar,
    title: "Real-Time Availability",
    desc: "Live slot availability so you always see exactly what's open.",
    color: "bg-blue-50 text-blue-600",
  },
  {
    icon: Shield,
    title: "Secure & Private",
    desc: "Your data is encrypted and never shared with third parties.",
    color: "bg-violet-50 text-violet-600",
  },
  {
    icon: Award,
    title: "Premium Experience",
    desc: "From luxury facials to expert haircuts — top-tier professionals only.",
    color: "bg-emerald-50 text-emerald-600",
  },
];

const TESTIMONIALS = [
  {
    name: "Sarah M.",
    role: "Regular Client",
    text: "I book here every month. The app is so smooth and the reminders are a lifesaver.",
    rating: 5,
    initials: "SM",
    color: "bg-violet-100 text-violet-700",
  },
  {
    name: "James K.",
    role: "First-time Customer",
    text: "Found an appointment same-day. Incredibly convenient, beautiful app.",
    rating: 5,
    initials: "JK",
    color: "bg-sky-100 text-sky-700",
  },
  {
    name: "Priya D.",
    role: "Monthly Member",
    text: "Love how I can manage everything from my phone. Cancellations are instant too.",
    rating: 5,
    initials: "PD",
    color: "bg-pink-100 text-pink-700",
  },
];

const STEPS = [
  { n: "01", title: "Choose a service", desc: "Browse our menu of premium salon & spa treatments." },
  { n: "02", title: "Pick your time",   desc: "Select a date and an available time slot that works for you." },
  { n: "03", title: "Confirm & relax",  desc: "Get a confirmation and show up — we'll handle the rest." },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function HomePage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const { selectedService, setService } = useBookingStore();
  const navigate = useNavigate();

  useEffect(() => {
    apiGetServices()
      .then(setServices)
      .catch(() => toast.error("Failed to load services"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="bg-surface">
      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-700 via-primary-600 to-indigo-600 text-white">
        {/* Decorative blobs */}
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-white/5 rounded-full blur-3xl" />

        <div className="relative max-w-4xl mx-auto px-4 py-20 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-sm mb-8">
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            Accepting bookings today
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black mb-5 leading-tight tracking-tight">
            Book your perfect <br className="hidden sm:block" />
            <span className="text-primary-200">appointment</span>
          </h1>
          <p className="text-lg text-primary-100 mb-3 max-w-xl mx-auto">
            Premium Salon &amp; Spa — New York
          </p>
          <p className="text-primary-300 text-sm mb-10">
            📍 42 Bloom Street, NY 10001 &nbsp;·&nbsp; 📞 (212) 555-0184 &nbsp;·&nbsp; ✉️ hello@appointly.com
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <a href="#services">
              <Button size="lg" className="bg-white text-primary-700 hover:bg-primary-50 shadow-lg hover:shadow-xl border-0 font-bold">
                Browse services
                <ArrowRight size={16} />
              </Button>
            </a>
            <Link to="/login">
              <Button size="lg" variant="ghost" className="text-white border border-white/30 hover:bg-white/10">
                Sign in
              </Button>
            </Link>
          </div>

          {/* Trust strip */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-sm text-primary-200">
            {["5,000+ bookings", "4.9 ★ average", "No-hassle cancels"].map((t) => (
              <span key={t} className="flex items-center gap-1.5">
                <CheckCircle size={14} className="text-emerald-400" />
                {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ────────────────────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <p className="text-xs font-bold text-primary-600 uppercase tracking-widest mb-2">Why Appointly</p>
          <h2 className="text-3xl font-black text-gray-900">Everything you need,<br />nothing you don't</h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {FEATURES.map((f) => (
            <div key={f.title} className="card p-5">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${f.color}`}>
                <f.icon size={20} />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">{f.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── How it works ────────────────────────────────────────────────── */}
      <section className="bg-white border-y border-gray-100 py-20">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-12">
            <p className="text-xs font-bold text-primary-600 uppercase tracking-widest mb-2">How it works</p>
            <h2 className="text-3xl font-black text-gray-900">Booked in 3 steps</h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-8 relative">
            <div className="hidden sm:block absolute top-7 left-[calc(16.66%+1rem)] right-[calc(16.66%+1rem)] h-px bg-gray-200" />
            {STEPS.map((s) => (
              <div key={s.n} className="flex flex-col items-center text-center relative">
                <div className="w-14 h-14 rounded-2xl bg-primary-600 text-white flex items-center justify-center text-xl font-black mb-4 shadow-md relative z-10">
                  {s.n}
                </div>
                <h3 className="font-bold text-gray-900 mb-1">{s.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Services ────────────────────────────────────────────────────── */}
      <section id="services" className="max-w-4xl mx-auto px-4 py-20">
        <div className="text-center mb-10">
          <p className="text-xs font-bold text-primary-600 uppercase tracking-widest mb-2">Our services</p>
          <h2 className="text-3xl font-black text-gray-900">Choose your treatment</h2>
          <p className="mt-2 text-gray-500">Select a service to get started</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Spinner size="lg" />
          </div>
        ) : (
          <>
            <div className="grid sm:grid-cols-2 gap-4">
              {services.map((service) => (
                <ServiceCard
                  key={service.id}
                  service={service}
                  selected={selectedService?.id === service.id}
                  onSelect={setService}
                />
              ))}
            </div>

            {selectedService && (
              <div className="mt-8 bg-primary-50 border border-primary-200 rounded-xl p-4 flex items-center justify-between animate-fade-in">
                <div>
                  <p className="text-sm text-primary-600 font-medium">Selected:</p>
                  <p className="font-bold text-primary-900">{selectedService.name}</p>
                </div>
                <Button size="lg" onClick={() => navigate("/book")}>
                  Continue →
                </Button>
              </div>
            )}
          </>
        )}
      </section>

      {/* ── Testimonials ────────────────────────────────────────────────── */}
      <section className="bg-gray-950 py-20 text-white">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-12">
            <p className="text-xs font-bold text-primary-400 uppercase tracking-widest mb-2">Testimonials</p>
            <h2 className="text-3xl font-black">Loved by our clients</h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="glass rounded-2xl p-6">
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} size={14} className="fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-gray-300 leading-relaxed mb-5">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold ${t.color}`}>
                    {t.initials}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{t.name}</p>
                    <p className="text-xs text-gray-500">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────────────────── */}
      <section className="py-20 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-black text-gray-900 mb-4">Ready for your next appointment?</h2>
          <p className="text-gray-500 mb-8">Join thousands of clients who book with Appointly every week.</p>
          <div className="flex flex-wrap gap-3 justify-center">
            <a href="#services">
              <Button size="lg">
                Book now
                <ArrowRight size={16} />
              </Button>
            </a>
            <Link to="/register">
              <Button size="lg" variant="secondary">Create account</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <footer className="bg-white border-t border-gray-100 py-8 px-4">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-400">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-primary-600 rounded-[7px] flex items-center justify-center">
              <Calendar size={12} className="text-white" />
            </div>
            <span className="font-bold text-gray-700">Appointly</span>
            <span className="text-gray-300 mx-1">·</span>
            <span>Premium Salon &amp; Spa</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock size={12} />
            <span>Mon–Sat 9am–7pm · Sun 10am–5pm</span>
          </div>
          <span>© {new Date().getFullYear()} Appointly. All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
}

import { useEffect, useRef, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
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

// ─── Scroll-triggered fade hook ───────────────────────────────────────────────
function useFadeIn() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { el.classList.add("is-visible"); observer.disconnect(); } },
      { threshold: 0.12 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return ref;
}

// ─── Typewriter hook ──────────────────────────────────────────────────────────
const TYPING_WORDS = ["appointment", "haircut", "facial", "massage", "treatment"];

function useTypewriter(speed = 80, pause = 1800) {
  const [displayed, setDisplayed] = useState("");
  const [wordIdx, setWordIdx]     = useState(0);
  const [charIdx, setCharIdx]     = useState(0);
  const [deleting, setDeleting]   = useState(false);

  useEffect(() => {
    const word = TYPING_WORDS[wordIdx];
    let timeout: ReturnType<typeof setTimeout>;

    if (!deleting && charIdx <= word.length) {
      timeout = setTimeout(() => {
        setDisplayed(word.slice(0, charIdx));
        setCharIdx((c) => c + 1);
        if (charIdx === word.length) {
          // finished typing — pause then start deleting
          timeout = setTimeout(() => setDeleting(true), pause);
        }
      }, speed);
    } else if (deleting && charIdx >= 0) {
      timeout = setTimeout(() => {
        setDisplayed(word.slice(0, charIdx));
        setCharIdx((c) => c - 1);
        if (charIdx === 0) {
          setDeleting(false);
          setWordIdx((w) => (w + 1) % TYPING_WORDS.length);
        }
      }, speed / 2);
    }

    return () => clearTimeout(timeout);
  }, [charIdx, deleting, wordIdx, speed, pause]);

  return displayed;
}

// ─── Count-up hook ────────────────────────────────────────────────────────────
function useCountUp(target: number, duration = 1400) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        const start = performance.now();
        const tick = (now: number) => {
          const pct = Math.min((now - start) / duration, 1);
          const ease = 1 - Math.pow(1 - pct, 3);
          setValue(Math.round(ease * target));
          if (pct < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      },
      { threshold: 0.5 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [target, duration]);
  return { ref, value };
}

// ─── Static data ──────────────────────────────────────────────────────────────
const FEATURES = [
  { icon: Zap,      title: "Instant Booking",        desc: "Choose a service, pick a time, and you're confirmed in under 60 seconds.", color: "bg-amber-50 text-amber-600" },
  { icon: Calendar, title: "Real-Time Availability",  desc: "Live slot availability so you always see exactly what's open.",           color: "bg-blue-50 text-blue-600" },
  { icon: Shield,   title: "Secure & Private",        desc: "Your data is encrypted and never shared with third parties.",             color: "bg-violet-50 text-violet-600" },
  { icon: Award,    title: "Premium Experience",      desc: "From luxury facials to expert haircuts — top-tier professionals only.",   color: "bg-emerald-50 text-emerald-600" },
];

const TESTIMONIALS = [
  { name: "Sarah M.",  role: "Regular Client",       text: "I book here every month. The app is so smooth and the reminders are a lifesaver.",      rating: 5, initials: "SM", color: "bg-violet-100 text-violet-700" },
  { name: "James K.",  role: "First-time Customer",  text: "Found an appointment same-day. Incredibly convenient, beautiful app.",                   rating: 5, initials: "JK", color: "bg-sky-100 text-sky-700" },
  { name: "Priya D.",  role: "Monthly Member",       text: "Love how I can manage everything from my phone. Cancellations are instant too.",         rating: 5, initials: "PD", color: "bg-pink-100 text-pink-700" },
  { name: "Chris L.",  role: "VIP Client",           text: "Best salon app I've used. The experience is seamless from booking to checkout.",         rating: 5, initials: "CL", color: "bg-amber-100 text-amber-700" },
  { name: "Maya R.",   role: "New Client",           text: "Booked my first appointment in 2 minutes. The interface is super intuitive!",            rating: 5, initials: "MR", color: "bg-emerald-100 text-emerald-700" },
  { name: "Daniel T.", role: "Monthly Member",       text: "I love the real-time availability feature. Never had a double-booking issue.",           rating: 5, initials: "DT", color: "bg-rose-100 text-rose-700" },
];

const STEPS = [
  { n: "01", title: "Choose a service", desc: "Browse our menu of premium salon & spa treatments." },
  { n: "02", title: "Pick your time",   desc: "Select a date and an available time slot that works for you." },
  { n: "03", title: "Confirm & relax",  desc: "Get a confirmation and show up — we'll handle the rest." },
];

const STATS = [
  { value: 5000, suffix: "+", label: "bookings made" },
  { value: 49,   suffix: "",  label: "★ average rating", display: (v: number) => (v / 10).toFixed(1) },
  { value: 98,   suffix: "%", label: "satisfaction rate" },
];

// ─── Marquee Testimonials ─────────────────────────────────────────────────────
function TestimonialMarquee() {
  const doubled = [...TESTIMONIALS, ...TESTIMONIALS];
  return (
    <div className="relative overflow-hidden">
      {/* fade edges */}
      <div className="absolute left-0 top-0 h-full w-24 bg-gradient-to-r from-gray-950 to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 h-full w-24 bg-gradient-to-l from-gray-950 to-transparent z-10 pointer-events-none" />
      <div className="flex gap-5 animate-marquee">
        {doubled.map((t, i) => (
          <div
            key={i}
            className="glass rounded-2xl p-6 shrink-0 w-72"
          >
            <div className="flex gap-0.5 mb-3">
              {Array.from({ length: t.rating }).map((_, j) => (
                <Star key={j} size={13} className="fill-amber-400 text-amber-400" />
              ))}
            </div>
            <p className="text-sm text-gray-300 leading-relaxed mb-5">"{t.text}"</p>
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${t.color}`}>
                {t.initials}
              </div>
              <div>
                <p className="text-sm font-semibold text-white">{t.name}</p>
                <p className="text-xs text-gray-500">{t.role}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Stat Counter ─────────────────────────────────────────────────────────────
function StatItem({ value, suffix, label, display }: { value: number; suffix: string; label: string; display?: (v: number) => string }) {
  const { ref, value: v } = useCountUp(value);
  return (
    <span ref={ref} className="flex flex-col items-center">
      <span className="text-2xl font-black text-white">
        {display ? display(v) : v.toLocaleString()}{suffix}
      </span>
      <span className="text-xs text-primary-300 mt-0.5">{label}</span>
    </span>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function HomePage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const { selectedService, setService } = useBookingStore();
  const navigate = useNavigate();

  const typedWord = useTypewriter();

  // fade refs
  const featuresRef  = useFadeIn();
  const stepsRef     = useFadeIn();
  const servicesRef  = useFadeIn();
  const statsRef     = useFadeIn();
  const ctaRef       = useFadeIn();

  useEffect(() => {
    apiGetServices()
      .then(setServices)
      .catch(() => toast.error("Failed to load services"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="bg-surface">

      {/* ── Hero (animated gradient) ──────────────────────────────────────── */}
      <section className="relative overflow-hidden text-white hero-gradient">
        {/* Decorative blobs */}
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-white/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-4xl mx-auto px-4 py-20 text-center">
          {/* Live badge with pulse ring */}
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-sm mb-8">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400" />
            </span>
            Accepting bookings today
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black mb-5 leading-tight tracking-tight">
            Book your perfect <br className="hidden sm:block" />
            <span className="text-primary-200">
              {typedWord}
              <span className="inline-block w-[3px] h-[0.85em] bg-primary-200 ml-1 align-middle animate-pulse rounded-sm" />
            </span>
          </h1>
          <p className="text-lg text-primary-100 mb-3 max-w-xl mx-auto">
            Premium Salon &amp; Spa — New York
          </p>
          <p className="text-primary-300 text-sm mb-10">
            📍 42 Bloom Street, NY 10001 &nbsp;·&nbsp; 📞 (212) 555-0184 &nbsp;·&nbsp; ✉️ hello@appointly.com
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <a href="#services">
              {/* Shimmer sweep button */}
              <button className="shimmer-btn group relative overflow-hidden inline-flex items-center gap-2 bg-white text-primary-700 font-bold px-6 py-3 rounded-xl text-base shadow-lg hover:shadow-xl transition-shadow">
                Browse services
                <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
                <span className="shimmer-sweep" />
              </button>
            </a>
            <Link to="/login">
              <Button size="lg" variant="ghost" className="text-white border border-white/30 hover:bg-white/10">
                Sign in
              </Button>
            </Link>
          </div>

          {/* Stats strip with count-up */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-8">
            {STATS.map((s) => (
              <StatItem key={s.label} {...s} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-4 py-20">
        <div ref={featuresRef} className="fade-section">
          <div className="text-center mb-12">
            <p className="text-xs font-bold text-primary-600 uppercase tracking-widest mb-2">Why Appointly</p>
            <h2 className="text-3xl font-black text-gray-900">Everything you need,<br />nothing you don't</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {FEATURES.map((f, i) => (
              <div
                key={f.title}
                className="card p-5 hover-lift cursor-default"
                style={{ transitionDelay: `${i * 80}ms` }}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${f.color}`}>
                  <f.icon size={20} />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ──────────────────────────────────────────────────── */}
      <section className="bg-white border-y border-gray-100 py-20">
        <div ref={stepsRef} className="fade-section max-w-4xl mx-auto px-4">
          <div className="text-center mb-12">
            <p className="text-xs font-bold text-primary-600 uppercase tracking-widest mb-2">How it works</p>
            <h2 className="text-3xl font-black text-gray-900">Booked in 3 steps</h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-8 relative">
            <div className="hidden sm:block absolute top-7 left-[calc(16.66%+1rem)] right-[calc(16.66%+1rem)] h-px bg-gray-200" />
            {STEPS.map((s, i) => (
              <div
                key={s.n}
                className="flex flex-col items-center text-center relative"
                style={{ transitionDelay: `${i * 120}ms` }}
              >
                <div className="w-14 h-14 rounded-2xl bg-primary-600 text-white flex items-center justify-center text-xl font-black mb-4 shadow-md relative z-10 transition-transform duration-300 hover:scale-110 hover:shadow-lg">
                  {s.n}
                </div>
                <h3 className="font-bold text-gray-900 mb-1">{s.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Services ──────────────────────────────────────────────────────── */}
      <section id="services" className="max-w-4xl mx-auto px-4 py-20">
        <div ref={servicesRef} className="fade-section">
          <div className="text-center mb-10">
            <p className="text-xs font-bold text-primary-600 uppercase tracking-widest mb-2">Our services</p>
            <h2 className="text-3xl font-black text-gray-900">Choose your treatment</h2>
            <p className="mt-2 text-gray-500">Select a service to get started</p>
          </div>

          {loading ? (
            <div className="flex justify-center py-16"><Spinner size="lg" /></div>
          ) : (
            <>
              <div className="grid sm:grid-cols-2 gap-4">
                {services.map((service, i) => (
                  <div
                    key={service.id}
                    className="hover-lift"
                    style={{ transitionDelay: `${i * 60}ms` }}
                  >
                    <ServiceCard
                      service={service}
                      selected={selectedService?.id === service.id}
                      onSelect={setService}
                    />
                  </div>
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
        </div>
      </section>

      {/* ── Testimonials (marquee) ─────────────────────────────────────────── */}
      <section className="bg-gray-950 py-20 text-white overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 mb-10 text-center">
          <p className="text-xs font-bold text-primary-400 uppercase tracking-widest mb-2">Testimonials</p>
          <h2 className="text-3xl font-black">Loved by our clients</h2>
        </div>
        <TestimonialMarquee />
      </section>

      {/* ── Stats row ─────────────────────────────────────────────────────── */}
      <section className="hero-gradient py-14">
        <div ref={statsRef} className="fade-section max-w-3xl mx-auto px-4">
          <div className="flex flex-wrap items-center justify-center gap-10 sm:gap-16">
            {[
              { value: 5000, suffix: "+", label: "Bookings made",      display: undefined },
              { value: 49,   suffix: "",  label: "★ Average rating",   display: (v: number) => (v / 10).toFixed(1) },
              { value: 98,   suffix: "%", label: "Satisfaction rate",  display: undefined },
              { value: 3,    suffix: "+", label: "Years in business",  display: undefined },
            ].map((s) => (
              <StatItem key={s.label} {...s} />
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────────────── */}
      <section className="py-20 px-4">
        <div ref={ctaRef} className="fade-section max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-black text-gray-900 mb-4">Ready for your next appointment?</h2>
          <p className="text-gray-500 mb-8">Join thousands of clients who book with Appointly every week.</p>
          <div className="flex flex-wrap gap-3 justify-center">
            <a href="#services">
              <button className="shimmer-btn group relative overflow-hidden inline-flex items-center gap-2 bg-primary-600 text-white font-bold px-6 py-3 rounded-xl text-base shadow-lg hover:shadow-xl transition-shadow">
                Book now
                <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
                <span className="shimmer-sweep" />
              </button>
            </a>
            <Link to="/register">
              <Button size="lg" variant="secondary">Create account</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────────────── */}
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

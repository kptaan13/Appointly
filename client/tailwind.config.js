/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      colors: {
        primary: {
          50:  "#eff6ff",
          100: "#dbeafe",
          200: "#bfdbfe",
          300: "#93c5fd",
          400: "#60a5fa",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
          800: "#1e40af",
          900: "#1e3a8a",
        },
        accent: {
          50:  "#fff7ed",
          100: "#ffedd5",
          400: "#fb923c",
          500: "#f97316",
          600: "#ea580c",
        },
        surface: "#F8FAFC",
      },
      borderRadius: {
        DEFAULT: "12px",
        sm: "8px",
        lg: "16px",
        xl: "20px",
        "2xl": "24px",
      },
      boxShadow: {
        card: "0 1px 3px 0 rgb(0 0 0 / 0.07), 0 4px 16px 0 rgb(0 0 0 / 0.06)",
        "card-hover": "0 4px 8px 0 rgb(0 0 0 / 0.08), 0 12px 32px 0 rgb(0 0 0 / 0.10)",
        dropdown: "0 4px 6px -2px rgb(0 0 0 / 0.05), 0 10px 30px -3px rgb(0 0 0 / 0.12)",
        modal: "0 20px 60px -10px rgb(0 0 0 / 0.25)",
      },
      animation: {
        "fade-in":    "fadeIn 0.3s ease-out",
        "slide-up":   "slideUp 0.3s ease-out",
        "slide-down": "slideDown 0.2s ease-out",
        "count-up":   "countUp 0.6s ease-out",
        "pulse-soft": "pulseSoft 2s ease-in-out infinite",
        "spin-slow":  "spin 2s linear infinite",
        "bounce-dot": "bounceDot 1.4s ease-in-out infinite",
        "shimmer":    "shimmer 2s linear infinite",
      },
      keyframes: {
        fadeIn:    { "0%": { opacity: "0" },                       "100%": { opacity: "1" } },
        slideUp:   { "0%": { opacity: "0", transform: "translateY(12px)" }, "100%": { opacity: "1", transform: "translateY(0)" } },
        slideDown: { "0%": { opacity: "0", transform: "translateY(-8px)" }, "100%": { opacity: "1", transform: "translateY(0)" } },
        pulseSoft: { "0%,100%": { opacity: "1" },                  "50%": { opacity: "0.5" } },
        bounceDot: { "0%,80%,100%": { transform: "scale(0)" },     "40%": { transform: "scale(1)" } },
        shimmer:   { "0%": { backgroundPosition: "-200% 0" },      "100%": { backgroundPosition: "200% 0" } },
      },
      transitionTimingFunction: {
        smooth: "cubic-bezier(0.4, 0, 0.2, 1)",
      },
    },
  },
  plugins: [],
};

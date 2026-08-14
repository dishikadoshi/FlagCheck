/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        blush: {
          50: "#fff5f8",
          100: "#ffe6ee",
          200: "#ffccdd",
          300: "#ffa3c2",
          400: "#ff74a3",
          500: "#f8477e",
          600: "#e02461",
          700: "#b91650",
          800: "#8f1140",
          900: "#4a0a22",
        },
        ink: {
          50: "#f4eeee",
          100: "#e7d9db",
          400: "#7a3546",
          600: "#4a1a2a",
          700: "#391320",
          800: "#260c16",
          900: "#160710",
          950: "#0d0409",
        },
        emerald: {
          500: "#1f9d6f",
          600: "#0f8a5c",
          700: "#0a6e49",
        },
        cream: "#fff9fb",
        gold: "#d8a34d",
      },
      fontFamily: {
        display: ["'Fraunces'", "serif"],
        body: ["'Manrope'", "sans-serif"],
      },
      boxShadow: {
        soft: "0 20px 60px -15px rgba(224, 36, 97, 0.35)",
        card: "0 1px 2px rgba(74, 10, 34, 0.04), 0 12px 32px -12px rgba(74, 10, 34, 0.18)",
        "card-lg": "0 2px 4px rgba(74, 10, 34, 0.05), 0 24px 60px -18px rgba(74, 10, 34, 0.25)",
        pop: "0 8px 24px -6px rgba(74, 10, 34, 0.28)",
      },
      keyframes: {
        grain: {
          "0%, 100%": { transform: "translate(0, 0)" },
          "10%": { transform: "translate(-1%, -2%)" },
          "30%": { transform: "translate(2%, 1%)" },
          "50%": { transform: "translate(-1%, 2%)" },
          "70%": { transform: "translate(1%, -1%)" },
          "90%": { transform: "translate(-2%, 1%)" },
        },
      },
      animation: {
        grain: "grain 8s steps(8) infinite",
      },
    },
  },
  plugins: [],
};

import { useNavigate } from "react-router-dom";

const LINKS = [
  { label: "FlowPulse Investor", path: "/login-investor" },
  { label: "Reports", path: "/research" },
  { label: "Opportunities", path: "/intelligence" },
  { label: "Pricing", path: "/pricing" },
  { label: "About", path: "/about" },
  { label: "Contact", path: "/contact" },
];

export function HomepageNavLinks() {
  const navigate = useNavigate();
  return (
    <nav className="hidden lg:flex items-center gap-4 xl:gap-6 absolute left-1/2 -translate-x-1/2 whitespace-nowrap">
      {LINKS.map((l) => (
        <button
          key={l.path}
          onClick={() => navigate(l.path)}
          className="text-slate-600 text-base font-medium tracking-wide transition-all duration-300 hover:text-primary hover:[text-shadow:0_0_10px_hsl(var(--primary)/0.5),0_0_20px_hsl(var(--primary)/0.3)]"
        >
          {l.label}
        </button>
      ))}
    </nav>
  );
}

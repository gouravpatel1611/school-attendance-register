import { NavLink, useLocation } from "react-router-dom";
import { BookOpenCheck, ChartNoAxesCombined, ClipboardCheck, House, Menu, Moon, Sun, Users } from "lucide-react";
import { useTheme } from "../../hooks/useTheme";

const nav = [
  { to: "/", label: "Home", icon: House },
  { to: "/attendance", label: "Attendance", icon: ClipboardCheck },
  { to: "/students", label: "Students", icon: Users },
  { to: "/reports", label: "Reports", icon: ChartNoAxesCombined },
  { to: "/more", label: "More", icon: Menu },
];

export default function AppShell({ children }) {
  const { theme, setTheme } = useTheme();
  const location = useLocation();
  const current = nav.find(n => n.to === location.pathname);
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-blue-600 text-white"><BookOpenCheck size={21}/></div>
            <div><p className="text-sm font-bold tracking-tight">School Attendance Register</p><p className="text-xs text-slate-500 dark:text-slate-400">XI-B · XII-B</p></div>
          </div>
          <button className="icon-button" onClick={() => setTheme(theme === "dark" ? "light" : "dark")} aria-label="Toggle theme">
            {theme === "dark" ? <Sun size={18}/> : <Moon size={18}/>}
          </button>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 pb-28 pt-5 md:pb-10 md:pt-8">{children}</main>
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 px-1 pb-[env(safe-area-inset-bottom)] pt-2 backdrop-blur dark:border-slate-800 dark:bg-slate-950/95 md:static md:mx-auto md:mt-8 md:max-w-6xl md:rounded-2xl md:border md:pb-2">
        <div className="mx-auto grid max-w-2xl grid-cols-5 gap-1 md:max-w-none">
          {nav.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} end={to === "/"} className={({ isActive }) => `flex flex-col items-center gap-1 rounded-xl px-1 py-2 text-[10px] font-medium transition md:flex-row md:justify-center md:gap-2 md:text-sm ${isActive ? "bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300" : "text-slate-500 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-900"}`}>
              <Icon size={19}/><span>{label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
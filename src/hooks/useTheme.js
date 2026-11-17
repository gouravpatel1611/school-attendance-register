import { useEffect, useState } from "react";
export function useTheme() {
  const [theme, setTheme] = useState(() => localStorage.getItem("sar-theme") || "light");
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("sar-theme", theme);
  }, [theme]);
  return { theme, setTheme };
}
import { useEffect, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import AppShell from "../components/layout/AppShell";
import DashboardPage from "../features/dashboard/DashboardPage";
import AttendancePage from "../features/attendance/AttendancePage";
import StudentsPage from "../features/students/StudentsPage";
import StudentProfilePage from "../features/students/StudentProfilePage";
import ReportsPage from "../features/reports/ReportsPage";
import HistoryPage from "../features/history/HistoryPage";
import MorePage from "../features/settings/MorePage";
import { initializeDatabase } from "../database/provider";

export default function App() {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    initializeDatabase()
      .then(() => setReady(true))
      .catch((e) => {
        console.error(e);
        setError("Local database could not be initialized. Please use a modern browser and reload.");
      });
  }, []);

  if (error) return <div className="min-h-screen grid place-items-center p-6"><div className="card max-w-md text-center"><h1 className="text-xl font-bold">Setup error</h1><p className="text-slate-500 mt-2">{error}</p></div></div>;
  if (!ready) return <div className="min-h-screen grid place-items-center"><div className="text-center"><div className="spinner mx-auto" /><p className="mt-4 text-slate-500">Preparing your attendance register…</p></div></div>;

  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/attendance" element={<AttendancePage />} />
        <Route path="/students" element={<StudentsPage />} />
        <Route path="/students/:id" element={<StudentProfilePage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/more" element={<MorePage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppShell>
  );
}
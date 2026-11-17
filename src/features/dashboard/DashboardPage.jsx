import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, ArrowRight, CalendarCheck, CheckCircle2, ClipboardCheck, Users, UserRound, XCircle } from "lucide-react";
import { Link } from "react-router-dom";
import PageHeader from "../../components/common/PageHeader";
import StatCard from "../../components/common/StatCard";
import { studentRepository } from "../../services/studentRepository";
import { attendanceRepository } from "../../services/attendanceRepository";
import { holidayRepository } from "../../services/holidayRepository";
import { todayISO } from "../../utils/date";
import { getAttendanceStats } from "../../utils/attendance";

export default function DashboardPage() {
  const [grade, setGrade] = useState("XI");
  const [data, setData] = useState({ students: [], present: 0, absent: 0, percentage: 0, low: [] });
  const [todayRecords, setTodayRecords] = useState([]);
  const [holiday, setHoliday] = useState(null);
  const date = todayISO();

  useEffect(() => {
    let live = true;
    (async () => {
      const [students, records, h] = await Promise.all([studentRepository.list(), attendanceRepository.list(), holidayRepository.get(date)]);
      const all = [];
      for (const g of ["XI", "XII"]) {
        const academicStart = `${new Date().getFullYear()}-04-01`;
        const s = await getAttendanceStats(g, academicStart, date);
        const list = s.students.map(st => {
          const x = s.byStudent.get(st.id) || { present: 0 };
          return { ...st, percentage: s.workingDays ? x.present / s.workingDays * 100 : 0 };
        });
        all.push(...list);
      }
      const filtered = students.filter(s => s.class === grade);
      const record = records.find(r => r.class === grade && r.date === date);
      const present = Object.values(record?.statuses || {}).filter(v => v === "PRESENT").length;
      const absent = Object.values(record?.statuses || {}).filter(v => v === "ABSENT").length;
      if (live) {
        setData({ students: filtered, present, absent, percentage: filtered.length ? present / filtered.length * 100 : 0, low: all.filter(s => s.percentage < 75 && s.percentage > 0).sort((a,b) => a.percentage - b.percentage).slice(0, 5) });
        setTodayRecords(records.filter(r => r.date === date));
        setHoliday(h);
      }
    })();
    return () => { live = false; };
  }, [grade, date]);

  const marked = data.present + data.absent;
  return <div>
    <PageHeader title="Good day!" subtitle={new Date().toLocaleDateString("en-IN", { weekday: "long", day: "2-digit", month: "long", year: "numeric" })} action={<span className="pill pill-blue">Teacher Dashboard</span>}/>
    <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-blue-950 to-blue-700 p-5 text-white shadow-soft md:p-7">
      <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-sm text-blue-100">TODAY'S ATTENDANCE</p><h2 className="mt-1 text-4xl font-bold tabular-nums">{holiday ? "Holiday" : `${data.percentage.toFixed(1)}%`}</h2><p className="mt-2 text-sm text-blue-100">{holiday ? holiday.title || "Holiday marked" : `${marked} of ${data.students.length} students marked`}</p></div><div className="rounded-2xl bg-white/10 p-4"><CalendarCheck size={30}/></div></div>
      <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/20"><div className="h-full rounded-full bg-emerald-300 transition-all" style={{ width: `${data.percentage}%` }}/></div>
      <div className="mt-5 flex flex-wrap items-center gap-2"><Link to="/attendance" className="btn btn-white"><ClipboardCheck size={17}/> Mark Attendance</Link><Link to="/reports" className="btn btn-glass">View Reports <ArrowRight size={16}/></Link></div>
    </div>
    <div className="mt-6 flex flex-wrap items-center justify-between gap-3"><h2 className="section-title">Today's Overview</h2><div className="flex items-center gap-2"><span className="text-xs text-slate-500">Class</span><select className="field w-28" value={grade} onChange={e=>setGrade(e.target.value)}><option value="XI">XI-B</option><option value="XII">XII-B</option></select></div></div>
    <div className="mt-3 grid grid-cols-2 gap-3 lg:grid-cols-4">
      <StatCard label="Total Students" value={data.students.length} icon={Users}/>
      <StatCard label="Present" value={data.present} icon={CheckCircle2} tone="green"/>
      <StatCard label="Absent" value={data.absent} icon={XCircle} tone="red"/>
      <StatCard label="Not Marked" value={Math.max(0,data.students.length-marked)} icon={UserRound} tone="amber"/>
    </div>
    <div className="mt-6 grid gap-4 lg:grid-cols-2">
      <section className="card"><div className="flex items-center justify-between"><div><h2 className="section-title">Quick Actions</h2><p className="muted mt-1">Frequently used tools</p></div><ClipboardCheck className="text-blue-600"/></div><div className="mt-4 grid grid-cols-2 gap-3"><Link className="quick-link" to="/attendance"><ClipboardCheck/><span>Mark Attendance</span></Link><Link className="quick-link" to="/students"><Users/><span>Student List</span></Link><Link className="quick-link" to="/reports"><CalendarCheck/><span>Attendance Reports</span></Link><Link className="quick-link" to="/history"><CheckCircle2/><span>Edit History</span></Link></div></section>
      <section className="card"><div className="flex items-center justify-between"><div><h2 className="section-title">Low Attendance Alert</h2><p className="muted mt-1">Below 75% based on recorded working days</p></div><AlertTriangle className="text-amber-500"/></div>{data.low.length ? <div className="mt-3 space-y-3">{data.low.map(s=><Link key={s.id} to={`/students/${s.id}`} className="flex items-center justify-between border-b border-slate-100 pb-2 last:border-0 dark:border-slate-800"><div><p className="text-sm font-semibold">{s.name}</p><p className="text-xs text-slate-500">Roll {s.rollNo} · {s.class}-B</p></div><span className="pill pill-red">{s.percentage.toFixed(1)}%</span></Link>)}</div> : <p className="mt-4 rounded-xl bg-slate-50 p-4 text-sm text-slate-500 dark:bg-slate-800/60">No low-attendance alerts yet. Alerts appear after attendance records are available.</p>}</section>
    </div>
    <p className="mt-5 text-center text-xs text-slate-400">Local data is stored in this browser on this device.</p>
  </div>;
}
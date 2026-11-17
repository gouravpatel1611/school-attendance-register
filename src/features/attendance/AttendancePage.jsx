import { useEffect, useMemo, useState } from "react";
import { AlertCircle, CalendarDays, Check, CheckCheck, RotateCcw, Save, Search, PartyPopper } from "lucide-react";
import PageHeader from "../../components/common/PageHeader";
import ClassSwitch from "../../components/common/ClassSwitch";
import { loadAttendance, saveAttendance } from "../../services/attendanceService";
import { todayISO, formatDate } from "../../utils/date";

export default function AttendancePage() {
  const [grade, setGrade] = useState("XI");
  const [date, setDate] = useState(todayISO());
  const [students, setStudents] = useState([]);
  const [statuses, setStatuses] = useState({});
  const [holiday, setHoliday] = useState(false);
  const [holidayTitle, setHolidayTitle] = useState("");
  const [search, setSearch] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(null);

  async function refresh() {
    const result = await loadAttendance(grade, date);
    setStudents(result.students); setStatuses(result.statuses); setHoliday(result.holiday); setHolidayTitle(result.holidayTitle);
    setSuccess(null); setMessage("");
  }
  useEffect(() => { refresh(); }, [grade, date]);
  const counts = useMemo(() => {
    const values = Object.values(statuses);
    return { present: values.filter(v=>v==="PRESENT").length, absent: values.filter(v=>v==="ABSENT").length, unmarked: students.length - values.filter(v=>v==="PRESENT" || v==="ABSENT").length };
  }, [statuses, students]);
  const filtered = students.filter(s => `${s.name} ${s.rollNo}`.toLowerCase().includes(search.toLowerCase()));
  const cycle = id => setStatuses(old => ({ ...old, [id]: old[id] === "PRESENT" ? "ABSENT" : old[id] === "ABSENT" ? undefined : "PRESENT" }));
  const allPresent = () => setStatuses(Object.fromEntries(students.map(s=>[s.id,"PRESENT"])));
  const reset = () => setStatuses({});
  async function handleSave() {
    if (!holiday && counts.unmarked > 0) { setMessage(`Please mark all students. ${counts.unmarked} student(s) are unmarked.`); return; }
    setBusy(true); setMessage("");
    try {
      const result = await saveAttendance({ grade, date, statuses, holiday, holidayTitle });
      setSuccess(result.holiday ? { holiday: true } : { holiday: false, ...counts, percentage: students.length ? counts.present / students.length * 100 : 0 });
    } catch (e) { setMessage(e.message || "Could not save attendance."); }
    finally { setBusy(false); }
  }

  if (success) return <div className="mx-auto max-w-xl"><div className="card p-7 text-center"><div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">{success.holiday ? <PartyPopper size={30}/> : <Check size={32}/>}</div><h1 className="mt-4 text-2xl font-bold">{success.holiday ? "Holiday Saved!" : "Attendance Saved!"}</h1><p className="mt-1 text-sm text-slate-500">{grade}-B · {formatDate(date)}</p>{success.holiday ? <p className="mt-5 text-lg font-semibold">{holidayTitle || "Holiday"}</p> : <><p className="mt-5 text-5xl font-bold text-emerald-600">{success.percentage.toFixed(1)}%</p><p className="text-sm text-slate-500">Today's attendance</p><div className="mt-6 grid grid-cols-3 gap-2"><div className="rounded-xl bg-emerald-50 p-3 dark:bg-emerald-950/40"><b className="text-emerald-700 dark:text-emerald-300">{success.present}</b><p className="text-xs text-slate-500">Present</p></div><div className="rounded-xl bg-rose-50 p-3 dark:bg-rose-950/40"><b className="text-rose-700 dark:text-rose-300">{success.absent}</b><p className="text-xs text-slate-500">Absent</p></div><div className="rounded-xl bg-slate-100 p-3 dark:bg-slate-800"><b>{students.length}</b><p className="text-xs text-slate-500">Total</p></div></div></>}<button className="btn btn-primary mt-7 w-full" onClick={()=>setSuccess(null)}>Back to Attendance</button></div></div>;

  return <div>
    <PageHeader title="Mark Attendance" subtitle="Select class and date, then mark every student Present or Absent."/>
    <div className="card mb-4 flex flex-wrap items-center justify-between gap-4"><ClassSwitch value={grade} onChange={setGrade}/><label className="flex items-center gap-2 text-sm font-medium"><CalendarDays size={17}/><input className="field" type="date" value={date} onChange={e=>setDate(e.target.value)}/></label></div>
    <div className="card mb-4">
      <label className="flex items-center gap-3"><input type="checkbox" checked={holiday} onChange={e=>setHoliday(e.target.checked)} className="h-4 w-4 accent-blue-600"/><span className="font-semibold">Mark this date as Holiday</span></label>
      {holiday && <input className="field mt-3 w-full" placeholder="Holiday name / reason (optional)" value={holidayTitle} onChange={e=>setHolidayTitle(e.target.value)}/>}
    </div>
    {!holiday && <>
      <div className="mb-4 grid grid-cols-3 gap-2"><div className="stat-mini"><b className="text-emerald-600">{counts.present}</b><span>Present</span></div><div className="stat-mini"><b className="text-rose-600">{counts.absent}</b><span>Absent</span></div><div className="stat-mini"><b className="text-amber-600">{counts.unmarked}</b><span>Unmarked</span></div></div>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2"><div className="relative min-w-[180px] flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={17}/><input className="field w-full pl-9" placeholder="Search roll number or name" value={search} onChange={e=>setSearch(e.target.value)}/></div><div className="flex gap-2"><button className="btn btn-secondary" onClick={allPresent}><CheckCheck size={16}/> All Present</button><button className="btn btn-secondary" onClick={reset}><RotateCcw size={16}/> Reset</button></div></div>
      <div className="card !p-0"><div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 dark:border-slate-800"><div><p className="font-semibold">{grade}-B Students</p><p className="text-xs text-slate-500">{students.length} students · {formatDate(date)}</p></div><span className="pill pill-blue">Tap to change status</span></div><div className="divide-y divide-slate-100 dark:divide-slate-800">{filtered.map(s=>{const st=statuses[s.id];return <div key={s.id} className="flex items-center justify-between gap-3 px-4 py-3"><div className="min-w-0"><p className="text-xs text-slate-500">Roll {s.rollNo}</p><p className="truncate text-sm font-semibold">{s.name}</p></div><button onClick={()=>cycle(s.id)} className={`min-w-[104px] rounded-xl px-3 py-2 text-xs font-bold ${st==="PRESENT"?"bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300":st==="ABSENT"?"bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300":"bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"}`}>{st==="PRESENT"?"Present":st==="ABSENT"?"Absent":"Unmarked"}</button></div>})}</div></div>
    </>}
    {message && <div className="mt-4 flex items-start gap-2 rounded-xl bg-rose-50 p-3 text-sm text-rose-700 dark:bg-rose-950/40 dark:text-rose-300"><AlertCircle size={18}/>{message}</div>}
    <div className="sticky bottom-20 mt-4 flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white/95 p-3 shadow-soft backdrop-blur dark:border-slate-800 dark:bg-slate-900/95 md:bottom-4"><div className="text-xs text-slate-500">{holiday ? "Holiday mode" : `${counts.unmarked} unmarked`}</div><button className="btn btn-primary" onClick={handleSave} disabled={busy || (!holiday && counts.unmarked > 0)}><Save size={17}/>{busy ? "Saving…" : holiday ? "Save Holiday" : "Save Attendance"}</button></div>
  </div>;
}
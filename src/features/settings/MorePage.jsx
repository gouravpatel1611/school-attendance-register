import { Link } from "react-router-dom";
import { CalendarDays, History, FileDown, Settings, Database, Download, ShieldCheck } from "lucide-react";
import PageHeader from "../../components/common/PageHeader";
import { holidayRepository } from "../../services/holidayRepository";
import { attendanceRepository } from "../../services/attendanceRepository";
import { studentRepository } from "../../services/studentRepository";
import { exportExcel, exportPDF } from "../../utils/export";
import { formatDate } from "../../utils/date";
import { useEffect, useState } from "react";

export default function MorePage() {
  const [holidays,setHolidays]=useState([]);
  const [date,setDate]=useState("");
  const [title,setTitle]=useState("");
  const [message,setMessage]=useState("");
  async function load(){setHolidays(await holidayRepository.list());}
  useEffect(()=>{load();},[]);
  async function addHoliday(){if(!date)return;await holidayRepository.save({date,title:title||"Holiday"});setDate("");setTitle("");setMessage("Holiday saved.");load();}
  async function backup(){
    const [students,attendance,holidayList]=await Promise.all([studentRepository.list(),attendanceRepository.list(),holidayRepository.list()]);
    const blob=new Blob([JSON.stringify({exportedAt:new Date().toISOString(),students,attendance,holidays:holidayList},null,2)],{type:"application/json"});
    const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download="school-attendance-backup.json";a.click();URL.revokeObjectURL(url);
  }
  return <div><PageHeader title="More" subtitle="History, holidays, data export and app settings."/>
    <div className="grid gap-3 sm:grid-cols-2">
      <Link to="/history" className="card flex items-center gap-3 hover:border-blue-300"><History className="text-blue-600"/><div><p className="font-semibold">Attendance Edit History</p><p className="muted">View attendance changes</p></div></Link>
      <div className="card flex items-center gap-3"><Settings className="text-blue-600"/><div><p className="font-semibold">Appearance</p><p className="muted">Use the theme button in the top bar</p></div></div>
      <div className="card flex items-center gap-3"><ShieldCheck className="text-blue-600"/><div><p className="font-semibold">Single Teacher Mode</p><p className="muted">One local teacher workspace</p></div></div>
      <div className="card flex items-center gap-3"><Database className="text-blue-600"/><div><p className="font-semibold">Local Database</p><p className="muted">IndexedDB · This browser/device</p></div></div>
    </div>
    <section className="card mt-4"><div className="flex items-center gap-2"><CalendarDays className="text-blue-600"/><h2 className="section-title">Holiday Management</h2></div><p className="muted mt-1">Mark dates as holidays. Sundays are automatically excluded from working days.</p><div className="mt-4 grid gap-3 sm:grid-cols-[1fr_1fr_auto]"><input className="field" type="date" value={date} onChange={e=>setDate(e.target.value)}/><input className="field" value={title} onChange={e=>setTitle(e.target.value)} placeholder="Holiday name"/><button className="btn btn-primary" onClick={addHoliday} disabled={!date}>Add Holiday</button></div>{message&&<p className="mt-2 text-sm text-emerald-600">{message}</p>}<div className="mt-4 divide-y dark:divide-slate-800">{holidays.sort((a,b)=>a.date.localeCompare(b.date)).map(h=><div key={h.date} className="flex items-center justify-between py-2 text-sm"><span>{formatDate(h.date)} · {h.title}</span><button className="text-xs font-semibold text-rose-600" onClick={async()=>{await holidayRepository.remove(h.date);load();}}>Remove</button></div>)}</div></section>
    <section className="card mt-4"><div className="flex items-center gap-2"><Download className="text-blue-600"/><h2 className="section-title">Data Backup</h2></div><p className="muted mt-1">Download a local JSON backup of student, attendance and holiday data.</p><button className="btn btn-secondary mt-4" onClick={backup}><FileDown size={16}/> Download Full Backup</button></section>
    <p className="mt-5 text-xs text-slate-400">School Attendance Register · Local-first edition</p>
  </div>;
}
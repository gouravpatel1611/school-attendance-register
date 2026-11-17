import { useEffect, useMemo, useState } from "react";
import { Download, FileSpreadsheet, FileText, Search } from "lucide-react";
import PageHeader from "../../components/common/PageHeader";
import ClassSwitch from "../../components/common/ClassSwitch";
import StatCard from "../../components/common/StatCard";
import { studentRepository } from "../../services/studentRepository";
import { attendanceRepository } from "../../services/attendanceRepository";
import { holidayRepository } from "../../services/holidayRepository";
import { historyRepository } from "../../services/historyRepository";
import { getAttendanceStats, getStudentPercentage } from "../../utils/attendance";
import { daysBetween, formatDate, isSunday, todayISO } from "../../utils/date";
import { exportExcel, exportPDF } from "../../utils/export";

export default function ReportsPage() {
  const [grade,setGrade]=useState("XI");
  const [tab,setTab]=useState("overview");
  const [from,setFrom]=useState(`${todayISO().slice(0,7)}-01`);
  const [to,setTo]=useState(todayISO());
  const [month,setMonth]=useState(todayISO().slice(0,7));
  const [students,setStudents]=useState([]);
  const [records,setRecords]=useState([]);
  const [holidays,setHolidays]=useState([]);
  const [stats,setStats]=useState(null);
  const [studentStats,setStudentStats]=useState([]);
  const [selectedStudent,setSelectedStudent]=useState(null);
  const [query,setQuery]=useState("");
  const [error,setError]=useState("");
  async function load(){
    if(from>to){setError("From Date must be before To Date.");return;}
    setError("");
    const [s,r,h,st]=await Promise.all([studentRepository.listByClass(grade),attendanceRepository.listByClass(grade),holidayRepository.list(),getAttendanceStats(grade,from,to)]);
    setStudents(s);setRecords(r);setHolidays(h);setStats(st);
    const monthFrom=`${month}-01`, monthTo=new Date(Number(month.slice(0,4)),Number(month.slice(5,7)),0).toISOString().slice(0,10);
    const items=await Promise.all(s.map(async student=>({student,...await getStudentPercentage(student.id,grade,monthFrom,monthTo)})));
    setStudentStats(items.sort((a,b)=>a.percentage-b.percentage));
  }
  useEffect(()=>{load();},[grade,from,to,month]);
  const days=daysBetween(from,to);
  const holidaySet=new Set(holidays.map(h=>h.date));
  const registerDays=days.filter(d=>!isSunday(d));
  const rows=students.map(s=>{
    const row={Roll:s.rollNo,Student:s.name};
    for(const d of days){const rec=records.find(r=>r.date===d);row[d]=holidaySet.has(d)||isSunday(d)?"H":rec?.statuses?.[s.id]==="PRESENT"?"P":rec?.statuses?.[s.id]==="ABSENT"?"A":"—";}
    return row;
  });
  const dailyRows=days.map(d=>{const rec=records.find(r=>r.date===d);const p=Object.values(rec?.statuses||{}).filter(x=>x==="PRESENT").length;const a=Object.values(rec?.statuses||{}).filter(x=>x==="ABSENT").length;return {Date:d,Day:new Date(`${d}T00:00:00`).toLocaleDateString("en-IN",{weekday:"short"}),Present:p,Absent:a,Holiday:holidaySet.has(d)?"Yes":"No"};});
  const absentStudents=students.filter(s=>records.some(r=>r.date>=from&&r.date<=to&&r.statuses?.[s.id]==="ABSENT"));
  const exportRows=tab==="register"?rows:tab==="daily"?dailyRows:studentStats.map(x=>({Roll:x.student.rollNo,Student:x.student.name,Present:x.present,Absent:x.absent,WorkingDays:x.workingDays,Percentage:`${x.percentage.toFixed(1)}%`}));
  const doExport=type=>type==="pdf"?exportPDF(`${grade}-B ${tab} Report`,exportRows,`${grade}-B-${tab}-report.pdf`):exportExcel(`${grade}-B-${tab}-report.xlsx`,exportRows);
  const nav=[["overview","Overview"],["daily","Daily Report"],["register","Monthly Register"],["students","Student Report"],["absent","Absent Report"]];
  return <div><PageHeader title="Reports" subtitle="Attendance summaries, registers and exports."/>
    <div className="card mb-4 flex flex-wrap items-center justify-between gap-3"><ClassSwitch value={grade} onChange={setGrade}/><div className="flex flex-wrap gap-2"><label className="text-xs text-slate-500">From <input className="field mt-1 block" type="date" value={from} onChange={e=>setFrom(e.target.value)}/></label><label className="text-xs text-slate-500">To <input className="field mt-1 block" type="date" value={to} onChange={e=>setTo(e.target.value)}/></label></div></div>
    {error&&<p className="mb-3 rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}
    <div className="mb-4 flex gap-2 overflow-x-auto pb-1">{nav.map(([id,label])=><button key={id} onClick={()=>setTab(id)} className={`tab-button ${tab===id?"tab-active":""}`}>{label}</button>)}</div>
    <div className="mb-4 flex flex-wrap justify-end gap-2"><button className="btn btn-secondary" onClick={()=>doExport("pdf")}><FileText size={16}/> PDF</button><button className="btn btn-secondary" onClick={()=>doExport("xlsx")}><FileSpreadsheet size={16}/> Excel</button></div>
    {tab==="overview"&&<><div className="grid grid-cols-2 gap-3 lg:grid-cols-4"><StatCard label="Attendance" value={`${stats?.percentage?.toFixed(1)||0}%`} note="Present ÷ possible student-days" /><StatCard label="Working Days" value={stats?.workingDays||0}/><StatCard label="Present Marks" value={stats?.present||0} tone="green"/><StatCard label="Absent Marks" value={stats?.absent||0} tone="red"/></div><div className="card mt-4"><h2 className="section-title">Report Period</h2><p className="muted mt-1">{formatDate(from)} to {formatDate(to)}</p><p className="mt-3 text-sm text-slate-600 dark:text-slate-300">Sundays and marked holidays are excluded from the working-day denominator. Unmarked days are not counted as present or absent.</p></div></>}
    {tab==="daily"&&<div className="table-wrap"><table><thead><tr><th>Date</th><th>Day</th><th>Present</th><th>Absent</th><th>Holiday</th></tr></thead><tbody>{dailyRows.map(r=><tr key={r.Date}><td>{formatDate(r.Date)}</td><td>{r.Day}</td><td className="text-emerald-600">{r.Present}</td><td className="text-rose-600">{r.Absent}</td><td>{r.Holiday}</td></tr>)}</tbody></table></div>}
    {tab==="register"&&<><div className="mb-2 flex items-center justify-between"><label className="text-sm">Month <input className="field ml-2" type="month" value={month} onChange={e=>{setMonth(e.target.value);setFrom(`${e.target.value}-01`);setTo(new Date(Number(e.target.value.slice(0,4)),Number(e.target.value.slice(5,7)),0).toISOString().slice(0,10));}}/></label><span className="muted">P = Present · A = Absent · H = Sunday/Holiday</span></div><div className="table-wrap"><table className="min-w-max"><thead><tr><th>Roll</th><th>Student</th>{daysBetween(`${month}-01`,new Date(Number(month.slice(0,4)),Number(month.slice(5,7)),0).toISOString().slice(0,10)).map(d=><th key={d}>{Number(d.slice(-2))}</th>)}</tr></thead><tbody>{students.map(s=><tr key={s.id}><td>{s.rollNo}</td><td className="sticky-name">{s.name}</td>{daysBetween(`${month}-01`,new Date(Number(month.slice(0,4)),Number(month.slice(5,7)),0).toISOString().slice(0,10)).map(d=>{const rec=records.find(r=>r.date===d);const v=holidaySet.has(d)||isSunday(d)?"H":rec?.statuses?.[s.id]==="PRESENT"?"P":rec?.statuses?.[s.id]==="ABSENT"?"A":"—";return <td key={d} className={v==="P"?"text-emerald-600":v==="A"?"text-rose-600":"text-slate-400"}>{v}</td>})}</tr>)}</tbody></table></div></>}
    {tab==="students"&&<><div className="card mb-3"><label className="text-sm font-medium">Select Month <input className="field ml-2" type="month" value={month} onChange={e=>setMonth(e.target.value)}/></label><p className="muted mt-2">Sorted by lowest attendance first. Sundays and holidays excluded.</p></div><div className="card !p-0">{studentStats.filter(x=>x.student.name.toLowerCase().includes(query.toLowerCase())||String(x.student.rollNo).includes(query)).map(x=><button key={x.student.id} onClick={()=>setSelectedStudent(selectedStudent?.student.id===x.student.id?null:x)} className="flex w-full items-center justify-between gap-3 border-b border-slate-100 px-4 py-3 text-left last:border-0 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/50"><div><p className="text-sm font-semibold">{x.student.name}</p><p className="text-xs text-slate-500">Roll {x.student.rollNo} · P {x.present} · A {x.absent}</p></div><span className={`pill ${x.percentage<75?"pill-red":"pill-green"}`}>{x.percentage.toFixed(1)}%</span></button>)}</div>{selectedStudent&&<div className="card mt-3"><h3 className="font-semibold">{selectedStudent.student.name} – {month}</h3><p className="muted mt-1">Present {selectedStudent.present} · Absent {selectedStudent.absent} · Working days {selectedStudent.workingDays}</p><p className="mt-2 text-2xl font-bold">{selectedStudent.percentage.toFixed(1)}%</p><div className="mt-4 grid grid-cols-7 gap-2">{daysBetween(`${month}-01`,new Date(Number(month.slice(0,4)),Number(month.slice(5,7)),0).toISOString().slice(0,10)).map(d=>{const rec=records.find(r=>r.date===d);const value=holidaySet.has(d)||isSunday(d)?"H":rec?.statuses?.[selectedStudent.student.id]==="PRESENT"?"P":rec?.statuses?.[selectedStudent.student.id]==="ABSENT"?"A":"—";return <div key={d} className="rounded-lg bg-slate-50 p-2 text-center dark:bg-slate-800"><p className="text-[10px] text-slate-500">{Number(d.slice(-2))}</p><p className={`mt-1 text-xs font-bold ${value==="P"?"text-emerald-600":value==="A"?"text-rose-600":"text-slate-400"}`}>{value}</p></div>})}</div></div>}</>}
    {tab==="absent"&&<div className="card"><h2 className="section-title">Students with absences</h2>{absentStudents.length?absentStudents.map(s=>{const count=records.filter(r=>r.date>=from&&r.date<=to&&r.statuses?.[s.id]==="ABSENT").length;return <div key={s.id} className="flex justify-between border-b py-3 text-sm dark:border-slate-800"><span>{s.name} <span className="text-slate-400">({s.rollNo})</span></span><b className="text-rose-600">{count} absent</b></div>}):<p className="muted mt-3">No absent records in this date range.</p>}</div>}
  </div>;
}
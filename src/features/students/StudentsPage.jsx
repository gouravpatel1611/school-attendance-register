import { useEffect, useMemo, useState } from "react";
import { Search, Users, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import PageHeader from "../../components/common/PageHeader";
import ClassSwitch from "../../components/common/ClassSwitch";
import { studentRepository } from "../../services/studentRepository";
import { getStudentPercentage } from "../../utils/attendance";
import { todayISO } from "../../utils/date";

export default function StudentsPage() {
  const [grade, setGrade] = useState("XI");
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");
  useEffect(() => { studentRepository.listByClass(grade).then(setStudents); }, [grade]);
  const visible = students.filter(s => (`${s.name} ${s.rollNo}`).toLowerCase().includes(search.toLowerCase()) && (filter === "ALL" || s.gender === filter));
  return <div><PageHeader title="Students" subtitle="Student directory and editable profiles." action={<span className="pill pill-blue">{students.length} Students</span>}/>
    <div className="card mb-4 flex flex-wrap items-center justify-between gap-3"><ClassSwitch value={grade} onChange={setGrade}/><select className="field w-36" value={filter} onChange={e=>setFilter(e.target.value)}><option value="ALL">All Gender</option><option value="FEMALE">Girls</option><option value="MALE">Boys</option></select></div>
    <div className="relative mb-3"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={17}/><input className="field w-full pl-9" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search by name or roll number"/></div>
    <div className="card !p-0"><div className="border-b border-slate-100 px-4 py-3 dark:border-slate-800"><p className="font-semibold">{grade}-B Student List</p><p className="text-xs text-slate-500">{visible.length} matching students</p></div>{visible.map(s=><Link to={`/students/${s.id}`} key={s.id} className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-3 last:border-0 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/50"><div className="flex min-w-0 items-center gap-3"><div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-blue-50 text-sm font-bold text-blue-700 dark:bg-blue-950 dark:text-blue-300">{String(s.rollNo).slice(-2)}</div><div className="min-w-0"><p className="truncate text-sm font-semibold">{s.name}</p><p className="text-xs text-slate-500">Roll No. {s.rollNo} · {s.gender === "MALE" ? "Boy" : "Girl"}</p></div></div><span className="text-slate-400">›</span></Link>)}</div>
  </div>;
}
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, MessageCircle, Save, FileDown } from "lucide-react";
import PageHeader from "../../components/common/PageHeader";
import { studentRepository } from "../../services/studentRepository";
import { updateStudentProfile } from "../../services/profileService";
import { attendanceRepository } from "../../services/attendanceRepository";
import { holidayRepository } from "../../services/holidayRepository";
import { getStudentPercentage } from "../../utils/attendance";
import { todayISO, formatDate } from "../../utils/date";
import { exportPDF, makeStudentReportRows, shareWhatsApp } from "../../utils/export";

const fields = [
  ["name","Student Name"],["fatherName","Father's Name"],["motherName","Mother's Name"],["parentPhone","Parent/Guardian Contact No."],["address","Address"],["dob","Date of Birth"]
];
export default function StudentProfilePage() {
  const { id } = useParams(); const navigate = useNavigate();
  const [student,setStudent] = useState(null); const [form,setForm] = useState({}); const [saved,setSaved] = useState(false); const [stats,setStats] = useState(null);
  useEffect(()=>{(async()=>{const s=await studentRepository.get(id);setStudent(s);setForm(s||{});if(s){const start=`${todayISO().slice(0,4)}-01-01`;setStats(await getStudentPercentage(s.id,s.class,start,todayISO()));}})();},[id]);
  if(!student) return <div className="card">Loading student profile…</div>;
  const update=(key,value)=>setForm(f=>({...f,[key]:value}));
  async function save(){const updated=await updateStudentProfile(id,form);setStudent(updated);setForm(updated);setSaved(true);setTimeout(()=>setSaved(false),2500);}
  async function report(whatsapp=false){
    const [records,holidays]=await Promise.all([attendanceRepository.list(),holidayRepository.list()]);
    const from=`${todayISO().slice(0,4)}-01-01`,to=todayISO();
    const rows=makeStudentReportRows(student,records,holidays,from,to);
    if(whatsapp){
      const present=rows.filter(r=>r.Status==="P").length, absent=rows.filter(r=>r.Status==="A").length, working=present+absent;
      const pct=working?present/working*100:0;
      const message=`Attendance Report\nStudent: ${student.name}\nClass: ${student.class}-B\nRoll No: ${student.rollNo}\nPeriod: ${formatDate(from)} to ${formatDate(to)}\nPresent: ${present}\nAbsent: ${absent}\nAttendance: ${pct.toFixed(1)}%\n\nRegards,\nSchool Administration`;
      try{shareWhatsApp(student.parentPhone,message);}catch(e){alert(e.message);}
    } else exportPDF(`${student.name} - Attendance Report`,rows.map(r=>({Date:r.Date,Status:r.Status})),`${student.id}-attendance.pdf`);
  }
  return <div><PageHeader title="Student Profile" subtitle={`${student.class}-B · Roll No. ${student.rollNo}`} action={<button className="btn btn-secondary" onClick={()=>navigate(-1)}><ArrowLeft size={16}/> Back</button>}/>
    <div className="grid gap-4 lg:grid-cols-[1fr_320px]"><section className="card"><div className="mb-4 flex items-center justify-between"><h2 className="section-title">Personal Details</h2>{saved&&<span className="pill pill-green">Saved</span>}</div><div className="grid gap-4 sm:grid-cols-2">{fields.map(([key,label])=><label key={key} className={key==="address"?"sm:col-span-2":""}><span className="label">{label}</span>{key==="address"?<textarea className="field min-h-20 w-full" value={form[key]||""} onChange={e=>update(key,e.target.value)}/>:<input className="field w-full" type={key==="dob"?"date":"text"} value={form[key]||""} onChange={e=>update(key,e.target.value)} placeholder={label}/>}</label>)}<label><span className="label">Gender</span><select className="field w-full" value={form.gender||"MALE"} onChange={e=>update("gender",e.target.value)}><option value="MALE">Boy</option><option value="FEMALE">Girl</option></select></label><label><span className="label">House</span><input className="field w-full" value={form.house||""} onChange={e=>update("house",e.target.value)} placeholder="House name"/></label></div><button className="btn btn-primary mt-5" onClick={save}><Save size={16}/> Save Profile</button></section>
      <aside className="space-y-4"><div className="card"><p className="text-sm text-slate-500">Attendance summary</p><p className="mt-2 text-3xl font-bold">{stats?.percentage?.toFixed(1)||"0.0"}%</p><p className="mt-1 text-xs text-slate-500">Current year · based on recorded working days</p><div className="mt-3 grid grid-cols-2 gap-2 text-sm"><div className="rounded-lg bg-emerald-50 p-2 dark:bg-emerald-950/40">Present: {stats?.present||0}</div><div className="rounded-lg bg-rose-50 p-2 dark:bg-rose-950/40">Absent: {stats?.absent||0}</div></div></div><div className="card"><h3 className="font-semibold">Share Attendance</h3><p className="muted mt-1">Current month summary. PDF downloads first; attach it manually in WhatsApp.</p><button className="btn btn-whatsapp mt-4 w-full" onClick={()=>report(true)}><MessageCircle size={17}/> Monthly WhatsApp + PDF</button><button className="btn btn-secondary mt-2 w-full" onClick={()=>report(false)}><FileDown size={17}/> Download PDF</button></div></aside>
    </div>
  </div>;
}
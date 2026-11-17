import { useEffect, useState } from "react";
import { History, ArrowRightLeft } from "lucide-react";
import PageHeader from "../../components/common/PageHeader";
import { historyRepository } from "../../services/historyRepository";
import { formatDate } from "../../utils/date";

export default function HistoryPage() {
  const [items,setItems]=useState([]);
  useEffect(()=>{historyRepository.list().then(setItems);},[]);
  return <div><PageHeader title="Attendance Edit History" subtitle="A record of status changes made while saving attendance."/><div className="card !p-0">{items.length?items.map(item=><div key={item.id} className="border-b border-slate-100 p-4 last:border-0 dark:border-slate-800"><div className="flex flex-wrap items-center justify-between gap-2"><p className="font-semibold">{item.studentName}</p><span className="text-xs text-slate-500">{new Date(item.changedAt).toLocaleString("en-IN")}</span></div><p className="mt-1 text-xs text-slate-500">{item.class}-B · Roll {item.rollNo} · {formatDate(item.date)}</p><div className="mt-3 flex items-center gap-2 text-sm"><span className="pill pill-slate">{item.oldStatus}</span><ArrowRightLeft size={15} className="text-slate-400"/><span className={`pill ${item.newStatus==="PRESENT"?"pill-green":"pill-red"}`}>{item.newStatus}</span></div></div>):<div className="p-8 text-center"><History className="mx-auto text-slate-300" size={32}/><p className="mt-3 font-semibold">No edit history yet</p><p className="muted mt-1">Changes will appear here after attendance is saved.</p></div>}</div></div>;
}
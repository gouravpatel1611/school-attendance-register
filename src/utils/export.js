import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { formatDate } from "./date";

export function exportExcel(filename, rows, sheetName = "Report") {
  const sheet = XLSX.utils.json_to_sheet(rows);
  const book = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(book, sheet, sheetName);
  XLSX.writeFile(book, filename.endsWith(".xlsx") ? filename : `${filename}.xlsx`);
}
export function exportPDF(title, rows, filename = "attendance-report.pdf") {
  const doc = new jsPDF({ orientation: "landscape" });
  doc.setFontSize(16);
  doc.text(title, 14, 16);
  if (rows.length) {
    autoTable(doc, { startY: 24, head: [Object.keys(rows[0])], body: rows.map(r => Object.values(r).map(v => String(v ?? ""))), styles: { fontSize: 8 } });
  }
  doc.save(filename);
}
export function shareWhatsApp(phone, message) {
  const digits = String(phone || "").replace(/\D/g, "");
  if (!digits) throw new Error("Please add a parent/guardian contact number in the student profile.");
  const normalized = digits.length === 10 ? `91${digits}` : digits;
  window.open(`https://wa.me/${normalized}?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
}
export function makeStudentReportRows(student, records, holidays, from, to) {
  const holidaySet = new Set(holidays.map(h => h.date));
  const rows = [];
  const start = new Date(`${from}T00:00:00`), end = new Date(`${to}T00:00:00`);
  for (const d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const date = d.toISOString().slice(0, 10);
    const rec = records.find(r => r.date === date && r.class === student.class);
    const status = holidaySet.has(date) || d.getDay() === 0 ? "H" : (rec?.statuses?.[student.id] === "PRESENT" ? "P" : rec?.statuses?.[student.id] === "ABSENT" ? "A" : "—");
    rows.push({ Date: formatDate(date), Status: status });
  }
  return rows;
}
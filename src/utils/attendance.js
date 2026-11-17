import { holidayRepository } from "../services/holidayRepository";
import { attendanceRepository } from "../services/attendanceRepository";
import { studentRepository } from "../services/studentRepository";
import { daysBetween, isSunday } from "./date";

export async function getAttendanceStats(grade, from, to) {
  const students = await studentRepository.listByClass(grade);
  const records = await attendanceRepository.listByClass(grade);
  const holidays = await holidayRepository.list();
  const holidayDates = new Set(holidays.map(h => h.date));
  const workingDates = daysBetween(from, to).filter(d => !isSunday(d) && !holidayDates.has(d));
  let present = 0, absent = 0;
  const byStudent = new Map(students.map(s => [s.id, { present: 0, absent: 0 }]));
  for (const record of records.filter(r => r.date >= from && r.date <= to && workingDates.includes(r.date))) {
    for (const [id, status] of Object.entries(record.statuses || {})) {
      if (status === "PRESENT") { present++; if (byStudent.has(id)) byStudent.get(id).present++; }
      if (status === "ABSENT") { absent++; if (byStudent.has(id)) byStudent.get(id).absent++; }
    }
  }
  const expected = students.length * workingDates.length;
  return { students, present, absent, workingDays: workingDates.length, percentage: expected ? (present / expected) * 100 : 0, byStudent };
}

export async function getStudentPercentage(studentId, grade, from, to) {
  const stats = await getAttendanceStats(grade, from, to);
  const item = stats.byStudent.get(studentId) || { present: 0, absent: 0 };
  const workingDays = stats.workingDays;
  return { ...item, workingDays, percentage: workingDays ? item.present / workingDays * 100 : 0 };
}
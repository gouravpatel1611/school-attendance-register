import { attendanceRepository } from "./attendanceRepository";
import { historyRepository } from "./historyRepository";
import { holidayRepository } from "./holidayRepository";
import { studentRepository } from "./studentRepository";

export async function loadAttendance(grade, date) {
  const [students, record, holiday] = await Promise.all([
    studentRepository.listByClass(grade),
    attendanceRepository.get(grade, date),
    holidayRepository.get(date),
  ]);
  return { students, statuses: record?.statuses || {}, holiday: Boolean(holiday), holidayTitle: holiday?.title || "" };
}

export async function saveAttendance({ grade, date, statuses, holiday, holidayTitle }) {
  if (holiday) {
    await holidayRepository.save({ date, title: holidayTitle || "Holiday" });
    const existing = await attendanceRepository.get(grade, date);
    if (existing) {
      await attendanceRepository.save({ ...existing, statuses: {}, holiday: true });
    }
    return { holiday: true };
  }
  const students = await studentRepository.listByClass(grade);
  const unmarked = students.filter(s => !statuses[s.id]).length;
  if (unmarked) throw new Error(`Please mark all students. ${unmarked} student(s) are unmarked.`);
  await holidayRepository.remove(date);
  const previous = await attendanceRepository.get(grade, date);
  const next = { class: grade, section: "B", date, statuses, holiday: false, updatedAt: new Date().toISOString() };
  await attendanceRepository.save(next);
  for (const student of students) {
    const oldStatus = previous?.statuses?.[student.id] || "UNMARKED";
    const newStatus = statuses[student.id];
    if (oldStatus !== newStatus) {
      await historyRepository.add({ class: grade, date, studentId: student.id, studentName: student.name, rollNo: student.rollNo, oldStatus, newStatus });
    }
  }
  return { holiday: false };
}
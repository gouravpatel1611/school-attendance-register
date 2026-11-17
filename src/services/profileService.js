import { studentRepository } from "./studentRepository";
export async function updateStudentProfile(id, changes) {
  const existing = await studentRepository.get(id);
  if (!existing) throw new Error("Student not found");
  const updated = { ...existing, ...changes, id, rollNo: Number(changes.rollNo ?? existing.rollNo) };
  await studentRepository.save(updated);
  return updated;
}
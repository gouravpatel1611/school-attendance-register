import Dexie from "dexie";

export const db = new Dexie("SchoolAttendanceRegister");
db.version(1).stores({
  students: "&id, rollNo, name, class, section, gender",
  attendance: "++id, &[class+date], class, date",
  holidays: "&date, title",
  history: "++id, class, date, studentId, changedAt",
  settings: "&key",
});
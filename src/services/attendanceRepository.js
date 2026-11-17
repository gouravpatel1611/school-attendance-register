import { db } from "../database/db";

export const attendanceRepository = {
  get: (grade, date) => db.attendance.where("[class+date]").equals([grade, date]).first(),
  save: async (record) => {
    const existing = await db.attendance.where("[class+date]").equals([record.class, record.date]).first();
    const payload = { ...record, id: existing?.id };
    await db.attendance.put(payload);
    return payload;
  },
  list: () => db.attendance.toArray(),
  listByClass: (grade) => db.attendance.where("class").equals(grade).toArray(),
};
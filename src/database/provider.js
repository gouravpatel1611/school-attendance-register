import { db } from "./db";
import { initialStudents } from "../data/students";

export async function initializeDatabase() {
  const count = await db.students.count();
  if (count === 0) {
    await db.students.bulkAdd(initialStudents);
  }
  const setting = await db.settings.get("schemaVersion");
  if (!setting) await db.settings.put({ key: "schemaVersion", value: 1 });
}

// Future Firebase adapter can be selected here while preserving feature service APIs.
export const dataProvider = "indexeddb";
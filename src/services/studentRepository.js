import { db } from "../database/db";

export const studentRepository = {
  list: () => db.students.orderBy("rollNo").toArray(),
  listByClass: (grade) => db.students.where("class").equals(grade).sortBy("rollNo"),
  get: (id) => db.students.get(id),
  save: (student) => db.students.put(student),
};
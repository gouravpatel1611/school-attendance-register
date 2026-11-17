import { db } from "../database/db";
export const historyRepository = {
  add: (entry) => db.history.add({ ...entry, changedAt: new Date().toISOString() }),
  list: () => db.history.orderBy("changedAt").reverse().toArray(),
};
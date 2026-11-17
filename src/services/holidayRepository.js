import { db } from "../database/db";
export const holidayRepository = {
  get: (date) => db.holidays.get(date),
  list: () => db.holidays.toArray(),
  save: (holiday) => db.holidays.put(holiday),
  remove: (date) => db.holidays.delete(date),
};
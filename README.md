# School Attendance Register

A mobile-first React + Vite attendance register for XI-B and XII-B, initially using browser-local IndexedDB storage.

## Requirements
- Node.js 18.18+ (Node 20 LTS recommended)
- npm

## Run locally
```bash
npm install
npm run dev
```
Open the local URL printed by Vite (usually http://localhost:5173).

## Production build
```bash
npm run build
npm run preview
```

## Included
- Dashboard and five-tab mobile navigation
- XI-B / XII-B student master list (72 supplied students)
- Editable student profiles
- Present/Absent attendance with Unmarked -> Present -> Absent cycling
- All Present, Reset, save validation and holiday marking
- Attendance edit history
- Daily, monthly register, student, absent and custom date-range reports
- 75% low-attendance alerts
- PDF and Excel exports
- Parent WhatsApp message/report sharing (opens WhatsApp with a prefilled message; user confirms Send)
- IndexedDB through Dexie
- Repository/service boundary intended to make a future Firebase adapter possible

## Data notes
- Supplied student names, IDs, roll numbers, classes and genders are preloaded.
- Parent contact, parent names, address, DOB and house are blank until edited.
- First launch seeds the 72 students into IndexedDB.
- Browser storage is local to that browser/device. Use the export features and regular backups; clearing site data can erase local records.
- No real data is transmitted to WhatsApp automatically. WhatsApp opens with a prefilled message and the user must tap Send.
- This is a single-teacher local-first version. Authentication and multi-teacher support are not included.

## Future Firebase migration
UI components call feature services/repositories, not Dexie directly. Add a Firebase repository implementing the same repository methods and configure the data provider in `src/database/provider.js`; migrate existing IndexedDB data separately before switching providers.

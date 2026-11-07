# Saathi Field - Run and reviewer guide

## Where the project stands

- Source code is published at <https://github.com/abrarmaniyar7090/saathi-field>.
- The app is local-only at `http://127.0.0.1:8787`. It has no public demo URL.
- The app uses synthetic sample records. Phone, reminder, payment, and map actions are demonstrations; no call, SMS, or payment is sent.
- This is a review pilot, not a production collections system. Do not expose the local server to the internet or enter real borrower data.

## Run the app step by step

1. Install Python 3.11 or later.
2. Open PowerShell at the project workspace. Enter the source folder and start the server:

   ```powershell
   cd dealership
   python server.py
   ```

3. Open `http://127.0.0.1:8787` in Chrome, Edge, or Firefox. On the first run, SQLite is created in `data/` and the three sample loans and demo accounts are seeded.
4. Choose a role on the sign-in screen, then select **Sign in**. The demo account buttons fill the matching email and password.
5. As Rahul, review today's assigned account, its priority reasons, and the score explanation. Use **Map** to open the demo pincode search. The **Log call** control records only a mock attempt.
6. Open **Promises** to review upcoming, due, and past promise dates. Reminder text is a preview; logging a reminder never sends a message.
7. To try offline outcome capture, do this between 8:00 am and 7:00 pm India time: load the officer's list, switch the browser to offline mode, save an outcome, then restore connectivity. It remains in an IndexedDB outbox until it syncs. The server checks the event timestamp is recent and within the permitted hours; because offline timestamps come from the device clock, a production system needs trusted device time or server-verifiable evidence.
8. Sign out and choose the branch manager account. Open **CSV import**, select **Try demo CSV**, then **Import and assign**. Check the row count, then open **Manager view** to review branch DPD buckets, the brief's 22% baseline and 16% target, broken promises, and the outcome back-test area.
9. Run the automated logic checks from the source folder:

   ```powershell
   python -m unittest discover -s tests -v
   ```

10. Stop the local server with `Ctrl+C` in its PowerShell window.

Calls and reminders are disabled outside the 8:00 am to 7:00 pm India time window. This is expected behavior. The browser and server both enforce the window for online contact attempts.

## Demo accounts

| Role | Email | Password |
|---|---|---|
| Field officer - Rahul | `rahul@demo.local` | `FieldDemo2026!` |
| Field officer - Neha | `neha@demo.local` | `FieldDemo2026!` |
| Field officer - Imran | `imran@demo.local` | `FieldDemo2026!` |
| Branch manager | `manager@demo.local` | `ManagerDemo2026!` |

These public synthetic credentials are for local review only. Never reuse them for a real lender or shared internet deployment.

## Optional local settings

- `HOST` - bind address; defaults to `127.0.0.1`.
- `PORT` - local port; defaults to `8787`.
- `SAATHI_DB_PATH` - SQLite file path; defaults to `data/saathi.sqlite3`.
- `COOKIE_SECURE` - set to `1` only behind correctly configured HTTPS.

The local app has no API keys or third-party runtime dependencies.

## Before a real pilot

1. Share the public source repository at <https://github.com/abrarmaniyar7090/saathi-field> for code review.
2. Decide whether a hosted demo is required. If it is, use a TLS-enabled deployment, persistent managed storage, real identity management, and backups. The present server uses SQLite and Python's `ThreadingHTTPServer`; it is not a production stack.
3. Scope each manager to approved branches, replace demo passwords, migrate to a maintained database such as PostgreSQL, add secret management, and review the audit and retention policy.
4. Test offline sync against trusted device time and conflict handling before real officers use it. Current offline event time is device-reported.
5. Connect real loan, payment, SMS, or telephony systems only after the client's data contracts, consent rules, security review, and audit requirements are approved.

## Submission packaging

The requested ZIP contains exactly two files at its root: the Technical Design Document PDF and this `deployment.md`. The source repository is public at <https://github.com/abrarmaniyar7090/saathi-field>. Add a hosted app URL only if one is actually deployed and reviewable. The brief gives a seven-day completion window but does not state the opening date; confirm that date in the original task notice.

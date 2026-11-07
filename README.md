# Saathi Field

A small, Hindi-first collections pilot for the MSME field-collections brief. The complete core flow is implemented with a dependency-free Python HTTP server, SQLite, role-based sign-in, an offline outcome outbox, CSV assignment, a transparent priority score, promise tracking and a branch-manager view.

Source code: <https://github.com/abrarmaniyar7090/saathi-field>.

## Run locally

```powershell
cd dealership
python server.py
```

Open <http://127.0.0.1:8787>. The app seeds a local SQLite database on first run. No package installation, API key or external service is required. See [deployment.md](deployment.md) for the full demo walkthrough and account details.

## Test the important logic

```powershell
python -m unittest discover -s tests -v
```

## Demo accounts

The sign-in screen can fill either account for you. Public demo passwords are for this isolated pilot only; replace them and set up real identity management before any shared deployment.

- Field officer: `rahul@demo.local` / `FieldDemo2026!`
- Branch manager: `manager@demo.local` / `ManagerDemo2026!`

## Scope

Included: overdue CSV import with pincode/workload assignment, officer priority list with reasons, outcome logging with GPS and offline queue, promise tracker, bilingual approved reminder preview, contact-hour enforcement, and manager roll-rate/back-test dashboard.

Outside this pilot: payment collection, telephony/SMS integration, a real collection-system import, maps data, multi-device offline conflict resolution, full enterprise identity, production hosting, and trained-model calibration. All contact and payment actions in the demo are mocked.


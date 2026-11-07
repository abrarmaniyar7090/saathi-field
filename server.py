"""Saathi Field pilot: dependency-free collections workflow server.

Run with: python server.py
"""
from __future__ import annotations

import csv
import hashlib
import hmac
import io
import json
import os
import re
import secrets
import sqlite3
import threading
import time
import uuid
from contextlib import contextmanager
from datetime import date, datetime, timedelta
from http import HTTPStatus
from http.cookies import SimpleCookie
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from typing import Any
from urllib.parse import parse_qs, unquote, urlparse
from zoneinfo import ZoneInfo


ROOT = Path(__file__).resolve().parent
PUBLIC = ROOT / "public"
DB_PATH = Path(os.environ.get("SAATHI_DB_PATH", ROOT / "data" / "saathi.sqlite3"))
PORT = int(os.environ.get("PORT", "8787"))
TZ = ZoneInfo("Asia/Kolkata")
COOKIE_SECURE = os.environ.get("COOKIE_SECURE", "0") == "1"
MAX_BODY = 1_100_000
MAX_CSV_ROWS = 1000
SESSION_HOURS = 12
LOGIN_ATTEMPTS: dict[str, list[float]] = {}
LOGIN_LOCK = threading.Lock()


SCHEMA = """
PRAGMA foreign_keys = ON;
CREATE TABLE IF NOT EXISTS branches (
  id TEXT PRIMARY KEY, name TEXT NOT NULL, pin_prefix TEXT NOT NULL UNIQUE
);
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY, email TEXT NOT NULL UNIQUE, name TEXT NOT NULL,
  role TEXT NOT NULL CHECK(role IN ('officer','manager')),
  branch_id TEXT REFERENCES branches(id), password_salt BLOB NOT NULL,
  password_hash BLOB NOT NULL, active INTEGER NOT NULL DEFAULT 1
);
CREATE TABLE IF NOT EXISTS sessions (
  token_hash TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id),
  csrf_token TEXT NOT NULL, expires_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS loans (
  id TEXT PRIMARY KEY, borrower TEXT NOT NULL, product TEXT NOT NULL DEFAULT 'Business loan',
  outstanding INTEGER NOT NULL CHECK(outstanding >= 0), dpd INTEGER NOT NULL CHECK(dpd >= 0),
  promise_date TEXT, pincode TEXT NOT NULL, branch_id TEXT NOT NULL REFERENCES branches(id),
  officer_id TEXT NOT NULL REFERENCES users(id), broken_promises INTEGER NOT NULL DEFAULT 0,
  missed_payments_90d INTEGER NOT NULL DEFAULT 0, payment_ratio REAL NOT NULL DEFAULT 0.7,
  status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active','promise','dispute','paid')),
  priority_override INTEGER, override_reason TEXT, imported_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS outcomes (
  id TEXT PRIMARY KEY, client_event_id TEXT NOT NULL UNIQUE, loan_id TEXT NOT NULL REFERENCES loans(id),
  officer_id TEXT NOT NULL REFERENCES users(id), kind TEXT NOT NULL
    CHECK(kind IN ('paid','promise','not_reachable','dispute','call_attempt','reminder')),
  amount_collected INTEGER NOT NULL DEFAULT 0, promise_date TEXT, note TEXT NOT NULL DEFAULT '',
  latitude REAL, longitude REAL, logged_at TEXT NOT NULL, created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS audit_log (
  id TEXT PRIMARY KEY, actor_id TEXT NOT NULL REFERENCES users(id), action TEXT NOT NULL,
  entity_type TEXT NOT NULL, entity_id TEXT NOT NULL, details TEXT NOT NULL,
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_loans_officer ON loans(officer_id, status);
CREATE INDEX IF NOT EXISTS idx_loans_branch ON loans(branch_id, status);
CREATE INDEX IF NOT EXISTS idx_outcomes_loan ON outcomes(loan_id, logged_at DESC);
CREATE INDEX IF NOT EXISTS idx_outcomes_time ON outcomes(logged_at DESC);
"""


def now() -> datetime:
    return datetime.now(TZ).replace(microsecond=0)


def iso_now() -> str:
    return now().isoformat()


def today() -> date:
    return now().date()


@contextmanager
def connect():
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(DB_PATH, timeout=5)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    conn.execute("PRAGMA journal_mode = WAL")
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()


def password_record(password: str, salt: bytes | None = None) -> tuple[bytes, bytes]:
    salt = salt or secrets.token_bytes(16)
    digest = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, 220_000)
    return salt, digest


def score_loan(loan: dict[str, Any]) -> dict[str, Any]:
    """Explainable v1 priority model. Score is advisory, not a recovery decision."""
    dpd = max(0, min(int(loan.get("dpd", 0)), 30))
    amount = max(0, int(loan.get("outstanding", 0)))
    broken = max(0, int(loan.get("broken_promises", 0)))
    missed = max(0, min(int(loan.get("missed_payments_90d", 0)), 3))
    ratio = max(0.0, min(float(loan.get("payment_ratio", 0.7)), 1.0))
    factors = [
        ("days_past_due", 30 * dpd / 30, "Days past due", "बकाया दिन", f"{int(loan.get('dpd', 0))} days overdue", f"{int(loan.get('dpd', 0))} दिन बकाया"),
        ("outstanding", 15 * min(amount / 700_000, 1), "Outstanding", "बकाया राशि", f"₹{amount:,.0f} outstanding", f"₹{amount:,.0f} बकाया"),
        ("broken_promise", 25 * min(broken / 1, 1), "Broken promise", "टूटा वादा", "Promise date has passed" if broken else "No broken promise recorded", "वादे की तारीख निकल गई" if broken else "कोई दर्ज टूटा वादा नहीं"),
        ("missed_payments", 20 * min(missed / 3, 1), "Payment history", "भुगतान इतिहास", f"{missed} missed in 90 days", f"पिछले 90 दिनों में {missed} छूटी किस्तें"),
        ("payment_regularity", 10 * (1 - ratio), "Payment regularity", "भुगतान नियमितता", f"{ratio:.0%} payment regularity", f"भुगतान नियमितता {ratio:.0%}"),
    ]
    raw = min(100, max(0, round(sum(item[1] for item in factors))))
    reason_factors = sorted(factors, key=lambda item: item[1], reverse=True)[:3]
    labels = [item[4] for item in reason_factors if item[1] > 0]
    if len(labels) < 3:
        labels.extend(item[4] for item in factors if item[1] == 0 and item[4] not in labels)
    labels_hi = [item[5] for item in reason_factors if item[1] > 0]
    if len(labels_hi) < 3:
        labels_hi.extend(item[5] for item in factors if item[1] == 0 and item[5] not in labels_hi)
    override = loan.get("priority_override")
    return {
        "score": raw,
        "effective_score": int(override) if override is not None else raw,
        "band": "high" if raw >= 65 else "medium" if raw >= 40 else "low",
        "reasons": labels[:3],
        "reasons_hi": labels_hi[:3],
        "factors": [{"key": key, "label": label, "label_hi": label_hi, "points": round(points, 1), "detail": detail, "detail_hi": detail_hi} for key, points, label, label_hi, detail, detail_hi in factors],
        "override_reason": loan.get("override_reason"),
    }


def contact_window_status(at: datetime | None = None) -> dict[str, Any]:
    at = at or now()
    local = at.astimezone(TZ)
    opened = local.replace(hour=8, minute=0, second=0, microsecond=0)
    closed = local.replace(hour=19, minute=0, second=0, microsecond=0)
    allowed = opened <= local < closed
    next_open = opened if local < opened else opened + timedelta(days=1)
    return {"allowed": allowed, "local_time": local.isoformat(), "next_open": next_open.isoformat()}


def password_matches(password: str, salt: bytes, expected: bytes) -> bool:
    return hmac.compare_digest(password_record(password, salt)[1], expected)


def audit(conn: sqlite3.Connection, actor: str, action: str, entity_type: str, entity_id: str, details: dict[str, Any]) -> None:
    conn.execute(
        "INSERT INTO audit_log(id,actor_id,action,entity_type,entity_id,details,created_at) VALUES(?,?,?,?,?,?,?)",
        (str(uuid.uuid4()), actor, action, entity_type, entity_id, json.dumps(details, ensure_ascii=False), iso_now()),
    )


def assign_officer(conn: sqlite3.Connection, branch_id: str) -> sqlite3.Row | None:
    officers = conn.execute("SELECT id,name FROM users WHERE role='officer' AND active=1 AND branch_id=? ORDER BY id", (branch_id,)).fetchall()
    if not officers:
        return None
    workloads = {
        row["officer_id"]: row["n"]
        for row in conn.execute("SELECT officer_id,COUNT(*) n FROM loans WHERE status IN ('active','promise','dispute') GROUP BY officer_id")
    }
    return min(officers, key=lambda user: (workloads.get(user["id"], 0), user["id"]))


def init_db() -> None:
    with connect() as conn:
        conn.executescript(SCHEMA)
        if conn.execute("SELECT COUNT(*) FROM users").fetchone()[0]:
            return
        branches = [
            ("indore-central", "इंदौर · सेंट्रल / Indore Central", "452"),
            ("indore-east", "इंदौर · ईस्ट / Indore East", "453"),
            ("indore-west", "इंदौर · वेस्ट / Indore West", "454"),
        ]
        conn.executemany("INSERT INTO branches(id,name,pin_prefix) VALUES(?,?,?)", branches)
        accounts = [
            ("rahul", "rahul@demo.local", "Rahul Chouhan", "officer", "indore-central", "FieldDemo2026!"),
            ("a_demo", "asha@demo.local", "Asha Rao (demo)", "officer", "indore-central", "FieldDemo2026!"),
            ("neha", "neha@demo.local", "Neha Solanki", "officer", "indore-east", "FieldDemo2026!"),
            ("b_demo", "kabir@demo.local", "Kabir Shah (demo)", "officer", "indore-east", "FieldDemo2026!"),
            ("imran", "imran@demo.local", "Imran Qureshi", "officer", "indore-west", "FieldDemo2026!"),
            ("c_demo", "farah@demo.local", "Farah Khan (demo)", "officer", "indore-west", "FieldDemo2026!"),
            ("manager", "manager@demo.local", "Branch Manager Demo", "manager", "indore-central", "ManagerDemo2026!"),
        ]
        for uid, email, name, role, branch_id, password in accounts:
            salt, digest = password_record(password)
            conn.execute(
                "INSERT INTO users(id,email,name,role,branch_id,password_salt,password_hash) VALUES(?,?,?,?,?,?,?)",
                (uid, email, name, role, branch_id, salt, digest),
            )
        loans = [
            ("LN-10293", "Company B (packaging unit)", 640000, 12, "2026-11-05", "452001", "indore-central", "rahul", 0, 1, 0.67),
            ("LN-10871", "Company C (fertiliser shop)", 310000, 27, None, "453001", "indore-east", "neha", 0, 3, 0.40),
            ("LN-11930", "Company D (printing press)", 220000, 19, "2026-10-31", "454001", "indore-west", "imran", 1, 2, 0.50),
        ]
        stamp = iso_now()
        conn.executemany(
            """INSERT INTO loans(id,borrower,outstanding,dpd,promise_date,pincode,branch_id,officer_id,
               broken_promises,missed_payments_90d,payment_ratio,imported_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)""",
            [(*loan, stamp) for loan in loans],
        )
        conn.execute("PRAGMA user_version=1")


def parse_csv_rows(csv_text: str) -> list[dict[str, str]]:
    if len(csv_text.encode("utf-8")) > MAX_BODY:
        raise ValueError("CSV is larger than 1 MB")
    reader = csv.DictReader(io.StringIO(csv_text.lstrip("\ufeff")))
    required = {"loan_id", "borrower", "outstanding", "dpd", "pincode"}
    headers = {str(h or "").strip().lower() for h in (reader.fieldnames or [])}
    if not required.issubset(headers):
        raise ValueError("CSV needs loan_id, borrower, outstanding, dpd and pincode columns")
    rows = []
    for index, raw in enumerate(reader, start=2):
        if index > MAX_CSV_ROWS + 1:
            raise ValueError(f"CSV is limited to {MAX_CSV_ROWS} rows")
        row = {str(k or "").strip().lower(): str(v or "").strip() for k, v in raw.items()}
        if not any(row.values()):
            continue
        rows.append(row)
    if not rows:
        raise ValueError("CSV has no data rows")
    return rows


def validate_import_row(row: dict[str, str], row_number: int) -> dict[str, Any]:
    loan_id = row.get("loan_id", "").upper()
    borrower = row.get("borrower", "")
    pincode = row.get("pincode", "")
    if not re.fullmatch(r"[A-Z0-9-]{4,24}", loan_id):
        raise ValueError(f"Row {row_number}: loan_id must be 4-24 letters, numbers or hyphens")
    if not borrower or len(borrower) > 160:
        raise ValueError(f"Row {row_number}: borrower is required and must be at most 160 characters")
    if not re.fullmatch(r"\d{6}", pincode):
        raise ValueError(f"Row {row_number}: pincode must contain 6 digits")
    try:
        outstanding = int(row.get("outstanding", ""))
        dpd = int(row.get("dpd", ""))
        broken = int(row.get("broken_promises", "0") or 0)
        missed = int(row.get("missed_payments_90d", "0") or 0)
        ratio = float(row.get("payment_ratio", "0.7") or 0.7)
    except ValueError as error:
        raise ValueError(f"Row {row_number}: amount, DPD and payment history must be numeric") from error
    if outstanding <= 0 or outstanding > 100_000_000:
        raise ValueError(f"Row {row_number}: outstanding must be between ₹1 and ₹10 crore")
    if dpd < 1 or dpd > 3650 or broken < 0 or broken > 100 or missed < 0 or missed > 90 or not 0 <= ratio <= 1:
        raise ValueError(f"Row {row_number}: DPD or payment history is outside the allowed range")
    promise = row.get("promise_date", "") or None
    if promise:
        try:
            date.fromisoformat(promise)
        except ValueError as error:
            raise ValueError(f"Row {row_number}: promise_date must use YYYY-MM-DD") from error
    return {
        "loan_id": loan_id, "borrower": borrower, "outstanding": outstanding, "dpd": dpd,
        "pincode": pincode, "promise_date": promise,
        "broken_promises": broken, "missed_payments_90d": missed, "payment_ratio": ratio,
        "product": (row.get("product") or "Business loan")[:80],
    }


def make_reminder(loan: dict[str, Any], language: str = "hi") -> str:
    if language == "en":
        return (f"Hello, this is a courtesy reminder about loan account {loan['id']}. "
                "Please contact your branch at a convenient time to discuss your account. "
                "No action is required outside permitted contact hours.")
    return (f"नमस्ते, यह ऋण खाते {loan['id']} के बारे में एक विनम्र अनुस्मारक है। "
            "कृपया अपनी सुविधा के समय शाखा से संपर्क करें। "
            "अनुमत संपर्क समय के बाहर किसी कार्रवाई की आवश्यकता नहीं है।")


def serialise_user(user: sqlite3.Row | dict[str, Any]) -> dict[str, Any]:
    return {"id": user["id"], "name": user["name"], "email": user["email"], "role": user["role"], "branch_id": user["branch_id"]}


class APIError(Exception):
    def __init__(self, status: int, message: str):
        super().__init__(message)
        self.status = status
        self.message = message


class Handler(BaseHTTPRequestHandler):
    server_version = "SaathiPilot/1.0"

    def log_message(self, fmt: str, *args: Any) -> None:
        # Keep console output useful without logging borrower details or request bodies.
        print(f"{self.log_date_time_string()} {self.address_string()} {fmt % args}")

    def do_GET(self) -> None:
        self._dispatch("GET")

    def do_POST(self) -> None:
        self._dispatch("POST")

    def do_PATCH(self) -> None:
        self._dispatch("PATCH")

    def do_HEAD(self) -> None:
        self._dispatch("HEAD")

    def _dispatch(self, method: str) -> None:
        try:
            self.path_info = urlparse(self.path)
            if self.path_info.path.startswith("/api/"):
                self.handle_api(method)
            else:
                self.handle_static(method)
        except APIError as error:
            self.send_json(error.status, {"error": error.message})
        except (ValueError, json.JSONDecodeError) as error:
            self.send_json(HTTPStatus.BAD_REQUEST, {"error": str(error) or "Invalid request"})
        except Exception as error:
            print(f"Request failed: {type(error).__name__}")
            self.send_json(HTTPStatus.INTERNAL_SERVER_ERROR, {"error": "Something went wrong. Try again."})

    def send_bytes(self, status: int, body: bytes, content_type: str, headers: dict[str, Any] | None = None) -> None:
        self.send_response(status)
        self.send_header("Content-Type", content_type)
        self.send_header("Content-Length", str(len(body)))
        self.send_header("X-Content-Type-Options", "nosniff")
        self.send_header("Referrer-Policy", "strict-origin-when-cross-origin")
        self.send_header("Content-Security-Policy", "default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'")
        cache_control = headers.get("Cache-Control") if headers else None
        self.send_header("Cache-Control", cache_control or ("no-store" if content_type.startswith("application/json") else "public, max-age=300"))
        if headers:
            for name, value in headers.items():
                if name.lower() == "cache-control":
                    continue
                for header_value in value if isinstance(value, (list, tuple)) else (value,):
                    self.send_header(name, header_value)
        self.end_headers()
        if self.command != "HEAD":
            self.wfile.write(body)

    def send_json(self, status: int, data: Any, headers: dict[str, str] | None = None) -> None:
        self.send_bytes(int(status), json.dumps(data, ensure_ascii=False).encode("utf-8"), "application/json; charset=utf-8", headers)

    def read_json(self) -> dict[str, Any]:
        try:
            length = int(self.headers.get("Content-Length", "0"))
        except ValueError as error:
            raise APIError(400, "Invalid content length") from error
        if length <= 0 or length > MAX_BODY:
            raise APIError(413 if length > MAX_BODY else 400, "Request must contain valid JSON under 1 MB")
        try:
            value = json.loads(self.rfile.read(length).decode("utf-8"))
        except (UnicodeDecodeError, json.JSONDecodeError) as error:
            raise APIError(400, "Invalid JSON") from error
        if not isinstance(value, dict):
            raise APIError(400, "JSON object required")
        return value

    def cookie_value(self, name: str) -> str | None:
        jar = SimpleCookie()
        try:
            jar.load(self.headers.get("Cookie", ""))
        except Exception:
            return None
        return jar[name].value if name in jar else None

    def current_user(self, conn: sqlite3.Connection) -> tuple[sqlite3.Row | None, sqlite3.Row | None]:
        token = self.cookie_value("saathi_session")
        if not token:
            return None, None
        digest = hashlib.sha256(token.encode()).hexdigest()
        row = conn.execute("SELECT * FROM sessions WHERE token_hash=? AND expires_at>?", (digest, iso_now())).fetchone()
        if not row:
            return None, None
        user = conn.execute("SELECT * FROM users WHERE id=? AND active=1", (row["user_id"],)).fetchone()
        return user, row

    def require_user(self, conn: sqlite3.Connection, roles: tuple[str, ...] | None = None) -> tuple[sqlite3.Row, sqlite3.Row]:
        user, session = self.current_user(conn)
        if not user or not session:
            raise APIError(401, "Sign in to continue")
        if roles and user["role"] not in roles:
            raise APIError(403, "Your role cannot access this screen")
        return user, session

    def require_csrf(self, session: sqlite3.Row | None = None) -> None:
        cookie_token = self.cookie_value("saathi_csrf")
        header_token = self.headers.get("X-CSRF-Token")
        if not cookie_token or not header_token or not hmac.compare_digest(cookie_token, header_token):
            raise APIError(403, "Refresh the page and try again")
        if session and not hmac.compare_digest(session["csrf_token"], header_token):
            raise APIError(403, "Refresh the page and try again")

    def set_auth_cookies(self, session_token: str, csrf: str) -> dict[str, Any]:
        secure = "; Secure" if COOKIE_SECURE else ""
        session_cookie = f"saathi_session={session_token}; Path=/; HttpOnly; SameSite=Lax; Max-Age={SESSION_HOURS * 3600}{secure}"
        csrf_cookie = f"saathi_csrf={csrf}; Path=/; HttpOnly; SameSite=Lax; Max-Age={SESSION_HOURS * 3600}{secure}"
        return {"Set-Cookie": [session_cookie, csrf_cookie], "X-Saathi-CSRF": csrf}

    def set_guest_csrf(self) -> dict[str, str]:
        token = secrets.token_urlsafe(24)
        secure = "; Secure" if COOKIE_SECURE else ""
        return {"Set-Cookie": f"saathi_csrf={token}; Path=/; HttpOnly; SameSite=Lax{secure}", "X-Saathi-CSRF": token}

    def handle_api(self, method: str) -> None:
        path = self.path_info.path
        query = parse_qs(self.path_info.query)
        with connect() as conn:
            if method == "GET" and path == "/api/session":
                user, session = self.current_user(conn)
                csrf = session["csrf_token"] if session else self.cookie_value("saathi_csrf")
                headers = {"X-Saathi-CSRF": csrf or ""}
                if not csrf:
                    headers = self.set_guest_csrf()
                self.send_json(200, {"user": serialise_user(user) if user else None, "contact_window": contact_window_status(), "csrf": headers.get("X-Saathi-CSRF", "")}, headers)
                return
            if method == "GET" and path == "/api/health":
                self.send_json(200, {"status": "ok", "time": iso_now()})
                return
            if path == "/api/login" and method == "POST":
                self.require_csrf()
                payload = self.read_json()
                email = str(payload.get("email", "")).strip().lower()[:180]
                password = str(payload.get("password", ""))
                ip = self.client_address[0]
                with LOGIN_LOCK:
                    attempt_times = [stamp for stamp in LOGIN_ATTEMPTS.get(ip, []) if time.time() - stamp < 300]
                    if len(attempt_times) >= 8:
                        raise APIError(429, "Too many sign-in attempts. Wait five minutes and retry.")
                    attempt_times.append(time.time())
                    LOGIN_ATTEMPTS[ip] = attempt_times
                user = conn.execute("SELECT * FROM users WHERE email=? AND active=1", (email,)).fetchone()
                if not user or len(password) > 200 or not password_matches(password, user["password_salt"], user["password_hash"]):
                    raise APIError(401, "Email or password not recognised")
                token = secrets.token_urlsafe(32)
                csrf = secrets.token_urlsafe(24)
                digest = hashlib.sha256(token.encode()).hexdigest()
                expiry = (now() + timedelta(hours=SESSION_HOURS)).isoformat()
                conn.execute("INSERT INTO sessions(token_hash,user_id,csrf_token,expires_at) VALUES(?,?,?,?)", (digest, user["id"], csrf, expiry))
                with LOGIN_LOCK:
                    LOGIN_ATTEMPTS.pop(ip, None)
                self.send_json(200, {"user": serialise_user(user), "contact_window": contact_window_status()}, self.set_auth_cookies(token, csrf))
                return
            if path == "/api/logout" and method == "POST":
                user, session = self.require_user(conn)
                self.require_csrf(session)
                token = self.cookie_value("saathi_session")
                conn.execute("DELETE FROM sessions WHERE token_hash=?", (hashlib.sha256(token.encode()).hexdigest(),))
                expires = "; Secure" if COOKIE_SECURE else ""
                headers = {"Set-Cookie": f"saathi_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0{expires}"}
                self.send_json(200, {"ok": True}, headers)
                return
            if path.startswith("/api/") and method == "GET" and path == "/api/loans":
                user, _ = self.require_user(conn)
                params = []
                where = "l.status <> 'paid'"
                if user["role"] == "officer":
                    where += " AND l.officer_id=?"
                    params.append(user["id"])
                status = (query.get("status") or [""])[0]
                if status in ("active", "promise", "dispute"):
                    where += " AND l.status=?"
                    params.append(status)
                branch = (query.get("branch") or [""])[0]
                if user["role"] == "manager" and branch:
                    where += " AND l.branch_id=?"
                    params.append(branch)
                sort = (query.get("sort") or ["score"])[0]
                rows = conn.execute(
                    f"""SELECT l.*, b.name branch_name, u.name officer_name FROM loans l
                        JOIN branches b ON b.id=l.branch_id JOIN users u ON u.id=l.officer_id
                        WHERE {where}""", params,
                ).fetchall()
                items = []
                for row in rows:
                    item = dict(row)
                    item["priority"] = score_loan(item)
                    items.append(item)
                ordering = {
                    "score": lambda item: (-item["priority"]["effective_score"], -item["dpd"], item["id"]),
                    "dpd": lambda item: (-item["dpd"], -item["priority"]["effective_score"], item["id"]),
                    "amount": lambda item: (-item["outstanding"], -item["priority"]["effective_score"], item["id"]),
                }.get(sort, lambda item: (-item["priority"]["effective_score"], -item["dpd"], item["id"]))
                items.sort(key=ordering)
                self.send_json(200, {"loans": items, "count": len(items), "sort": sort})
                return
            if path == "/api/branches" and method == "GET":
                user, _ = self.require_user(conn)
                if user["role"] != "manager":
                    raise APIError(403, "Manager access required")
                self.send_json(200, {"branches": [dict(row) for row in conn.execute("SELECT * FROM branches ORDER BY name")]})
                return
            if path == "/api/officers" and method == "GET":
                user, _ = self.require_user(conn)
                if user["role"] != "manager":
                    raise APIError(403, "Manager access required")
                branch_id = (query.get("branch") or [""])[0]
                if branch_id:
                    rows = conn.execute("SELECT id,name,branch_id FROM users WHERE role='officer' AND active=1 AND branch_id=? ORDER BY name", (branch_id,)).fetchall()
                else:
                    rows = conn.execute("SELECT id,name,branch_id FROM users WHERE role='officer' AND active=1 ORDER BY name").fetchall()
                self.send_json(200, {"officers": [dict(row) for row in rows]})
                return
            if path == "/api/promises" and method == "GET":
                user, _ = self.require_user(conn)
                scope = "" if user["role"] == "manager" else " AND l.officer_id=?"
                params = [] if user["role"] == "manager" else [user["id"]]
                rows = conn.execute(
                    """SELECT l.id,l.borrower,l.promise_date,l.outstanding,l.status,l.officer_id,l.branch_id,
                       b.name branch_name,u.name officer_name FROM loans l
                       JOIN branches b ON b.id=l.branch_id JOIN users u ON u.id=l.officer_id
                       WHERE l.promise_date IS NOT NULL AND l.status <> 'paid'""" + scope + " ORDER BY l.promise_date,l.id", params,
                ).fetchall()
                result = []
                for row in rows:
                    item = dict(row)
                    item["promise_state"] = "broken" if row["promise_date"] < today().isoformat() and int(item.get("broken_promises") or 0) > 0 else "follow_up" if row["promise_date"] < today().isoformat() else "due_today" if row["promise_date"] == today().isoformat() else "upcoming"
                    result.append(item)
                self.send_json(200, {"promises": result})
                return
            if path == "/api/manager/summary" and method == "GET":
                user, _ = self.require_user(conn, ("manager",))
                branches = conn.execute(
                    """SELECT b.id,b.name,COUNT(CASE WHEN l.status<>'paid' THEN 1 END) active_count,
                       COALESCE(SUM(CASE WHEN l.status<>'paid' THEN l.outstanding ELSE 0 END),0) outstanding,
                       SUM(CASE WHEN l.status<>'paid' AND l.dpd BETWEEN 1 AND 30 THEN 1 ELSE 0 END) bucket_1_30,
                       SUM(CASE WHEN l.status<>'paid' AND l.dpd BETWEEN 31 AND 60 THEN 1 ELSE 0 END) bucket_31_60,
                       SUM(CASE WHEN l.status<>'paid' AND l.broken_promises>0 THEN 1 ELSE 0 END) broken_promises
                       FROM branches b LEFT JOIN loans l ON l.branch_id=b.id GROUP BY b.id ORDER BY b.name""",
                    (),
                ).fetchall()
                total_active = conn.execute("SELECT COUNT(*) FROM loans WHERE status<>'paid'").fetchone()[0]
                outstanding = conn.execute("SELECT COALESCE(SUM(outstanding),0) FROM loans WHERE status<>'paid'").fetchone()[0]
                broken = conn.execute("SELECT COUNT(*) FROM loans WHERE status<>'paid' AND broken_promises>0").fetchone()[0]
                due = conn.execute("SELECT COUNT(*) FROM loans WHERE status<>'paid' AND promise_date=?", (today().isoformat(),)).fetchone()[0]
                dpd_31_60 = conn.execute("SELECT COUNT(*) FROM loans WHERE status<>'paid' AND dpd BETWEEN 31 AND 60").fetchone()[0]
                dpd_1_30 = conn.execute("SELECT COUNT(*) FROM loans WHERE status<>'paid' AND dpd BETWEEN 1 AND 30").fetchone()[0]
                recent = conn.execute(
                    """SELECT o.kind,l.dpd,l.outstanding,l.broken_promises,l.missed_payments_90d,l.payment_ratio
                       FROM outcomes o JOIN loans l ON l.id=o.loan_id
                       WHERE o.logged_at>=? AND o.kind IN ('paid','promise','not_reachable','dispute')""",
                    ((now() - timedelta(days=7)).isoformat(),),
                ).fetchall()
                groups: dict[str, dict[str, int]] = {}
                for event in recent:
                    risk = score_loan(dict(event))["band"]
                    groups.setdefault(risk, {"total": 0, "paid": 0})
                    groups[risk]["total"] += 1
                    groups[risk]["paid"] += 1 if event["kind"] == "paid" else 0
                backtest = [{"band": band, **counts} for band, counts in sorted(groups.items())]
                self.send_json(200, {
                    "metrics": {"active_loans": total_active, "outstanding": outstanding, "broken_promises": broken,
                                "promises_due_today": due, "roll_rate_baseline": 22, "roll_rate_target": 16,
                                "dpd_31_60": dpd_31_60, "dpd_1_30": dpd_1_30},
                    "branches": [dict(row) for row in branches],
                    "backtest": backtest,
                    "backtest_days": 7,
                    "sample_note": "Baseline and target are from the client brief. The demo shows current DPD buckets only; a true roll rate needs dated snapshots for the same loans.",
                })
                return
            if path == "/api/backtest.csv" and method == "GET":
                user, _ = self.require_user(conn, ("manager",))
                # The dashboard is the canonical back-test view; CSV is a simple export of its grouped data.
                rows = conn.execute(
                    """SELECT l.id,l.dpd,l.outstanding,l.broken_promises,l.missed_payments_90d,l.payment_ratio,
                       o.kind,o.logged_at FROM outcomes o JOIN loans l ON l.id=o.loan_id
                       WHERE o.logged_at>=? ORDER BY o.logged_at DESC""", ((now() - timedelta(days=7)).isoformat(),),
                ).fetchall()
                out = io.StringIO()
                writer = csv.writer(out)
                writer.writerow(["loan_id", "priority_score", "score_band", "outcome", "logged_at"])
                for row in rows:
                    score = score_loan(dict(row))["score"]
                    writer.writerow([row["id"], score, "high" if score >= 65 else "medium" if score >= 40 else "low", row["kind"], row["logged_at"]])
                data = out.getvalue().encode("utf-8")
                self.send_bytes(200, data, "text/csv; charset=utf-8", {"Content-Disposition": "attachment; filename=weekly-backtest.csv"})
                return
            if path.startswith("/api/outcomes/") and method == "GET":
                user, _ = self.require_user(conn)
                loan_id = unquote(path.removeprefix("/api/outcomes/"))
                loan = conn.execute("SELECT * FROM loans WHERE id=?", (loan_id,)).fetchone()
                if not loan:
                    raise APIError(404, "Loan not found")
                if user["role"] == "officer" and loan["officer_id"] != user["id"]:
                    raise APIError(403, "This loan is assigned to another officer")
                rows = conn.execute(
                    "SELECT o.id,o.kind,o.amount_collected,o.promise_date,o.note,o.latitude,o.longitude,o.logged_at,u.name officer_name FROM outcomes o JOIN users u ON u.id=o.officer_id WHERE o.loan_id=? ORDER BY o.logged_at DESC LIMIT 20",
                    (loan_id,),
                ).fetchall()
                self.send_json(200, {"outcomes": [dict(row) for row in rows]})
                return
            if method in ("POST", "PATCH"):
                user, session = self.require_user(conn)
                self.require_csrf(session)
                payload = self.read_json()
                if method == "POST" and path == "/api/contact-attempt":
                    if user["role"] != "officer":
                        raise APIError(403, "Officer access required")
                    status = contact_window_status()
                    if not status["allowed"]:
                        raise APIError(403, "Contact is permitted only from 8:00 am to 7:00 pm IST")
                    loan_id = str(payload.get("loan_id", ""))[:24]
                    loan = conn.execute("SELECT * FROM loans WHERE id=?", (loan_id,)).fetchone()
                    if not loan or loan["officer_id"] != user["id"]:
                        raise APIError(404, "Loan not found in your assigned list")
                    channel = payload.get("channel")
                    if channel not in ("call", "reminder"):
                        raise APIError(400, "Choose a valid contact channel")
                    if channel == "reminder":
                        language = payload.get("language", "hi")
                        if language not in ("hi", "en"):
                            language = "hi"
                        draft = str(payload.get("draft", ""))
                        if draft != make_reminder(dict(loan), language):
                            raise APIError(400, "Reminder must use an approved template")
                        kind = "reminder"
                    else:
                        kind = "call_attempt"
                    stamp = iso_now()
                    event_id = str(uuid.uuid4())
                    conn.execute("INSERT INTO outcomes(id,client_event_id,loan_id,officer_id,kind,logged_at,created_at) VALUES(?,?,?,?,?,?,?)",
                                 (event_id, event_id, loan_id, user["id"], kind, stamp, stamp))
                    audit(conn, user["id"], "contact_attempt_logged", "loan", loan_id, {"channel": channel})
                    self.send_json(200, {"ok": True, "message": "Mock action recorded. No call or message was sent.", "logged_at": stamp})
                    return
                if method == "POST" and path == "/api/outcomes":
                    if user["role"] != "officer":
                        raise APIError(403, "Officer access required")
                    loan_id = str(payload.get("loan_id", ""))[:24]
                    loan = conn.execute("SELECT * FROM loans WHERE id=?", (loan_id,)).fetchone()
                    if not loan or loan["officer_id"] != user["id"]:
                        raise APIError(404, "Loan not found in your assigned list")
                    event_key = str(payload.get("client_event_id", ""))
                    try:
                        event_key = str(uuid.UUID(event_key))
                    except ValueError as error:
                        raise APIError(400, "Outcome needs a valid sync ID") from error
                    if conn.execute("SELECT 1 FROM outcomes WHERE client_event_id=?", (event_key,)).fetchone():
                        self.send_json(200, {"ok": True, "duplicate": True, "message": "Already synced"})
                        return
                    kind = payload.get("kind")
                    if kind not in ("paid", "promise", "not_reachable", "dispute"):
                        raise APIError(400, "Choose paid, promise, not reachable or dispute")
                    try:
                        happened = datetime.fromisoformat(str(payload.get("logged_at", ""))).astimezone(TZ)
                    except ValueError as error:
                        raise APIError(400, "Outcome time is invalid") from error
                    current = now()
                    if happened > current + timedelta(minutes=1) or happened < current - timedelta(days=2):
                        raise APIError(400, "Outcome time must be recent and cannot be in the future")
                    if not (8 <= happened.hour < 19):
                        raise APIError(403, "Contact attempts must be recorded from 8:00 am to 7:00 pm IST")
                    amount = payload.get("amount_collected", 0)
                    try:
                        amount = int(amount or 0)
                    except (TypeError, ValueError) as error:
                        raise APIError(400, "Collected amount must be whole rupees") from error
                    if kind == "paid" and (amount <= 0 or amount > loan["outstanding"]):
                        raise APIError(400, f"Enter an amount from ₹1 to ₹{loan['outstanding']:,}")
                    if kind != "paid" and amount != 0:
                        raise APIError(400, "Collected amount is only used with the paid outcome")
                    promise_date = payload.get("promise_date")
                    if kind == "promise":
                        try:
                            promise_date = date.fromisoformat(str(promise_date))
                        except (TypeError, ValueError) as error:
                            raise APIError(400, "Choose a promise date") from error
                        if promise_date < today() or promise_date > today() + timedelta(days=30):
                            raise APIError(400, "Promise date must be within the next 30 days")
                        promise_date = promise_date.isoformat()
                    else:
                        promise_date = None
                    note = str(payload.get("note", "")).strip()
                    if len(note) > 240:
                        raise APIError(400, "Note must be 240 characters or fewer")
                    lat = payload.get("latitude")
                    lon = payload.get("longitude")
                    if lat is not None or lon is not None:
                        try:
                            lat = round(float(lat), 4) if lat is not None else None
                            lon = round(float(lon), 4) if lon is not None else None
                        except (TypeError, ValueError) as error:
                            raise APIError(400, "Location is invalid") from error
                        if lat is not None and not -90 <= lat <= 90 or lon is not None and not -180 <= lon <= 180:
                            raise APIError(400, "Location is outside valid coordinates")
                    stamp = iso_now()
                    event_id = str(uuid.uuid4())
                    conn.execute(
                        """INSERT INTO outcomes(id,client_event_id,loan_id,officer_id,kind,amount_collected,promise_date,note,latitude,longitude,logged_at,created_at)
                           VALUES(?,?,?,?,?,?,?,?,?,?,?,?)""",
                        (event_id, event_key, loan_id, user["id"], kind, amount, promise_date, note, lat, lon, happened.isoformat(), stamp),
                    )
                    if kind == "promise":
                        conn.execute("UPDATE loans SET promise_date=?,status='promise' WHERE id=?", (promise_date, loan_id))
                    elif kind == "dispute":
                        conn.execute("UPDATE loans SET status='dispute' WHERE id=?", (loan_id,))
                    elif kind == "paid":
                        remaining = loan["outstanding"] - amount
                        new_status = "paid" if remaining == 0 else loan["status"]
                        conn.execute("UPDATE loans SET outstanding=?,status=? WHERE id=?", (remaining, new_status, loan_id))
                    audit(conn, user["id"], "outcome_recorded", "loan", loan_id, {"kind": kind, "offline_capable": True})
                    self.send_json(201, {"ok": True, "outcome_id": event_id, "message": "Outcome saved", "logged_at": happened.isoformat()})
                    return
                if method == "POST" and path == "/api/import":
                    if user["role"] != "manager":
                        raise APIError(403, "Manager access required")
                    csv_text = str(payload.get("csv", ""))
                    rows = parse_csv_rows(csv_text)
                    imported, updated, errors = 0, 0, []
                    for index, raw in enumerate(rows, start=2):
                        try:
                            item = validate_import_row(raw, index)
                            branch = conn.execute("SELECT * FROM branches WHERE ? LIKE pin_prefix || '%'", (item["pincode"],)).fetchone()
                            if not branch:
                                raise ValueError(f"Row {index}: pincode is outside configured demo branches")
                            existing = conn.execute("SELECT id FROM loans WHERE id=?", (item["loan_id"],)).fetchone()
                            if existing:
                                assigned = conn.execute("SELECT * FROM users WHERE id=(SELECT officer_id FROM loans WHERE id=?)", (item["loan_id"],)).fetchone()
                                if assigned and assigned["branch_id"] == branch["id"]:
                                    assignee = assigned
                                else:
                                    assignee = assign_officer(conn, branch["id"])
                            else:
                                assignee = assign_officer(conn, branch["id"])
                            if not assignee:
                                raise ValueError(f"Row {index}: no active officers in {branch['name']}")
                            conn.execute(
                                """INSERT INTO loans(id,borrower,product,outstanding,dpd,promise_date,pincode,branch_id,officer_id,
                                   broken_promises,missed_payments_90d,payment_ratio,status,imported_at)
                                   VALUES(?,?,?,?,?,?,?,?,?,?,?,?, 'active',?)
                                   ON CONFLICT(id) DO UPDATE SET borrower=excluded.borrower,product=excluded.product,
                                   outstanding=excluded.outstanding,dpd=excluded.dpd,promise_date=excluded.promise_date,
                                   pincode=excluded.pincode,branch_id=excluded.branch_id,officer_id=excluded.officer_id,
                                   broken_promises=excluded.broken_promises,missed_payments_90d=excluded.missed_payments_90d,
                                   payment_ratio=excluded.payment_ratio,status=CASE WHEN loans.status='paid' THEN 'active' ELSE loans.status END,
                                   imported_at=excluded.imported_at""",
                                (item["loan_id"], item["borrower"], item["product"], item["outstanding"], item["dpd"], item["promise_date"], item["pincode"], branch["id"], assignee["id"], item["broken_promises"], item["missed_payments_90d"], item["payment_ratio"], iso_now()),
                            )
                            imported += 1
                            updated += 1 if existing else 0
                        except ValueError as error:
                            errors.append(str(error))
                    if errors and not imported:
                        raise APIError(400, "; ".join(errors[:4]))
                    audit(conn, user["id"], "csv_imported", "loan_batch", "daily-overdue", {"rows": imported, "updated": updated, "errors": len(errors)})
                    self.send_json(200, {"imported": imported, "updated": updated, "errors": errors, "message": f"{imported} rows imported and assigned by pincode and current workload"})
                    return
                if method == "PATCH" and path.startswith("/api/loans/"):
                    if user["role"] != "manager":
                        raise APIError(403, "Manager access required")
                    loan_id = unquote(path.removeprefix("/api/loans/"))
                    loan = conn.execute("SELECT * FROM loans WHERE id=?", (loan_id,)).fetchone()
                    if not loan:
                        raise APIError(404, "Loan not found")
                    try:
                        score = int(payload.get("priority_override"))
                    except (TypeError, ValueError) as error:
                        raise APIError(400, "Set a priority from 1 to 100") from error
                    reason = str(payload.get("reason", "")).strip()
                    if not 1 <= score <= 100 or not 8 <= len(reason) <= 200:
                        raise APIError(400, "Priority must be 1-100 and a reason must be 8-200 characters")
                    conn.execute("UPDATE loans SET priority_override=?,override_reason=? WHERE id=?", (score, reason, loan_id))
                    audit(conn, user["id"], "priority_reordered", "loan", loan_id, {"priority_override": score, "reason": reason})
                    self.send_json(200, {"ok": True, "priority_override": score, "reason": reason})
                    return
                if method == "POST" and path == "/api/manager/clear-override":
                    if user["role"] != "manager":
                        raise APIError(403, "Manager access required")
                    loan_id = str(payload.get("loan_id", ""))[:24]
                    conn.execute("UPDATE loans SET priority_override=NULL,override_reason=NULL WHERE id=?", (loan_id,))
                    audit(conn, user["id"], "priority_override_cleared", "loan", loan_id, {})
                    self.send_json(200, {"ok": True})
                    return
            raise APIError(404, "Page not found")

    def handle_static(self, method: str) -> None:
        path = self.path_info.path
        if path in ("/", "/login", "/today", "/promises", "/import", "/manager"):
            target = PUBLIC / "index.html"
            data = target.read_bytes()
            content = data.decode("utf-8")
            if path.startswith("/loans/"):
                loan_id = unquote(path.removeprefix("/loans/"))
                with connect() as conn:
                    row = conn.execute("SELECT l.*,b.name branch_name FROM loans l JOIN branches b ON b.id=l.branch_id WHERE l.id=?", (loan_id,)).fetchone()
                if row:
                    item = dict(row)
                    priority = score_loan(item)
                    title = f"{row['id']} · {row['borrower']} | Saathi Field"
                    description = f"{row['id']} · {row['dpd']} DPD · ₹{row['outstanding']:,} outstanding · Priority {priority['score']}/100. Officer access required."
                    safe = lambda val: (str(val).replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace('"', "&quot;"))
                    content = content.replace("<!-- SEO_TITLE -->", f'<title>{safe(title)}</title>\n<meta name="description" content="{safe(description)}">')
                    content = content.replace("<!-- SEO_BODY -->", f'<main class="seo-fallback"><h1>{safe(row["id"])} · {safe(row["borrower"])}</h1><p>Overdue {row["dpd"]} days · ₹{row["outstanding"]:,} outstanding</p><p>Sign in as an authorised officer to view this protected record.</p></main>')
                else:
                    content = content.replace("<!-- SEO_TITLE -->", "<title>Loan not found | Saathi Field</title>")
            else:
                content = content.replace("<!-- SEO_TITLE -->", "<title>Saathi Field | Collections, made clear</title>")
            self.send_bytes(200, content.encode("utf-8"), "text/html; charset=utf-8", {"Cache-Control": "no-cache"})
            return
        if path == "/robots.txt":
            self.send_bytes(200, b"User-agent: *\nDisallow: /\n", "text/plain; charset=utf-8")
            return
        relative = unquote(path.lstrip("/"))
        candidate = (PUBLIC / relative).resolve()
        if not str(candidate).startswith(str(PUBLIC.resolve()) + os.sep) or not candidate.is_file():
            self.send_bytes(404, b"Not found", "text/plain; charset=utf-8")
            return
        suffix_types = {".css": "text/css; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".svg": "image/svg+xml", ".webmanifest": "application/manifest+json", ".html": "text/html; charset=utf-8"}
        self.send_bytes(200, candidate.read_bytes(), suffix_types.get(candidate.suffix, "application/octet-stream"), {"Cache-Control": "no-cache"})


def main() -> None:
    init_db()
    server = ThreadingHTTPServer((os.environ.get("HOST", "127.0.0.1"), PORT), Handler)
    print(f"Saathi Field pilot ready at http://127.0.0.1:{PORT} (SQLite: {DB_PATH})")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nServer stopped")
    finally:
        server.server_close()


if __name__ == "__main__":
    main()

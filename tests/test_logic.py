import csv
import io
import sys
import tempfile
import unittest
from datetime import datetime
from pathlib import Path
from unittest.mock import patch
from zoneinfo import ZoneInfo

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
import server


class PriorityScoreTests(unittest.TestCase):
    def test_score_is_bounded_and_explains_three_reasons(self):
        result = server.score_loan({
            "dpd": 27,
            "outstanding": 640000,
            "broken_promises": 1,
            "missed_payments_90d": 3,
            "payment_ratio": 0.2,
        })
        self.assertGreaterEqual(result["score"], 0)
        self.assertLessEqual(result["score"], 100)
        self.assertEqual(result["band"], "high")
        self.assertEqual(len(result["reasons"]), 3)
        self.assertEqual(len(result["reasons_hi"]), 3)
        self.assertTrue(any("दिन बकाया" in reason for reason in result["reasons_hi"]))
        self.assertEqual(result["effective_score"], result["score"])

    def test_broken_promise_increases_score(self):
        base = {"dpd": 12, "outstanding": 200000, "broken_promises": 0, "missed_payments_90d": 0, "payment_ratio": 0.9}
        with_broken_promise = {**base, "broken_promises": 1}
        self.assertGreater(server.score_loan(with_broken_promise)["score"], server.score_loan(base)["score"])

    def test_manual_priority_changes_ordering_value_without_overwriting_model_score(self):
        result = server.score_loan({"dpd": 12, "outstanding": 200000, "broken_promises": 0, "missed_payments_90d": 0, "payment_ratio": 0.9, "priority_override": 88, "override_reason": "Manager review priority"})
        self.assertEqual(result["effective_score"], 88)
        self.assertNotEqual(result["score"], 88)


class ContactWindowTests(unittest.TestCase):
    def test_contact_window_boundaries_use_india_time(self):
        india = ZoneInfo("Asia/Kolkata")
        self.assertTrue(server.contact_window_status(datetime(2026, 11, 7, 8, 0, tzinfo=india))["allowed"])
        self.assertTrue(server.contact_window_status(datetime(2026, 11, 7, 18, 59, tzinfo=india))["allowed"])
        self.assertFalse(server.contact_window_status(datetime(2026, 11, 7, 7, 59, tzinfo=india))["allowed"])
        self.assertFalse(server.contact_window_status(datetime(2026, 11, 7, 19, 0, tzinfo=india))["allowed"])

    def test_authenticated_session_sets_matching_csrf_cookie(self):
        handler = object.__new__(server.Handler)
        headers = handler.set_auth_cookies("opaque-session", "session-csrf")
        self.assertIn("saathi_session=opaque-session", headers["Set-Cookie"][0])
        self.assertIn("saathi_csrf=session-csrf", headers["Set-Cookie"][1])
        self.assertEqual(headers["X-Saathi-CSRF"], "session-csrf")


class ImportValidationTests(unittest.TestCase):
    def test_csv_requires_fields_and_parses_seed_shape(self):
        raw = "loan_id,borrower,outstanding,dpd,pincode,payment_ratio\nLN-10123,Demo borrower,250000,14,452001,0.7\n"
        parsed = server.parse_csv_rows(raw)
        row = server.validate_import_row(parsed[0], 2)
        self.assertEqual(row["loan_id"], "LN-10123")
        self.assertEqual(row["outstanding"], 250000)
        self.assertEqual(row["payment_ratio"], 0.7)

    def test_csv_rejects_unknown_columns_without_required_fields(self):
        with self.assertRaisesRegex(ValueError, "needs loan_id"):
            server.parse_csv_rows("name,amount\nDemo,10\n")

    def test_csv_rejects_sql_and_out_of_range_inputs(self):
        row = {"loan_id": "LN-10001", "borrower": "Demo borrower", "outstanding": "100", "dpd": "9000", "pincode": "452001"}
        with self.assertRaisesRegex(ValueError, "DPD or payment history"):
            server.validate_import_row(row, 2)
        row["loan_id"] = "LN-10001;DROP"
        row["dpd"] = "5"
        with self.assertRaisesRegex(ValueError, "loan_id"):
            server.validate_import_row(row, 2)

    def test_csv_rejects_more_than_one_thousand_rows(self):
        stream = io.StringIO()
        writer = csv.writer(stream)
        writer.writerow(["loan_id", "borrower", "outstanding", "dpd", "pincode"])
        for index in range(server.MAX_CSV_ROWS + 1):
            writer.writerow([f"LN-{index:05}", "Demo borrower", 1000, 5, "452001"])
        with self.assertRaisesRegex(ValueError, "limited to 1000 rows"):
            server.parse_csv_rows(stream.getvalue())


class ReminderAndAssignmentTests(unittest.TestCase):
    def test_reminder_templates_are_bilingual_and_price_free(self):
        loan = {"id": "LN-10293"}
        hindi = server.make_reminder(loan, "hi")
        english = server.make_reminder(loan, "en")
        self.assertIn("LN-10293", hindi)
        self.assertIn("courtesy reminder", english)
        self.assertNotIn("₹", hindi + english)
        self.assertNotIn("discount", (hindi + english).lower())

    def test_import_assignment_uses_lightest_current_officer_workload(self):
        with tempfile.TemporaryDirectory() as temporary:
            db_file = Path(temporary) / "test.sqlite3"
            with patch.object(server, "DB_PATH", db_file):
                server.init_db()
                with server.connect() as conn:
                    assigned = server.assign_officer(conn, "indore-central")
                    self.assertEqual(assigned["id"], "a_demo")


if __name__ == "__main__":
    unittest.main()

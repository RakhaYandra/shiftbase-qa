#!/usr/bin/env python3
"""Sanitasi artefak laporan QA sebelum commit.

- newman.json: hapus response bodies (bisa berisi JWT), mask
  header Authorization Bearer, mask password di request body.
- playwright.json: ganti prefix home dir -> ~ (path absolut mesin uji).
Idempotent. Assertion counts tidak berubah (hanya display data).
"""
import json
import os
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
HOME = os.path.expanduser("~")


def scrub_request(req):
    if not isinstance(req, dict):
        return
    for h in req.get("header", []):
        if h.get("key", "").lower() == "authorization" and "Bearer " in str(h.get("value", "")):
            h["value"] = "Bearer <redacted>"
    body = req.get("body", {})
    raw = body.get("raw", "")
    if '"password"' in raw:
        body["raw"] = re.sub(r'"password"\s*:\s*"[^"]*"', '"password":"<redacted>"', raw)


def redact_newman():
    p = ROOT / "reports" / "newman.json"
    r = json.load(open(p))
    for e in r["run"].get("executions", []):
        resp = e.get("response", {})
        if isinstance(resp, dict):
            resp.pop("stream", None)
            resp.pop("body", None)
        scrub_request(e.get("request"))
        scrub_request(e.get("item", {}).get("request"))
    for i in r.get("collection", {}).get("item", []):
        scrub_request(i.get("request"))
    json.dump(r, open(p, "w"), indent=2)
    print("redacted newman.json")


def redact_playwright():
    p = ROOT / "reports" / "playwright.json"
    t = open(p).read().replace(HOME, "~")
    open(p, "w").write(t)
    print("redacted playwright.json")


if __name__ == "__main__":
    redact_newman()
    redact_playwright()

#!/usr/bin/env python3
"""
check_links.py — open every curated link and report the ones that are broken.

    cd tools && python check_links.py                 # all four folders
    cd tools && python check_links.py careers         # just one
    cd tools && python check_links.py careers -v      # print every result

Career portals move more often than anything else on this site: a company gets
acquired, moves to Workday, or retires a subdomain, and the link rots quietly.
This walks `careers/`, `projects/`, `platforms/` and `resources/`, requests
each URL, and prints what did not come back healthy.

Only the standard library is used, so there is nothing to install.

Notes on reading the output:

  * A redirect is followed and counts as fine — most `company.com/careers`
    URLs land somewhere else by design.
  * `403` usually means a bot filter, not a dead page. Those are listed
    separately as "blocked" so you can eyeball them rather than delete them.
  * A timeout is a network hiccup as often as a dead host. Re-run before
    changing anything.
"""
import concurrent.futures as futures
import os
import re
import ssl
import sys
import urllib.error
import urllib.request

ROOT = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.dirname(ROOT)
FOLDERS = ["careers", "projects", "platforms", "resources"]

LINK = re.compile(r"\[([^\]]+)\]\((https?://[^)\s]+)\)")
AGENT = "Mozilla/5.0 (compatible; open-cs-hub link checker; +https://github.com/Subrata-CS/open)"
TIMEOUT = 20


def collect(folders):
    found = []
    for folder in folders:
        path = os.path.join(REPO, folder)
        if not os.path.isdir(path):
            print(f"skipped {folder}/ — no such folder")
            continue
        for name in sorted(os.listdir(path)):
            if not name.endswith((".md", ".markdown")):
                continue
            with open(os.path.join(path, name), encoding="utf-8") as f:
                for line in f:
                    hit = LINK.search(line)
                    if hit:
                        found.append((f"{folder}/{name}", hit.group(1), hit.group(2)))
    return found


def probe(url):
    """Return (status, note). status is an int, 0 when the request never landed."""
    context = ssl.create_default_context()
    for method in ("HEAD", "GET"):
        request = urllib.request.Request(url, method=method, headers={"User-Agent": AGENT})
        try:
            with urllib.request.urlopen(request, timeout=TIMEOUT, context=context) as response:
                return response.status, ""
        except urllib.error.HTTPError as error:
            # Some servers refuse HEAD but answer GET, so only a GET failure is final.
            if method == "GET" or error.code not in (403, 405, 501):
                return error.code, error.reason or ""
        except Exception as error:  # timeout, DNS, TLS, redirect loop
            if method == "GET":
                return 0, type(error).__name__
    return 0, "unreachable"


def main():
    args = [a for a in sys.argv[1:] if not a.startswith("-")]
    verbose = any(a in ("-v", "--verbose") for a in sys.argv[1:])
    folders = args or FOLDERS

    links = collect(folders)
    if not links:
        print("Nothing to check.")
        return 0

    print(f"Checking {len(links)} links in {', '.join(folders)} …\n")

    broken, blocked, unreachable = [], [], []
    with futures.ThreadPoolExecutor(max_workers=12) as pool:
        jobs = {pool.submit(probe, url): (source, name, url) for source, name, url in links}
        for done in futures.as_completed(jobs):
            source, name, url = jobs[done]
            status, note = done.result()
            row = (status, name, url, source, note)
            if status == 0:
                unreachable.append(row)
            elif status == 403:
                blocked.append(row)
            elif status >= 400:
                broken.append(row)
            if verbose:
                print(f"  {status or '---'}  {name[:28]:30} {url}")

    def report(title, rows):
        if not rows:
            return
        print(f"\n{title} ({len(rows)})")
        for status, name, url, source, note in sorted(rows, key=lambda r: r[3]):
            print(f"  {status or '---'}  {name[:26]:28} {url}")
            print(f"       in {source} {note}")

    report("BROKEN — fix these", broken)
    report("BLOCKED — bot filter, check by hand", blocked)
    report("UNREACHABLE — re-run before changing", unreachable)

    healthy = len(links) - len(broken) - len(blocked) - len(unreachable)
    print(f"\n{healthy}/{len(links)} healthy")
    return 1 if broken else 0


if __name__ == "__main__":
    sys.exit(main())

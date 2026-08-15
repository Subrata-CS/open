#!/usr/bin/env python3
"""
build_resources.py — turn the resources/ folder into the Resources page.

    cd tools && python build_resources.py

One Markdown file per group. Each line is a link, optionally tagged with the
syllabus section it belongs to:

    ---
    title: Foundations
    about: Where the classic university courses for these sections live.
    order: 1
    ---

    - 07 | [MIT 6.006 — Introduction to Algorithms](https://ocw.mit.edu/...) — the canonical course.
    - [Papers We Love](https://paperswelove.org/) — a reading group's archive.

  `07 |` is optional. When present, the page links the resource to that section
  of the syllabus and shows the section's own name, so the two stay connected.
  Without it the resource is simply listed under its group.

Add a line, run the script, and it is on the site. There is no registry and no
limit.
"""
import json
import os
import re

ROOT = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.dirname(ROOT)
SRC = os.path.join(REPO, "resources")
DATA = os.path.join(REPO, "src", "data")
OUT = os.path.join(DATA, "resources.json")

FRONT = re.compile(r"^---\s*\n(.*?)\n---\s*\n", re.S)
LINK = re.compile(
    r"^\s*[-*]\s*(?:(\d{1,2})\s*\|\s*)?\[([^\]]+)\]\((https?://[^)\s]+)\)\s*(?:[—–-]\s*(.*))?$"
)


def sections():
    path = os.path.join(DATA, "sections.json")
    if not os.path.exists(path):
        return {}
    with open(path, encoding="utf-8") as f:
        return {s["num"]: s for s in json.load(f)}


def parse(path):
    with open(path, encoding="utf-8") as f:
        raw = f.read()

    meta, body = {}, raw
    m = FRONT.match(raw)
    if m:
        for line in m.group(1).split("\n"):
            if ":" in line:
                key, _, value = line.partition(":")
                meta[key.strip().lower()] = value.strip().strip("\"'")
        body = raw[m.end():]

    items = []
    for line in body.split("\n"):
        hit = LINK.match(line)
        if hit:
            items.append(
                {
                    "section": int(hit.group(1)) if hit.group(1) else None,
                    "name": hit.group(2).strip(),
                    "url": hit.group(3).strip(),
                    "about": (hit.group(4) or "").strip(),
                }
            )
    return meta, items


def main():
    os.makedirs(SRC, exist_ok=True)
    known = sections()
    groups = []

    for name in sorted(os.listdir(SRC)):
        if not name.endswith((".md", ".markdown")):
            continue
        meta, items = parse(os.path.join(SRC, name))
        if not items:
            continue

        for item in items:
            sec = known.get(item["section"])
            item["sectionTitle"] = sec["title"] if sec else ""
            item["sectionHref"] = sec["href"] if sec else ""
            item["tone"] = sec["tone"] if sec else ""

        stem = os.path.splitext(name)[0]
        groups.append(
            {
                "id": stem,
                "title": meta.get("title") or stem.replace("-", " ").title(),
                "about": meta.get("about", ""),
                "order": int(meta.get("order", 99) or 99),
                "file": f"resources/{name}",
                "items": items,
            }
        )

    groups.sort(key=lambda g: (g["order"], g["title"]))

    with open(OUT, "w", encoding="utf-8") as f:
        json.dump(groups, f, indent=1, ensure_ascii=False)
        f.write("\n")

    total = sum(len(g["items"]) for g in groups)
    tagged = sum(1 for g in groups for i in g["items"] if i["section"])
    print(f"Groups    : {len(groups)}")
    print(f"Resources : {total}  ({tagged} linked to a section)")
    for g in groups:
        print(f"  {g['order']:>3}  {g['title'][:30]:32} {len(g['items'])}")


if __name__ == "__main__":
    main()

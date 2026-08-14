#!/usr/bin/env python3
"""
generate.py — builds the whole site's structure from ONE file: syllabus.txt

    cd tools && python generate.py

What it writes
--------------
  docs/<NN-section>/<NN-topic>.mdx   new topic pages (existing files untouched)
  docs/<NN-section>/_category_.json  sidebar label + order        (regenerated)
  docs/<NN-section>/index.md         section landing page         (once)
  docs/intro.md                      syllabus map                 (regenerated)
  src/data/stats.json                sections / topics counters   (regenerated)
  src/data/tracks.json               homepage track cards         (regenerated)
  src/data/sections.json             globe nodes + ambient viz    (regenerated)

Because the homepage reads tracks.json and sections.json, every number on the
site — "40 sections", "578 topics", the "01 - 06" badges, the per-card topic
counts, the globe nodes - recomputes itself the moment you edit syllabus.txt.
Nothing is hard-coded in the React code any more.

syllabus.txt format
-------------------
    # anything after a hash is a comment

    >> Foundations | indigo | Short blurb for the homepage card
    01. Computer Fundamentals
    Computer Basics
    History of Computers
    ...
    02. Programming Fundamentals
    ...

  ">> name | tone | blurb" starts a homepage track. Everything up to the next
  ">>" belongs to it. tone and blurb are optional - leave them out and a colour
  is picked from the palette and the blurb is written from the section names.
  The card's "01 - 06" badge and its topic count are always computed, never
  typed by hand.

  "NN. Title" starts a section. Every plain line after it is one topic.

Safe by design: a topic page that already exists is never rewritten, so your
notes cannot be lost by re-running this script.
"""
import json
import os
import re

ROOT = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.dirname(ROOT)
SYL = os.path.join(ROOT, "syllabus.txt")
DOCS = os.path.join(REPO, "docs")
DATA = os.path.join(REPO, "src", "data")

SECTION_RE = re.compile(r"^(\d{2})\.\s*(.+)$")
TRACK_RE = re.compile(r"^>>\s*(.+)$")

# Used when a track line does not name a colour.
PALETTE = ["indigo", "cyan", "violet", "green", "amber", "pink", "teal", "rose"]


def slug(text: str) -> str:
    s = text.lower()
    s = s.replace("&", " and ").replace("+", "p").replace("#", "sharp")
    s = re.sub(r"[^a-z0-9]+", "-", s)
    return re.sub(r"-+", "-", s).strip("-") or "topic"


def yaml_str(text: str) -> str:
    return '"' + text.replace("\\", "\\\\").replace('"', '\\"') + '"'


# ------------------------------------------------------------------ parsing


def parse(path):
    """-> (tracks, sections); each track holds its sections, each its topics."""
    tracks = []
    sections = []

    with open(path, encoding="utf-8") as f:
        for raw in f:
            line = raw.strip()
            if not line or line.startswith("#"):
                continue

            track_m = TRACK_RE.match(line)
            if track_m:
                parts = [p.strip() for p in track_m.group(1).split("|")]
                tracks.append(
                    {
                        "label": parts[0],
                        "tone": parts[1] if len(parts) > 1 else "",
                        "blurb": parts[2] if len(parts) > 2 else "",
                        "sections": [],
                    }
                )
                continue

            sec_m = SECTION_RE.match(line)
            if sec_m:
                sec = {
                    "num": sec_m.group(1),
                    "title": sec_m.group(2).strip(),
                    "topics": [],
                }
                sections.append(sec)
                if not tracks:
                    # sections written before any >> marker still need a home
                    tracks.append(
                        {"label": "Syllabus", "tone": "", "blurb": "", "sections": []}
                    )
                tracks[-1]["sections"].append(sec)
                continue

            if sections:
                sections[-1]["topics"].append(line)

    return tracks, sections


# ------------------------------------------------------------------ templates

TOPIC_TMPL = """---
title: {title}
sidebar_position: {pos}
sidebar_label: {label}
slug: {docslug}
description: {desc}
---

import RunInLab from '@site/src/components/RunInLab';

# {plain}

## Overview

_{plain} - part of {section}. A short introduction goes here._

## Key Concepts

_The main ideas, one line each._

## Example

_A worked example with code._

## Run your code

<RunInLab topic="{plain}" lang="{lang}" />

## Practice Questions

_Questions to try once you have read the notes above._

## References

- [Search for "{plain}"](https://www.google.com/search?q={query})
"""

SECTION_INDEX_TMPL = """---
title: {title}
sidebar_position: 0
slug: /{sslug}
description: {desc}
---

# {plain}

This section covers **{count}** topics.

{links}
"""


def write_if_absent(path, content):
    if os.path.exists(path):
        return False
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)
    return True


def force_write(path, content):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)


def write_json(path, obj):
    force_write(path, json.dumps(obj, indent=2, ensure_ascii=False) + "\n")


# Sections whose practice cell should not default to Python.
LANG_HINTS = [
    ("web-development", "javascript"),
    ("database-systems", "sql"),
    ("computer-organization", "c"),
    ("operating-systems", "c"),
    ("embedded-systems", "c"),
    ("programming-fundamentals", "c"),
]


def lang_for(section_slug: str) -> str:
    for key, lang in LANG_HINTS:
        if section_slug.startswith(key):
            return lang
    return "python"


# ------------------------------------------------------------------ main


def main():
    tracks, sections = parse(SYL)
    os.makedirs(DOCS, exist_ok=True)

    created = skipped = total = 0
    rows = []
    section_data = []

    for t_index, track in enumerate(tracks):
        track["tone"] = track["tone"] or PALETTE[t_index % len(PALETTE)]

        for sec in track["sections"]:
            sec_slug = slug(sec["title"])
            folder = os.path.join(DOCS, f"{sec['num']}-{sec_slug}")
            os.makedirs(folder, exist_ok=True)
            sec_title = f"{sec['num']}. {sec['title']}"
            lang = lang_for(sec_slug)

            links = []
            for i, topic in enumerate(sec["topics"], start=1):
                fpath = os.path.join(folder, f"{i:02d}-{slug(topic)}.mdx")
                body = TOPIC_TMPL.format(
                    title=yaml_str(topic),
                    label=yaml_str(topic),
                    desc=yaml_str(f"{topic} - {sec['title']} | Open CS Hub"),
                    docslug=f"/{sec_slug}/{slug(topic)}",
                    plain=topic,
                    section=sec["title"],
                    pos=i,
                    lang=lang,
                    query=topic.replace(" ", "+").replace("&", "%26"),
                )
                if write_if_absent(fpath, body):
                    created += 1
                else:
                    skipped += 1
                links.append(f"- [{topic}](/docs/{sec_slug}/{slug(topic)})")
                total += 1

            # Sidebar label + order - always regenerated so renumbering is free.
            write_json(
                os.path.join(folder, "_category_.json"),
                {"label": sec_title, "position": int(sec["num"]), "collapsed": True},
            )

            if write_if_absent(
                os.path.join(folder, "index.md"),
                SECTION_INDEX_TMPL.format(
                    title=yaml_str(sec_title),
                    desc=yaml_str(f"{sec['title']} - all topics | Open CS Hub"),
                    sslug=sec_slug,
                    plain=sec_title,
                    count=len(sec["topics"]),
                    links="\n".join(links),
                ),
            ):
                created += 1
            else:
                skipped += 1

            rows.append(
                f"| `{sec['num']}` | [{sec['title']}](/docs/{sec_slug}) | "
                f"{len(sec['topics'])} | {track['label']} |"
            )
            section_data.append(
                {
                    "num": int(sec["num"]),
                    "title": sec["title"],
                    "slug": sec_slug,
                    "href": f"/docs/{sec_slug}",
                    "topics": len(sec["topics"]),
                    "track": track["label"],
                    "tone": track["tone"],
                }
            )

    # ---------------- homepage data ----------------

    track_data = []
    for track in tracks:
        secs = track["sections"]
        if not secs:
            continue
        first, last = secs[0], secs[-1]
        blurb = track["blurb"] or (
            ", ".join(s["title"] for s in secs[:6])
            + ("." if len(secs) <= 6 else ", and more.")
        )
        badge = f"{first['num']} - {last['num']}" if first is not last else first["num"]
        track_data.append(
            {
                "id": slug(track["label"]),
                "label": track["label"],
                "tone": track["tone"],
                "blurb": blurb,
                "badge": badge,
                "from": int(first["num"]),
                "to": int(last["num"]),
                "sectionCount": len(secs),
                "topics": sum(len(s["topics"]) for s in secs),
                "href": f"/docs/{slug(first['title'])}",
                "sections": [
                    {
                        "num": int(s["num"]),
                        "title": s["title"],
                        "href": f"/docs/{slug(s['title'])}",
                        "topics": len(s["topics"]),
                    }
                    for s in secs
                ],
            }
        )

    write_json(os.path.join(DATA, "tracks.json"), track_data)
    write_json(os.path.join(DATA, "sections.json"), section_data)
    write_json(
        os.path.join(DATA, "stats.json"),
        {"sections": len(sections), "topics": total, "tracks": len(track_data)},
    )

    # ---------------- intro page ----------------

    intro = f"""---
title: "Introduction"
sidebar_position: 0
slug: /
description: "A to Z Computer Science learning hub - {len(sections)} sections, {total} topics."
---

# Open - A to Z Computer Science

An **open learning hub** covering everything from programming fundamentals to
Data Structures, Algorithms, Machine Learning, Deep Learning, Generative AI
and Computer Vision.

:::tip[Always up to date]
This site is built **automatically** from the
[github.com/Subrata-CS/open](https://github.com/Subrata-CS/open) repository.
Edit any file, commit it, and the change is live within about two minutes -
no manual deployment step.
:::

## Syllabus map

**{len(sections)} sections · {total} topics · {len(track_data)} tracks**

| # | Section | Topics | Track |
|---|---------|--------|-------|
{chr(10).join(rows)}

---

## How to contribute

1. Open any page and click **Edit this page** at the bottom
2. Write Markdown and hit **Commit changes**
3. A GitHub Action rebuilds and redeploys the site automatically

To add a new topic, add a line to `tools/syllabus.txt` and run
`python tools/generate.py` - the page, the sidebar entry, the counters, the
homepage cards and the globe all update themselves.

---

*Prepared by **Subrata Pramanik***
"""
    force_write(os.path.join(DOCS, "intro.md"), intro)

    print(f"Tracks   : {len(track_data)}")
    print(f"Sections : {len(sections)}")
    print(f"Topics   : {total}")
    print(f"Created  : {created} new files")
    print(f"Skipped  : {skipped} existing files (content safe)")


if __name__ == "__main__":
    main()

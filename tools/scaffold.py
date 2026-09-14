#!/usr/bin/env python3
"""
Build the docs/ tree from tools/curriculum.py
============================================

    python3 tools/scaffold.py            # show what would change
    python3 tools/scaffold.py --write    # actually write it

What it does
------------
Every node in the curriculum becomes either

  * a folder, with a _category_.json and an index.mdx, if it has children
  * a single .mdx page, if it does not

Nesting is unlimited, so Stage > Section > Language > Chapter > Topic comes out
as five levels of folders and one file at the end.

Pages that have not been written yet carry `draft: true`. Docusaurus leaves
those out of a production build, so the live site never shows an empty page —
the file still sits in the repo waiting for you to paste content in. When you
write a page, delete that one line and it appears.

Existing pages are never overwritten. If a file already exists, it is left
exactly as it is, so re-running this after adding content is safe.
"""

from __future__ import annotations

import argparse
import json
import re
import sys
import unicodedata
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from curriculum import SITE  # noqa: E402

ROOT = Path(__file__).resolve().parent.parent
DOCS = ROOT / "docs"

DRAFT_MARK = "draft: true"


# ---------------------------------------------------------------------------
# slugs
# ---------------------------------------------------------------------------

def slugify(text: str) -> str:
    """A folder/file name that is safe, lowercase and readable."""
    text = unicodedata.normalize("NFKD", text)
    text = text.encode("ascii", "ignore").decode("ascii")
    text = text.lower()
    text = text.replace("c++", "cpp").replace("c#", "csharp")
    # keep "+" meaningful: "B+ trees" and "B-trees" are different topics and
    # must not collapse onto the same slug
    text = text.replace("+", " plus ")
    text = re.sub(r"[^a-z0-9]+", "-", text)
    return re.sub(r"-{2,}", "-", text).strip("-") or "untitled"


def numbered(index: int, slug: str) -> str:
    """01-slug — the prefix is what orders the sidebar."""
    return f"{index:02d}-{slug}"


# ---------------------------------------------------------------------------
# file contents
# ---------------------------------------------------------------------------

def category_json(title: str, description: str, position: int) -> str:
    return json.dumps(
        {
            "label": title,
            "position": position,
            "collapsed": True,
            "link": {"type": "generated-index", "description": description or title},
        },
        indent=2,
    ) + "\n"


def index_page(title: str, description: str, children: list[str], path_hint: str) -> str:
    """The landing page of a folder — says what is inside, without pretending
    the children are written."""
    listed = "\n".join(f"- {c}" for c in children)
    return f"""---
title: "{title}"
sidebar_label: "Overview"
sidebar_position: 0
description: "{description or title}"
---

# {title}

{description}

## What this covers

{listed}

{{/*
  This is the landing page for {path_hint}.
  Replace the list above with a real introduction whenever you like — it is a
  normal page and nothing else depends on it.
  MDX does not accept HTML comments; this brace-star form is the MDX comment.
*/}}
"""


def topic_page(title: str, position: int, breadcrumb: str) -> str:
    """A topic stub.

    `draft: true` keeps it out of the built site until it is written, so a
    reader never lands on an empty page. Delete that line to publish.
    """
    return f"""---
title: "{title}"
sidebar_label: "{title}"
sidebar_position: {position}
description: "{title} — {breadcrumb}"
{DRAFT_MARK}
---

{{/*
  ---------------------------------------------------------------------------
  NOT WRITTEN YET.

  Delete the `draft: true` line in the frontmatter above when this page has
  real content — that is what makes it appear on the live site.

  The ten parts of a finished page, in order:

    1. One-line answer      what this is, in a sentence a beginner understands
    2. Why it exists        the problem first, the definition second
    3. Diagram              <Diagram> or inline SVG inside <Fig>
    4. Explanation          small steps, plain language
    5. Live code            <RunInLab lang="..." code={{...}} />
    6. Step-through         <LiveDiagram> where something changes over time
    7. Common mistakes      the errors people actually make
    8. Table                comparison, or a summary worth keeping
    9. Practice             questions, answers inside <Answer>
   10. What to read next

  Breadcrumb: {breadcrumb}
  ---------------------------------------------------------------------------
*/}}

# {title}

"""


# ---------------------------------------------------------------------------
# walking the tree
# ---------------------------------------------------------------------------

class Stats:
    def __init__(self) -> None:
        self.folders = 0
        self.pages = 0
        self.kept = 0
        self.categories = 0


def write_if_new(path: Path, content: str, stats: Stats, write: bool) -> None:
    if path.exists():
        stats.kept += 1
        return
    if write:
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(content, encoding="utf-8")


def build(node: dict, parent: Path, position: int, trail: list[str],
          stats: Stats, write: bool) -> None:
    title = node["t"]
    desc = node.get("d", "")
    kids = node.get("c")
    here = trail + [title]

    if not kids:
        page = parent / (numbered(position, slugify(title)) + ".mdx")
        stats.pages += 1
        write_if_new(page, topic_page(title, position, " › ".join(trail)), stats, write)
        return

    folder = parent / numbered(position, slugify(title))
    stats.folders += 1
    if write:
        folder.mkdir(parents=True, exist_ok=True)

    cat = folder / "_category_.json"
    stats.categories += 1
    write_if_new(cat, category_json(title, desc, position), stats, write)

    write_if_new(
        folder / "index.mdx",
        index_page(title, desc, [k["t"] for k in kids], " › ".join(here)),
        stats,
        write,
    )

    for i, child in enumerate(kids, start=1):
        build(child, folder, i, here, stats, write)




# ---------------------------------------------------------------------------
# data files — regenerated from the same curriculum, so nothing drifts
# ---------------------------------------------------------------------------

TONES = ["indigo", "teal", "amber", "rose", "violet", "emerald"]


def doc_href(parts: list[str]) -> str:
    """Docusaurus strips the NN- prefix from every path segment."""
    return "/docs/" + "/".join(re.sub(r"^\d+-", "", p) for p in parts)


def collect(node: dict, parts: list[str], out: list, depth: int,
            stage: str, section: str, section_num: int, tone: str) -> int:
    """Walk the tree and record every leaf page. Returns the leaf count."""
    kids = node.get("c")
    if not kids:
        out.append({
            "title": node["t"],
            "slug": slugify(node["t"]),
            "href": doc_href(parts),
            "section": section,
            "sectionNum": section_num,
            "track": stage,
            "tone": tone,
            "position": len(out) + 1,
        })
        return 1
    total = 0
    for i, k in enumerate(kids, start=1):
        seg = numbered(i, slugify(k["t"])) if k.get("c") else numbered(i, slugify(k["t"]))
        total += collect(k, parts + [seg], out, depth + 1, stage, section, section_num, tone)
    return total


def write_data_files(write: bool) -> dict:
    sections, topics, tracks = [], [], []
    num = 0
    for si, stage in enumerate(SITE, start=1):
        tone = TONES[(si - 1) % len(TONES)]
        first_num = num + 1
        stage_topics = 0
        stage_seg = numbered(si, slugify(stage["t"]))
        for ci, sec in enumerate(stage.get("c", []), start=1):
            num += 1
            sec_seg = numbered(ci, slugify(sec["t"]))
            leaves: list = []
            count = collect(sec, [stage_seg, sec_seg], leaves, 0,
                            stage["t"], sec["t"], num, tone)
            for t in leaves:
                t["position"] = leaves.index(t) + 1
            topics.extend(leaves)
            stage_topics += count
            sections.append({
                "num": num,
                "title": sec["t"],
                "slug": slugify(sec["t"]),
                "href": doc_href([stage_seg, sec_seg]),
                "topics": count,
                "track": stage["t"],
                "tone": tone,
            })
        tracks.append({
            "id": slugify(stage["t"]),
            "label": stage["t"],
            "tone": tone,
            "blurb": stage.get("d", ""),
            "badge": f"{first_num:02d} - {num:02d}",
            "from": first_num,
            "to": num,
            "sectionCount": num - first_num + 1,
            "topics": stage_topics,
            "href": doc_href([stage_seg]),
        })

    if write:
        data = ROOT / "src" / "data"
        data.mkdir(parents=True, exist_ok=True)
        (data / "sections.json").write_text(json.dumps(sections, indent=2) + "\n", encoding="utf-8")
        (data / "topics.json").write_text(json.dumps(topics, indent=2) + "\n", encoding="utf-8")
        (data / "tracks.json").write_text(json.dumps(tracks, indent=2) + "\n", encoding="utf-8")

    return {"sections": len(sections), "topics": len(topics), "tracks": len(tracks)}


# ---------------------------------------------------------------------------

def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--write", action="store_true", help="actually create files")
    args = ap.parse_args()

    stats = Stats()
    for i, stage in enumerate(SITE, start=1):
        build(stage, DOCS, i, [], stats, args.write)

    print(f"  folders        {stats.folders}")
    print(f"  category files {stats.categories}")
    print(f"  topic pages    {stats.pages}")
    print(f"  already there  {stats.kept} (left untouched)")

    d = write_data_files(args.write)
    print(f"  data files     sections={d['sections']} topics={d['topics']} tracks={d['tracks']}")
    if not args.write:
        print("\n  dry run — nothing written. Add --write to create the tree.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

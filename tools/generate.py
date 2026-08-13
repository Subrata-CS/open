#!/usr/bin/env python3
"""
generate.py - builds the Docusaurus `docs/` tree from syllabus.txt

Usage:
    cd tools && python generate.py

Rules:
  - Existing .md files are NEVER overwritten -> your written content is safe
  - _category_.json, docs/intro.md and src/data/stats.json are regenerated
    so the sidebar and counters stay in sync
  - To add topics: add lines to syllabus.txt -> re-run -> commit
"""
import json
import os
import re

ROOT = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.dirname(ROOT)
SYL = os.path.join(ROOT, "syllabus.txt")
DOCS = os.path.join(REPO, "docs")

SECTION_RE = re.compile(r"^(\d{2})\.\s*(.+)$")


def slug(text: str) -> str:
    s = text.lower()
    s = s.replace("&", " and ").replace("+", "p").replace("#", "sharp")
    s = re.sub(r"[^a-z0-9]+", "-", s)
    return re.sub(r"-+", "-", s).strip("-") or "topic"


def yaml_str(text: str) -> str:
    return '"' + text.replace("\\", "\\\\").replace('"', '\\"') + '"'


def parse(path):
    sections = []
    with open(path, encoding="utf-8") as f:
        for raw in f:
            line = raw.strip()
            if not line:
                continue
            m = SECTION_RE.match(line)
            if m:
                sections.append({"num": m.group(1), "title": m.group(2).strip(), "topics": []})
            elif sections:
                sections[-1]["topics"].append(line)
    return sections


TOPIC_TMPL = """---
title: {title}
sidebar_position: {pos}
sidebar_label: {label}
slug: {docslug}
description: {desc}
---

# {plain}

:::note[Draft]
This page has not been written yet. To contribute, click **Edit this page** below.
:::

## Overview

_A short introduction to {plain}._

## Key Concepts

-
-
-

## Example

```python
# code example
```

## Practice Questions

1.
2.

## References

-
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
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)


def main():
    sections = parse(SYL)
    os.makedirs(DOCS, exist_ok=True)

    created = skipped = total = 0
    cards = []

    for sec in sections:
        folder_name = f"{sec['num']}-{slug(sec['title'])}"
        folder = os.path.join(DOCS, folder_name)
        os.makedirs(folder, exist_ok=True)
        sec_title = f"{sec['num']}. {sec['title']}"

        links = []
        for i, topic in enumerate(sec["topics"], start=1):
            fname = f"{i:02d}-{slug(topic)}.md"
            fpath = os.path.join(folder, fname)
            tslug = f"/{slug(sec['title'])}/{slug(topic)}"
            body = TOPIC_TMPL.format(
                title=yaml_str(topic),
                label=yaml_str(topic),
                desc=yaml_str(f"{topic} — {sec['title']} | Open CS Hub"),
                docslug=tslug,
                plain=topic,
                pos=i,
            )
            if write_if_absent(fpath, body):
                created += 1
            else:
                skipped += 1
            links.append(f"- [{topic}](/docs/{slug(sec['title'])}/{slug(topic)})")
            total += 1

        # Category config -> sidebar label + order (always regenerated)
        force_write(
            os.path.join(folder, "_category_.json"),
            json.dumps(
                {
                    "label": sec_title,
                    "position": int(sec["num"]),
                    "collapsed": True,
                    # Docusaurus picks up index.md as the category index
                    # automatically, so no explicit "link" is needed here.
                },
                indent=2,
                ensure_ascii=False,
            )
            + "\n",
        )

        idx = os.path.join(folder, "index.md")
        if write_if_absent(
            idx,
            SECTION_INDEX_TMPL.format(
                title=yaml_str(sec_title),
                desc=yaml_str(f"{sec['title']} — all topics | Open CS Hub"),
                sslug=slug(sec["title"]),
                plain=sec_title,
                count=len(sec["topics"]),
                links="\n".join(links),
            ),
        ):
            created += 1
        else:
            skipped += 1

        cards.append(
            f"| `{sec['num']}` | [{sec['title']}](/docs/{slug(sec['title'])}) | {len(sec['topics'])} |"
        )

    intro = f"""---
title: "Introduction"
sidebar_position: 0
slug: /
description: "A to Z Computer Science learning hub — 40 sections, {total} topics."
---

# Open — A to Z Computer Science

An **open learning hub** covering everything from programming fundamentals to
Data Structures, Algorithms, Machine Learning, Deep Learning, Generative AI
and Computer Vision.

:::tip[Always up to date]
This site is built **automatically** from the
[github.com/Subrata-CS/open](https://github.com/Subrata-CS/open) repository.
Edit any file, commit it, and the change is live within about two minutes —
no manual deployment step.
:::

## Syllabus map

**{len(sections)} sections · {total} topics**

| # | Section | Topics |
|---|---------|--------|
{chr(10).join(cards)}

---

## How to contribute

1. Open any page and click **Edit this page** at the bottom
2. Write Markdown and hit **Commit changes**
3. A GitHub Action rebuilds and redeploys the site automatically

To add a new topic, simply create a new `.md` file inside `docs/` — it appears
in the sidebar on its own. No configuration file needs to be touched.

---

*Prepared by **Subrata Pramanik***
"""
    force_write(os.path.join(DOCS, "intro.md"), intro)

    stats = {"sections": len(sections), "topics": total}
    force_write(
        os.path.join(REPO, "src", "data", "stats.json"),
        json.dumps(stats, indent=2) + "\n",
    )

    print(f"Sections : {len(sections)}")
    print(f"Topics   : {total}")
    print(f"Created  : {created} new files")
    print(f"Skipped  : {skipped} existing files (content safe)")


if __name__ == "__main__":
    main()

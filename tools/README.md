# tools/

`generate.py` builds the whole site's structure from **one file**, `syllabus.txt`.

```bash
cd tools && python generate.py
```

**Safe by design:** existing topic pages are **never overwritten**. Only missing
files are created.

### What is regenerated every run

| File | Feeds |
|---|---|
| `docs/*/_category_.json` | sidebar label + order |
| `docs/intro.md` | the syllabus map table |
| `src/data/stats.json` | the "40 sections · 578 topics" figures |
| `src/data/tracks.json` | the homepage "Choose a track" cards |
| `src/data/sections.json` | the nodes on the homepage globe |

Because of the last three, **no number is typed by hand anywhere in the React
code**. Section ranges (`01 – 06`), per-track topic counts, the number of
tracks and the globe nodes are all computed from the syllabus.

## syllabus.txt format

```
# a hash starts a comment

>> Foundations | indigo | Short blurb shown on the homepage card
01. Computer Fundamentals
Computer Basics
History of Computers
02. Programming Fundamentals
Programming Concepts
```

- `>> name | tone | blurb` starts a **track**. Every section until the next
  `>>` belongs to it. `tone` and `blurb` are optional — leave them off and a
  colour is taken from the palette and the blurb is written from the section
  names. Available tones: `indigo`, `cyan`, `violet`, `green`, `amber`, `pink`,
  `teal`, `rose`.
- `NN. Title` starts a **section**. Every plain line after it is one topic.

## Adding new topics or sections

1. Add lines to `syllabus.txt`
2. Run `python generate.py`
3. `git add . && git commit && git push` — the site rebuilds automatically

Renumbering is free: change `35.` to `36.` and everything — folder order,
sidebar position, the track badge on the homepage, the globe — follows.

For a single topic you don't need the script at all: create
`docs/<section>/NN-topic-name.mdx` by hand and it appears in the sidebar on its
own. Adding it to `syllabus.txt` too keeps the counters honest.

## refresh_stubs.py

`generate.py` never rewrites an existing page, which means an old placeholder
keeps its old shape forever. `refresh_stubs.py` closes that gap:

```bash
cd tools && python refresh_stubs.py          # report only
cd tools && python refresh_stubs.py --write  # apply
```

A page is rewritten **only** when it is still an untouched placeholder — no key
concepts written, no example, no practice questions. The moment you type one
real line into a page it is left alone permanently. Run it after you change the
topic template inside `generate.py`.


---

## Adding a Code Lab lesson

The left-hand lesson panel in the Code Lab is driven entirely by
`src/data/lessons.json`. Add one object and a new tab appears — no code
change, no rebuild step to remember.

```json
{
  "id": "cv",
  "label": "Computer Vision",
  "lang": "python",
  "lesson": [
    {
      "title": "Sobel edge detection from scratch",
      "note": "One or two sentences on why this example matters.",
      "lang": "python",
      "code": "import numpy as np\n...",
      "output": "edge pixels : 40 of 100"
    }
  ]
}
```

| Field | Meaning |
|---|---|
| `id` | Unique short id, also used for the download filename |
| `label` | Text shown on the tab |
| `lang` | Language the reader's first practice cell opens in |
| `lesson[].title` | Heading above the snippet |
| `lesson[].note` | Short explanation under the heading |
| `lesson[].lang` | Language of this snippet: `python`, `c`, `cpp`, `java`, `javascript`, `go`, `rust`, `sql`, `bash`, and the rest in `src/lib/runners.ts` |
| `lesson[].code` | The snippet itself |
| `lesson[].output` | Optional. Only include output you have actually run — leave it out when the result varies between runs (timings, random nonces) |

A track can hold as many cells as you like; add them to the `lesson` array.
The reader's own notebook on the right is never limited to these snippets —
it runs whatever they write, in any supported language.

---

## The link pipelines

Four pages are nothing but curated lists, and all four are built the same way:
one Markdown file per group, one line per link.

| Page | Folder | Builder | Data |
|---|---|---|---|
| Practice | `platforms/` | `build_platforms.py` | `src/data/platforms.json` |
| Resources | `resources/` | `build_resources.py` | `src/data/resources.json` |
| Global Career Links | `careers/` | `build_careers.py` | `src/data/careers.json` |
| Projects | `projects/` | `build_projects.py` | `src/data/projects.json` |

Each file starts with three optional front-matter keys — `title`, `about`,
`order` — and then a plain Markdown list:

```markdown
---
title: Big tech
about: The largest employers of software engineers on earth.
order: 1
---

- [Google](https://careers.google.com/) — the biggest new-grad intake anywhere.
- [Microsoft](https://careers.microsoft.com/)
```

The note after the em dash is optional, so the smallest entry really is a name
and a link. Lines that are not links are ignored, which means you can keep
working notes in the file.

```bash
cd tools && python build_careers.py
cd tools && python build_projects.py
```

**Careers is deduplicated.** `build_careers.py` compares company names loosely
(case, spaces and punctuation are ignored, so `HP Inc.` and `hp inc` are the
same employer) and drops the second copy with a warning. That is what lets
several separate lists be merged into `careers/` without the page showing
Qualcomm four times. Companies inside a group are sorted alphabetically by the
builder, so you can append to the bottom of a file and never think about it.

Contributors do not need any of this: the **+** on each group opens that
Markdown file straight in GitHub's editor, and the **+** in the page header
starts a whole new group from a template. Commit, and Actions rebuilds the
site.

# tools/

`generate.py` builds the `docs/` tree from `syllabus.txt`.

```bash
cd tools && python generate.py
```

**Safe by design:** existing `.md` files are **never overwritten**. Only missing
files are created. `_category_.json`, `docs/intro.md` and `src/data/stats.json`
are regenerated so the sidebar and counters stay in sync.

## Adding new topics

1. Add lines to `syllabus.txt` (section header format: `41. New Section`)
2. Run `python generate.py`
3. `git add . && git commit && git push` — the site rebuilds automatically

For a single topic you don't need the script at all: create
`docs/<section>/NN-topic-name.md` by hand and it appears in the sidebar on its own.


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

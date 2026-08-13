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

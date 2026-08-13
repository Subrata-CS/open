# tools/

`generate.py` — `syllabus.txt` theke `docs/` tree banay.

```bash
cd tools && python generate.py
```

**Safe by design:** je `.md` file already ache seta **kokhono overwrite kore na**.
Sudhu missing file create hoy, ar `_category_.json` / `docs/intro.md` /
`src/data/stats.json` regenerate hoy (sidebar + counter sync rakhar jonno).

## Notun topic add korte

1. `syllabus.txt` e line add koro (section header format: `41. New Section`)
2. `python generate.py` chalao
3. `git add . && git commit && git push` — site auto rebuild

Ekta topic sudhu ekbar-i add korte chaile generate.py na cholieo hobe —
`docs/<section>/NN-topic.md` file ta hate banao, sidebar-e automatically chole ashbe.

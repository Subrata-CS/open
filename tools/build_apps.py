#!/usr/bin/env python3
"""
build_apps.py — turn the apps/ folder into the Test Yourself page.

    cd tools && python build_apps.py

Drop a finished program into apps/<language>/<name>.<ext> and it appears on
/apps automatically. There is no registry to edit and no limit on how many you
add — a hundred files is a hundred applications.

Each file starts with a short header in its own comment syntax:

    // title: ATM machine
    // level: beginner
    // about: A cash machine with a PIN, balance and withdrawal limits.
    // input: 1234
    // input: 500

  title  what the reader sees in the list        (required)
  level  beginner | intermediate | advanced      (optional, default beginner)
  about  one or two sentences of context         (optional)
  input  a line of standard input for the run    (optional, repeatable)

Anything after the header is the program itself, shipped exactly as written.
"""
import json
import os
import re

ROOT = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.dirname(ROOT)
APPS = os.path.join(REPO, "apps")
OUT = os.path.join(REPO, "src", "data", "apps.json")

# folder name -> (runner language id, file extension, display label)
LANGUAGES = {
    "c": ("c", ".c", "C"),
    "cpp": ("cpp", ".cpp", "C++"),
    "python": ("python", ".py", "Python"),
    "javascript": ("javascript", ".js", "JavaScript"),
    "typescript": ("typescript", ".ts", "TypeScript"),
    "java": ("java", ".java", "Java"),
    "go": ("go", ".go", "Go"),
    "rust": ("rust", ".rs", "Rust"),
    "csharp": ("csharp", ".cs", "C#"),
    "sql": ("sql", ".sql", "SQL"),
    "ruby": ("ruby", ".rb", "Ruby"),
    "php": ("php", ".php", "PHP"),
    "bash": ("bash", ".sh", "Bash"),
    "r": ("r", ".R", "R"),
    "scala": ("scala", ".scala", "Scala"),
    "haskell": ("haskell", ".hs", "Haskell"),
    "lua": ("lua", ".lua", "Lua"),
    "perl": ("perl", ".pl", "Perl"),
}

HEADER = re.compile(
    r"^\s*(?://|#|--|;|%|\*)?\s*(title|level|about|input|tags)\s*:\s*(.*?)\s*$",
    re.I,
)


def parse(path):
    """Split a source file into its header fields and the program itself."""
    with open(path, encoding="utf-8") as f:
        lines = f.read().split("\n")

    meta = {"title": "", "level": "beginner", "about": "", "tags": [], "stdin": []}
    body_at = 0

    for i, line in enumerate(lines):
        if line.strip() in ("", "/*", "*/", "<!--", "-->", '"""'):
            body_at = i + 1
            continue
        m = HEADER.match(line)
        if not m:
            body_at = i
            break
        field, value = m.group(1).lower(), m.group(2)
        if field == "input":
            meta["stdin"].append(value)
        elif field == "tags":
            meta["tags"] = [t.strip() for t in value.split(",") if t.strip()]
        else:
            meta[field] = value
        body_at = i + 1

    meta["code"] = "\n".join(lines[body_at:]).strip("\n") + "\n"
    return meta


def main():
    apps = []
    if not os.path.isdir(APPS):
        os.makedirs(APPS, exist_ok=True)

    for folder in sorted(os.listdir(APPS)):
        spec = LANGUAGES.get(folder)
        if not spec or not os.path.isdir(os.path.join(APPS, folder)):
            continue
        lang, ext, label = spec

        for name in sorted(os.listdir(os.path.join(APPS, folder))):
            if not name.endswith(ext):
                continue
            path = os.path.join(APPS, folder, name)
            meta = parse(path)
            stem = os.path.splitext(name)[0]
            apps.append(
                {
                    "id": f"{folder}-{stem}",
                    "title": meta["title"] or stem.replace("-", " ").title(),
                    "lang": lang,
                    "langLabel": label,
                    "level": meta["level"].lower() or "beginner",
                    "about": meta["about"],
                    "tags": meta["tags"],
                    "stdin": "\n".join(meta["stdin"]),
                    "file": f"apps/{folder}/{name}",
                    "code": meta["code"],
                }
            )

    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    with open(OUT, "w", encoding="utf-8") as f:
        json.dump(apps, f, indent=1, ensure_ascii=False)
        f.write("\n")

    by_lang = {}
    for a in apps:
        by_lang[a["langLabel"]] = by_lang.get(a["langLabel"], 0) + 1
    print(f"Applications : {len(apps)}")
    for label, n in sorted(by_lang.items()):
        print(f"  {label:12} {n}")


if __name__ == "__main__":
    main()

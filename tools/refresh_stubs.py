#!/usr/bin/env python3
"""
refresh_stubs.py — re-issue topic pages that are still empty placeholders.

    cd tools && python refresh_stubs.py          # show what would change
    cd tools && python refresh_stubs.py --write  # actually rewrite them

`generate.py` never overwrites an existing page, which keeps your notes safe
but also means an old placeholder keeps its old shape forever. This script
closes that gap: a page is rewritten **only** when every section of it is
still untouched (no key concepts written, no example, no practice questions).
The moment you type one real line into a page it is left alone for good.

Run it after changing the template inside generate.py.
"""
import argparse
import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import generate  # noqa: E402  (same folder)

FM = re.compile(r"^---\n(.*?)\n---\n", re.S)

# A page counts as untouched when it still carries one of these skeletons and
# nothing has been written into the headings.
EMPTY_MARKERS = (
    "_A short introduction to",  # original template
    "- part of",  # current template
    "— part of",
)

WRITTEN_SIGNS = (
    re.compile(r"^-[ \t]+\S", re.M),  # a real bullet under Key Concepts
    re.compile(r"^\d+\.[ \t]+\S", re.M),  # a real practice question
    re.compile(r"^\|", re.M),  # a table
    re.compile(r"^>[ \t]+\S", re.M),  # a quote
)


def is_untouched(text: str) -> bool:
    body = FM.sub("", text, count=1)

    if not any(marker in body for marker in EMPTY_MARKERS):
        return False

    # References line added by the current template is allowed; strip it first.
    body = re.sub(r"^- \[Search for .*$", "", body, flags=re.M)

    # A fenced block with anything other than the placeholder comment is content.
    for block in re.findall(r"```[a-z]*\n(.*?)```", body, re.S):
        if block.strip() and block.strip() != "# code example":
            return False

    return not any(sign.search(body) for sign in WRITTEN_SIGNS)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--write", action="store_true", help="rewrite the files")
    args = parser.parse_args()

    tracks, _ = generate.parse(generate.SYL)

    changed = kept = same = missing = 0

    for track in tracks:
        for sec in track["sections"]:
            sec_slug = generate.slug(sec["title"])
            folder = os.path.join(generate.DOCS, f"{sec['num']}-{sec_slug}")
            lang = generate.lang_for(sec_slug)

            for i, topic in enumerate(sec["topics"], start=1):
                path = os.path.join(folder, f"{i:02d}-{generate.slug(topic)}.mdx")
                if not os.path.exists(path):
                    missing += 1
                    continue

                with open(path, encoding="utf-8") as f:
                    current = f.read()

                if not is_untouched(current):
                    kept += 1
                    continue

                fresh = generate.TOPIC_TMPL.format(
                    title=generate.yaml_str(topic),
                    label=generate.yaml_str(topic),
                    desc=generate.yaml_str(f"{topic} - {sec['title']} | Open CS Hub"),
                    docslug=f"/{sec_slug}/{generate.slug(topic)}",
                    plain=topic,
                    section=sec["title"],
                    pos=i,
                    lang=lang,
                )

                if fresh == current:
                    same += 1
                    continue

                changed += 1
                if args.write:
                    with open(path, "w", encoding="utf-8") as f:
                        f.write(fresh)

    verb = "Rewrote" if args.write else "Would rewrite"
    print(f"{verb} : {changed} placeholder pages")
    print(f"Kept    : {kept} pages that already have content")
    print(f"Current : {same} placeholder pages already on the latest template")
    if missing:
        print(f"Missing : {missing} (run generate.py first)")
    if not args.write and changed:
        print("\nNothing was written. Re-run with --write to apply.")


if __name__ == "__main__":
    try:
        main()
    except BrokenPipeError:
        # output was piped into something that closed early, e.g. `| head`
        os._exit(0)

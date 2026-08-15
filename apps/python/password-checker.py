# title: Password strength checker
# level: intermediate
# about: Scores a password the way a real sign-up form does — length, variety, common patterns — and explains every point.
# tags: strings, sets, validation

import re

COMMON = {"password", "123456", "qwerty", "admin", "letmein", "welcome"}

def assess(pw):
    score, notes = 0, []

    if len(pw) >= 12: score += 3; notes.append("+3  twelve characters or more")
    elif len(pw) >= 8: score += 2; notes.append("+2  at least eight characters")
    else: notes.append(" 0  too short — eight is the bare minimum")

    for label, pattern, points in [
        ("lower case", r"[a-z]", 1),
        ("upper case", r"[A-Z]", 1),
        ("a digit", r"\d", 1),
        ("a symbol", r"[^A-Za-z0-9]", 2),
    ]:
        if re.search(pattern, pw):
            score += points
            notes.append(f"+{points}  has {label}")
        else:
            notes.append(f" 0  no {label}")

    if pw.lower() in COMMON:
        score -= 4
        notes.append("-4  this is one of the most guessed passwords there is")
    if re.search(r"(.)\1{2,}", pw):
        score -= 1
        notes.append("-1  the same character three times in a row")
    if re.search(r"(abc|123|qwe)", pw.lower()):
        score -= 1
        notes.append("-1  contains a keyboard or counting run")

    verdict = "strong" if score >= 7 else "fair" if score >= 5 else "weak"
    return max(0, score), verdict, notes

for candidate in ["password", "Summer2026", "k9!Tarn-Vessel-42"]:
    score, verdict, notes = assess(candidate)
    print(f"\n{candidate!r}  ->  {score}/9  {verdict.upper()}")
    for note in notes:
        print("   ", note)

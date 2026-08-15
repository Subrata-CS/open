---
title: Linux command line
group: Systems
about: Navigating, finding things, and understanding what a machine is actually doing.
tags: linux, bash, shell, files, processes
---

## Moving around

| Command | What it does |
|---|---|
| `pwd` | where am I |
| `ls -lah` | list with sizes, permissions and hidden files |
| `cd -` | jump back to the previous directory |
| `tree -L 2` | folder structure, two levels deep |

## Finding things

```bash
find . -name "*.log" -mtime -7      # log files changed in the last week
grep -rn "TODO" src/                # every TODO, with line numbers
grep -c "ERROR" app.log             # count matching lines
du -sh * | sort -h                  # what is taking up space
```

`grep -rn` is the one to remember: recursive, with line numbers, so you can
jump straight to the place.

## Files

| Command | What it does |
|---|---|
| `head -20 file` / `tail -20 file` | first or last twenty lines |
| `tail -f app.log` | follow a log as it is written |
| `wc -l file` | count lines |
| `sort file \| uniq -c \| sort -rn` | count and rank duplicates |
| `chmod +x script.sh` | make a script runnable |

## Processes

```bash
ps aux | grep node        # is it running
top                       # live view of CPU and memory
kill -9 <pid>             # stop it, without asking
df -h                     # disk space per mount
free -h                   # memory in use
```

## Pipes

The idea that makes the shell worth learning: each program does one thing, and
`|` passes the output of one into the next.

```bash
cat access.log | awk '{print $1}' | sort | uniq -c | sort -rn | head -5
```

That is: take the log, pull the first column, sort it, count duplicates, rank
them, show the top five. Five small tools, one line, no script.

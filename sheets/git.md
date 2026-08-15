---
title: Git
group: Version control
about: The commands that cover almost every day, plus the three that get you out of trouble.
tags: git, branches, remotes, undo
---

## Starting out

| Command | What it does |
|---|---|
| `git init` | start tracking the current folder |
| `git clone <url>` | copy a remote repository, history and all |
| `git status` | what has changed, staged and unstaged |
| `git log --oneline --graph` | history as a readable tree |

## The daily loop

```bash
git add .                       # stage everything changed
git commit -m "what and why"    # record it
git push                        # send it to the remote
git pull                        # take what others pushed
```

Stage only part of a file with `git add -p` — it asks about each chunk. This is
how you keep a commit about one thing.

## Branches

| Command | What it does |
|---|---|
| `git switch -c feature-x` | make a branch and move onto it |
| `git switch main` | go back |
| `git merge feature-x` | bring the branch into the current one |
| `git branch -d feature-x` | delete it once merged |

## Getting out of trouble

| Situation | Command |
|---|---|
| Wrong commit message, not pushed | `git commit --amend` |
| Undo the last commit, keep the changes | `git reset --soft HEAD~1` |
| Throw away local changes to one file | `git restore <file>` |
| Need to park work for a moment | `git stash` then `git stash pop` |
| Find which commit broke something | `git bisect start` |

:::caution
`git reset --hard` deletes uncommitted work with no undo. `git revert` is the
safe one — it makes a new commit that reverses an old one, and keeps history.
:::

## Remotes

```bash
git remote -v                        # which remotes exist
git remote add origin <url>          # attach one
git push -u origin main              # first push, sets the default
git fetch --all --prune              # update refs, drop deleted branches
```

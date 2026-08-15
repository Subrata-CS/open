# Security

This is a static site. There is no server, no database and no user account, so
the usual list of web vulnerabilities — SQL injection, session hijacking,
server-side code execution — has nothing to attack here. What remains is worth
being deliberate about.

## What protects the site

**Content Security Policy.** Declared in the document head (GitHub Pages
cannot set HTTP headers). It is an allow-list: the browser will only load
scripts, styles and data from this origin and the handful of services the site
genuinely uses. A script injected into the page — through a compromised
dependency, a malicious pull request, or anything else — is refused by the
browser before it runs. `frame-ancestors 'none'` also means no one can wrap
this site in an iframe and phish visitors with it.

**Pinned dependencies.** Every runtime loaded from a CDN names an exact
version (Pyodide, sql.js, TypeScript, WebLLM). An unpinned import means
whatever is published tomorrow runs on our readers' machines.

**Code runs sandboxed.** Reader code executes in a Web Worker or inside
WebAssembly, never with access to the page, its storage, or the DOM. The
worker is created fresh and terminated after use.

**No secrets exist.** There is no API key anywhere in this repository, because
nothing here needs one. That is a design decision, not an oversight: a key
shipped to a browser is a public key.

**No personal data.** Reading progress and editor drafts live in the reader's
own browser. Nothing is collected, and there is nothing to leak.

**Dependencies are audited.** `npm overrides` in `package.json` force patched
versions of transitive packages that the toolchain would otherwise pull in.
The remaining advisories all sit in `image-size`, which Docusaurus uses while
*building* the site — it never runs in a visitor's browser, and there is no
patched release yet. Re-check with `npm audit --omit=dev` after every
Docusaurus upgrade.

## What only you can protect

The realistic way this site gets defaced is through the GitHub account, not
through the site. Keep these in place:

1. **Two-factor authentication** on the GitHub account.
2. **Branch protection** on `main`: require a pull request, and do not allow
   force pushes.
3. **Workflow permissions** set to read-only by default
   (Settings → Actions → General → Workflow permissions).
4. **Review Dependabot pull requests** rather than merging them blind.
5. Never paste an API key or token into a file in this repository. If one ever
   is committed, rotate it — removing the commit is not enough.

## About copying

A public website cannot stop its content being copied, and it is worth being
clear about why rather than pretending otherwise. Everything a visitor's
browser can display, it has already downloaded. "Right-click disabled" scripts
are defeated by Ctrl+U, by DevTools, by `curl`, and by turning JavaScript off —
while getting in the way of readers who simply wanted to copy a command. This
project does not use them.

What does work is licensing, and it is in place:

- **Code** is MIT — reuse freely, keep the notice.
- **Written notes** are CC BY-NC-SA 4.0 — reuse is allowed only with credit,
  only non-commercially, and only under the same licence.

That turns copying-without-credit from something annoying into a licence
breach and a copyright infringement, which is a claim you can actually act on:
GitHub, Google and every hosting provider accept DMCA takedown requests, and a
dated public commit history is strong evidence of who wrote it first.

Practical steps if you find your notes republished:

1. Screenshot it, and note the date.
2. Point at your commit history as proof of authorship.
3. File a takedown with the host, citing the licence terms above.

## Reporting

Found something? Open an issue at
<https://github.com/Subrata-CS/open/issues>, or say so privately through the
contact details on the profile page.

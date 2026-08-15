/**
 * Reading progress, kept in the reader's own browser.
 *
 * No account, no server, nothing sent anywhere — just a list of the topic
 * paths this browser has marked as read. Clearing site data clears it, which
 * is exactly what a reader would expect.
 */

const KEY = 'open-cs-progress';
export const PROGRESS_EVENT = 'open-progress-change';

function read(): Set<string> {
  if (typeof localStorage === 'undefined') return new Set();
  try {
    const raw = localStorage.getItem(KEY);
    return new Set<string>(raw ? (JSON.parse(raw) as string[]) : []);
  } catch {
    return new Set();
  }
}

function write(done: Set<string>): void {
  try {
    localStorage.setItem(KEY, JSON.stringify([...done]));
  } catch {
    /* storage full or blocked — progress is a nicety, never a blocker */
  }
  window.dispatchEvent(new Event(PROGRESS_EVENT));
}

/** Topic pages only: /docs/<section>/<topic>. Landing pages do not count. */
export function isTopic(pathname: string): boolean {
  const at = pathname.indexOf('/docs/');
  if (at === -1) return false;
  return pathname.slice(at + 6).replace(/\/$/, '').split('/').length === 2;
}

/** Strip the base path so progress survives a change of deployment folder. */
export function keyFor(pathname: string): string {
  const at = pathname.indexOf('/docs/');
  return at === -1 ? pathname : pathname.slice(at).replace(/\/$/, '');
}

export function isDone(pathname: string): boolean {
  return read().has(keyFor(pathname));
}

export function toggle(pathname: string): boolean {
  const done = read();
  const key = keyFor(pathname);
  const nowDone = !done.has(key);
  if (nowDone) done.add(key);
  else done.delete(key);
  write(done);
  return nowDone;
}

export function count(): number {
  return read().size;
}

export function clearAll(): void {
  write(new Set());
}

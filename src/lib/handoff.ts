import type { LangId } from './runners';

/**
 * Carries a snippet from a topic page into the Code Lab, and remembers
 * where the reader came from so they can jump straight back.
 */

const KEY = 'open-cs-lab-handoff';

export type Handoff = {
  code?: string;
  lang: LangId;
  topic: string;
  returnUrl: string;
  returnTitle: string;
};

export function sendToLab(payload: Handoff): void {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(payload));
  } catch {
    /* private mode — the lab simply opens empty */
  }
}

export function takeHandoff(): Handoff | null {
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Handoff;
  } catch {
    return null;
  }
}

export function clearHandoff(): void {
  try {
    sessionStorage.removeItem(KEY);
  } catch {
    /* nothing to clear */
  }
}

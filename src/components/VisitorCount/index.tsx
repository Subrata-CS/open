import { useEffect, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import styles from './styles.module.css';

/**
 * A lifetime visitor count, and a year that never goes stale.
 *
 * The count is kept by a free public counter service — no account, no key, no
 * database of our own. Two deliberate choices:
 *
 *  - a browser is counted once, ever. After its first visit a flag is stored
 *    locally and every later visit only reads the number. So this is closer to
 *    "people who have seen the site" than "page loads", and refreshing does
 *    not inflate it.
 *  - owner mode is skipped entirely, so your own visits never count.
 *
 * The year is computed in the browser rather than baked in at build time, so
 * the footer is still correct in 2030 even if nothing is ever rebuilt.
 *
 * It renders into the real copyright element rather than beside it, so the
 * line stays inside <footer> where it belongs.
 */

const KEY = 'subrata-cs-open-visits';
const API = 'https://countapi.mileshilliard.com/api/v1';
const SEEN = 'open-cs-counted';

export default function VisitorCount(): ReactNode {
  const [count, setCount] = useState<number | null>(null);
  const [year, setYear] = useState<number | null>(null);
  const [host, setHost] = useState<HTMLElement | null>(null);

  // Take over the theme's copyright line once it is on the page.
  useEffect(() => {
    const find = () => {
      const el = document.querySelector<HTMLElement>('.footer__copyright');
      if (el) {
        el.textContent = '';
        setHost(el);
        return true;
      }
      return false;
    };
    if (find()) return;
    const timer = window.setInterval(() => {
      if (find()) window.clearInterval(timer);
    }, 200);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    setYear(new Date().getFullYear());

    const owner = document.documentElement.dataset.owner === '1';
    let counted = true;
    try {
      counted = localStorage.getItem(SEEN) === '1';
    } catch {
      /* private mode — just read the number */
    }

    // A first-time visitor increments; everyone else, and the owner, only read.
    const url = counted || owner ? `${API}/get/${KEY}` : `${API}/hit/${KEY}`;

    let cancelled = false;
    fetch(url)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (cancelled || !data) return;
        const value = Number(data.value);
        if (Number.isFinite(value)) setCount(value);
        if (!counted && !owner) {
          try {
            localStorage.setItem(SEEN, '1');
          } catch {
            /* nothing to do */
          }
        }
      })
      .catch(() => {
        /* the footer works fine without a number */
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (!host) return null;

  return createPortal(
    <span className={styles.line}>
      <a className={styles.licence} href="https://github.com/Subrata-CS/open/blob/main/LICENSE">
        Code MIT · Notes CC BY-NC-SA
      </a>{' '}
      · © {year ?? new Date().getFullYear()} Subrata Pramanik
      {count !== null && (
        <>
          {' · '}
          <span className={styles.count} title="Readers who have visited, all time">
            <span className={styles.dot} aria-hidden="true" />
            {count.toLocaleString()} readers
          </span>
        </>
      )}
    </span>,
    host,
  );
}

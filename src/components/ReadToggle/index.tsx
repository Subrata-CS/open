import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { useLocation } from '@docusaurus/router';
import stats from '@site/src/data/stats.json';
import { PROGRESS_EVENT, count, isDone, isTopic, toggle } from '@site/src/lib/progress';
import styles from './styles.module.css';

/**
 * A small pill on every topic page: mark it read, and see how far through the
 * syllabus you are. Kept out of the article flow so it never interrupts
 * reading, and hidden entirely when printing.
 */
export default function ReadToggle(): ReactNode {
  const { pathname } = useLocation();
  const [done, setDone] = useState(false);
  const [total, setTotal] = useState(0);
  const [mounted, setMounted] = useState(false);

  const refresh = useCallback(() => {
    setDone(isDone(pathname));
    setTotal(count());
  }, [pathname]);

  useEffect(() => {
    setMounted(true);
    refresh();
    window.addEventListener(PROGRESS_EVENT, refresh);
    return () => window.removeEventListener(PROGRESS_EVENT, refresh);
  }, [refresh]);

  // "m" marks the current topic without reaching for the mouse.
  useEffect(() => {
    if (!isTopic(pathname)) return;
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement;
      if (el && /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName)) return;
      if (e.key === 'm' && !e.metaKey && !e.ctrlKey && !e.altKey) {
        setDone(toggle(pathname));
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [pathname]);

  if (!mounted || !isTopic(pathname)) return null;

  const pct = Math.round((total / stats.topics) * 100);

  return (
    <div className={styles.dock}>
      <button
        type="button"
        className={done ? `${styles.mark} ${styles.on}` : styles.mark}
        onClick={() => setDone(toggle(pathname))}
        title="Press m">
        <span className={styles.tick} aria-hidden="true">
          {done ? '✓' : ''}
        </span>
        {done ? 'Read' : 'Mark as read'}
      </button>

      <span className={styles.meter} title={`${total} of ${stats.topics} topics`}>
        <span className={styles.fill} style={{ width: `${Math.max(2, pct)}%` }} />
      </span>

      <span className={styles.tally}>
        {total}<small>/{stats.topics}</small>
      </span>
    </div>
  );
}

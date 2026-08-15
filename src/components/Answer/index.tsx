import { useState, type ReactNode } from 'react';
import styles from './styles.module.css';

/**
 * A hidden answer under a practice question.
 *
 * Wrap the solution in <Answer> and the reader has to commit to a guess before
 * they can see it — which is the whole point of a practice question.
 *
 *   1. What is 2A in decimal?
 *      <Answer>42 — because 2 x 16 + 10.</Answer>
 */
export default function Answer({
  children,
  label = 'Show answer',
}: {
  children: ReactNode;
  label?: string;
}): ReactNode {
  const [open, setOpen] = useState(false);

  return (
    <div className={styles.wrap}>
      <button
        type="button"
        className={styles.toggle}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}>
        <span className={styles.chev} aria-hidden="true">
          {open ? '▾' : '▸'}
        </span>
        {open ? 'Hide answer' : label}
      </button>

      {open && <div className={styles.body}>{children}</div>}
    </div>
  );
}

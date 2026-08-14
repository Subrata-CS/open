import { useEffect, useState, type ReactNode } from 'react';
import styles from './styles.module.css';

export default function ScrollButtons(): ReactNode {
  const [atTop, setAtTop] = useState(true);
  const [atBottom, setAtBottom] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setAtTop(y < 120);
      setAtBottom(max - y < 120);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  const toTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });
  const toBottom = () =>
    window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' });

  return (
    <div className={styles.dock} aria-hidden={atTop && atBottom}>
      <button
        type="button"
        onClick={toTop}
        aria-label="Scroll to top"
        className={atTop ? styles.hidden : styles.btn}>
        <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
          <path
            d="M12 19V6M6 12l6-6 6 6"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      <button
        type="button"
        onClick={toBottom}
        aria-label="Scroll to bottom"
        className={atBottom ? styles.hidden : styles.btn}>
        <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
          <path
            d="M12 5v13M6 12l6 6 6-6"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </div>
  );
}

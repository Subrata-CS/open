import { useEffect, useState, type ReactNode } from 'react';
import { useLocation } from '@docusaurus/router';
import Viz from '@site/src/components/Viz';
import { HOME_CYCLE, vizForPath, type SectionViz } from '@site/src/components/Viz/sectionMap';
import styles from './styles.module.css';

/**
 * A low-contrast animated layer that sits behind every page.
 * On a docs page it shows the visualisation for that section
 * (machine learning -> model fitting, networks -> packets, ...).
 * On the homepage it cycles through several.
 */
export default function AmbientVisual(): ReactNode {
  const { pathname } = useLocation();
  const sectionViz = vizForPath(pathname);
  const isDocs = pathname.includes('/docs/') || pathname.endsWith('/docs');

  const [cycle, setCycle] = useState(0);

  useEffect(() => {
    if (sectionViz) return;
    const id = setInterval(() => setCycle((c) => (c + 1) % HOME_CYCLE.length), 9000);
    return () => clearInterval(id);
  }, [sectionViz]);

  const current: SectionViz = sectionViz ?? HOME_CYCLE[cycle];

  return (
    <div className={styles.layer} aria-hidden="true">
      <div className={isDocs ? styles.canvasDocs : styles.canvas} key={`${current.kind}-${cycle}`}>
        <Viz kind={current.kind} />
      </div>
      <span className={styles.caption}>{current.caption}</span>
    </div>
  );
}

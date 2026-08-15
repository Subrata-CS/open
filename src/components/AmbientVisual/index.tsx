import { useEffect, useMemo, useState, type CSSProperties, type ReactNode } from 'react';
import { useLocation } from '@docusaurus/router';
import Viz from '@site/src/components/Viz';
import { HOME_CYCLE, vizForPath, type SectionViz } from '@site/src/components/Viz/sectionMap';
import sectionsData from '@site/src/data/sections.json';
import { toneOf } from '@site/src/lib/tones';
import styles from './styles.module.css';

/**
 * The animated layer behind every page.
 *
 * Two jobs, pulling against each other. It should feel alive and belong to the
 * subject — machine learning fits a model, networks push packets, and the
 * colour comes from that section's own track — while never making a single
 * word harder to read.
 *
 * Both are satisfied by ordering: the animation is large and saturated, but a
 * scrim sits above it and below the content, darkening exactly the column
 * where text lives. Colour reads at the edges, the middle stays calm. On small
 * screens the effect is quieter, and anyone who has asked their system for
 * less motion gets a still image.
 */

type Section = { slug: string; tone: string; title: string; track: string };
const SECTIONS = sectionsData as Section[];

/** Which section a pathname belongs to, if any. */
function sectionFor(pathname: string): Section | null {
  const at = pathname.indexOf('/docs/');
  if (at === -1) return null;
  const slug = pathname.slice(at + 6).split('/')[0];
  return SECTIONS.find((s) => s.slug === slug) ?? null;
}

/** Away from the docs the colour cycles along with the visual. */
const HOME_TONES = ['indigo', 'cyan', 'violet', 'green', 'amber', 'pink'];

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
  const section = useMemo(() => sectionFor(pathname), [pathname]);
  const colour = toneOf(section ? section.tone : HOME_TONES[cycle % HOME_TONES.length]);

  const skin = {
    '--amb': colour.base,
    '--amb-line': colour.line,
    '--amb-rgb': colour.rgb,
  } as CSSProperties;

  return (
    <div
      className={styles.layer}
      style={skin}
      data-mode={isDocs ? 'docs' : 'wide'}
      aria-hidden="true">
      <div className={styles.wash} key={`wash-${colour.base}`} />
      <div className={styles.grid} />

      <div
        className={isDocs ? styles.canvasDocs : styles.canvas}
        key={`${current.kind}-${cycle}`}>
        <Viz kind={current.kind} />
      </div>

      {/* a second, mirrored copy on the far side gives the page some depth */}
      {!isDocs && (
        <div className={styles.echo} key={`echo-${current.kind}-${cycle}`}>
          <Viz kind={current.kind} />
        </div>
      )}

      {/* the readability scrim — above the animation, below every word */}
      <div className={styles.scrim} />

      <span className={styles.caption}>
        {section ? `${section.title} · ${current.caption}` : current.caption}
      </span>
    </div>
  );
}

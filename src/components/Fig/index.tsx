import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import styles from './styles.module.css';

/**
 * A frame for every diagram on the site.
 *
 * One wrapper, so each figure behaves the same way wherever it appears:
 *
 *  - a header strip naming the figure, with the controls on the right
 *  - the arrows inside the diagram flow, and can be paused
 *  - zoom in and out, for a wide diagram on a small screen
 *  - open large, so a phone reader can actually read the labels
 *  - jump above / jump below, so a tall diagram never traps the reader
 *
 * The child is a plain <svg>. Nothing about the diagram itself changes: the
 * flow animation is driven by the .nx-flow and .nx-ctrl classes the SVG
 * already uses.
 */

export type FigProps = {
  /** Short tag shown at the left of the header, e.g. "Fig 1". */
  label?: string;
  /** What the diagram shows, e.g. "The IPO cycle". */
  title?: string;
  /** Sentence printed under the diagram. */
  caption?: ReactNode;
  /** Start with the arrows moving. Off for a still, print-like figure. */
  animated?: boolean;
  /**
   * A second <svg> laid out tall and narrow, shown instead of the wide one on
   * phones. Without it a wide diagram still works, but the reader has to
   * scroll sideways to follow it.
   */
  narrow?: ReactNode;
  /** The wide <svg>, used on tablets and desktops. */
  children: ReactNode;
};

const ZOOM_MIN = 100;
const ZOOM_MAX = 260;
const ZOOM_STEP = 30;

export default function Fig({
  label,
  title,
  caption,
  animated = true,
  narrow,
  children,
}: FigProps): ReactNode {
  const [playing, setPlaying] = useState(animated);
  const [zoom, setZoom] = useState(ZOOM_MIN);
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLElement | null>(null);

  /* Someone who has asked their system for less motion gets a still diagram. */
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) setPlaying(false);
  }, []);

  /* Escape closes the large view, and the page must not scroll behind it. */
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = previous;
    };
  }, [open]);

  const jump = useCallback((where: 'above' | 'below') => {
    const el = wrapRef.current;
    if (!el) return;
    const box = el.getBoundingClientRect();
    const top = window.scrollY + (where === 'above' ? box.top - 90 : box.bottom - 90);
    window.scrollTo({ top, behavior: 'smooth' });
  }, []);

  const stage = (
    <div className={styles.viewport}>
      <div className={styles.canvas} style={{ width: `${zoom}%` }}>
        <div className={styles.wide}>{children}</div>
        {narrow && <div className={styles.narrow}>{narrow}</div>}
      </div>
    </div>
  );

  const controls = (
    <div className={styles.tools}>
      <button
        type="button"
        className={styles.tool}
        onClick={() => setPlaying((p) => !p)}
        aria-pressed={playing}
        title={playing ? 'Pause the arrows' : 'Play the arrows'}
      >
        {playing ? 'Pause' : 'Play'}
      </button>
      <button
        type="button"
        className={styles.tool}
        onClick={() => setZoom((z) => Math.max(ZOOM_MIN, z - ZOOM_STEP))}
        disabled={zoom <= ZOOM_MIN}
        title="Zoom out"
        aria-label="Zoom out"
      >
        &minus;
      </button>
      <span className={styles.zoom}>{zoom}%</span>
      <button
        type="button"
        className={styles.tool}
        onClick={() => setZoom((z) => Math.min(ZOOM_MAX, z + ZOOM_STEP))}
        disabled={zoom >= ZOOM_MAX}
        title="Zoom in"
        aria-label="Zoom in"
      >
        +
      </button>
      <button
        type="button"
        className={styles.tool}
        onClick={() => setOpen(true)}
        title="Open large"
      >
        Open large
      </button>
    </div>
  );

  return (
    <figure
      className={[styles.fig, playing ? styles.playing : '', narrow ? styles.hasNarrow : '']
        .filter(Boolean)
        .join(' ')}
      ref={wrapRef}
    >
      <header className={styles.head}>
        <span className={styles.label}>
          {label && <b className={styles.tag}>{label}</b>}
          {title}
        </span>
        {controls}
      </header>

      {stage}

      <div className={styles.foot}>
        {caption && <figcaption className={styles.caption}>{caption}</figcaption>}
        <div className={styles.jumps}>
          <button
            type="button"
            className={styles.jump}
            onClick={() => jump('above')}
            title="Back to the start of this diagram"
            aria-label="Scroll to the start of this diagram"
          >
            <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
              <path
                d="M12 19V6M6 12l6-6 6 6"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <button
            type="button"
            className={styles.jump}
            onClick={() => jump('below')}
            title="Skip past this diagram"
            aria-label="Skip past this diagram"
          >
            <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
              <path
                d="M12 5v13M6 12l6 6 6-6"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <div
          className={styles.overlay}
          role="dialog"
          aria-modal="true"
          aria-label={title ? `${title} — large view` : 'Diagram — large view'}
          onClick={() => setOpen(false)}
        >
          <div className={styles.sheet} onClick={(e) => e.stopPropagation()}>
            <header className={styles.head}>
              <span className={styles.label}>
                {label && <b className={styles.tag}>{label}</b>}
                {title}
              </span>
              <button type="button" className={styles.tool} onClick={() => setOpen(false)}>
                Close
              </button>
            </header>
            <div className={`${styles.viewport} ${styles.viewportBig}`}>
              <div className={styles.canvas} style={{ width: `${Math.max(zoom, 140)}%` }}>
                <div className={styles.wide}>{children}</div>
                {narrow && <div className={styles.narrow}>{narrow}</div>}
              </div>
            </div>
            {caption && <p className={styles.caption}>{caption}</p>}
          </div>
        </div>
      )}
    </figure>
  );
}

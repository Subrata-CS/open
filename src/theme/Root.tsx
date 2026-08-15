import { useEffect, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { useLocation } from '@docusaurus/router';
import AmbientVisual from '@site/src/components/AmbientVisual';
import ScrollButtons from '@site/src/components/ScrollButtons';
import AiPanel, { OPEN_EVENT } from '@site/src/components/AiPanel';
import ReadToggle from '@site/src/components/ReadToggle';
import VisitorCount from '@site/src/components/VisitorCount';
import LiveDiagram, { diagramFor } from '@site/src/components/LiveDiagram';

const OWNER_KEY = 'open-cs-owner';

/**
 * Root wrapper — rendered on every page.
 *
 * - ambient section visualisation + scroll dock
 * - a short cross-fade whenever the route changes, so moving between
 *   pages reads as one continuous surface rather than a hard cut
 * - "owner mode": visit any page once with ?owner=1 and the editing
 *   affordances become visible on this browser only. ?owner=0 turns
 *   them back off. Visitors never see them.
 * - the Ask AI drawer, plus the click handler that opens it. The navbar
 *   entries are recognised by their class, so the menu stays plain
 *   configuration and no page navigation ever happens.
 * - reading progress, and a live diagram on each section landing page
 * - keyboard navigation: j / k move between topics, / focuses search
 */
export default function Root({ children }: { children: ReactNode }): ReactNode {
  const { search, pathname } = useLocation();

  useEffect(() => {
    const param = new URLSearchParams(search).get('owner');
    if (param === '1') localStorage.setItem(OWNER_KEY, '1');
    if (param === '0') localStorage.removeItem(OWNER_KEY);
    const on = localStorage.getItem(OWNER_KEY) === '1';
    document.documentElement.dataset.owner = on ? '1' : '0';
  }, [search]);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const link = (event.target as HTMLElement)?.closest?.('a.ai-item');
      if (!link) return;
      event.preventDefault();
      const id =
        ['chatgpt', 'claude', 'perplexity'].find((name) =>
          link.classList.contains(`ai-${name}`),
        ) ?? '';
      window.dispatchEvent(new CustomEvent(OPEN_EVENT, { detail: id }));
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  /* ---- keyboard navigation ---- */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      const typing =
        el && (/^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName) || el.isContentEditable);
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      if (e.key === '/' && !typing) {
        e.preventDefault();
        const search = document.querySelector<HTMLElement>(
          '.navbar__search-input, .DocSearch-Button',
        );
        search?.click();
        search?.focus();
        return;
      }
      if (typing) return;

      // j and k follow the Previous / Next links the docs already render.
      const go = (rel: 'prev' | 'next') => {
        const link = document.querySelector<HTMLAnchorElement>(
          `.pagination-nav__link--${rel}`,
        );
        if (link) {
          e.preventDefault();
          link.click();
        }
      };
      if (e.key === 'j') go('next');
      if (e.key === 'k') go('prev');
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  /* ---- a live diagram on section landing pages ---- */
  const [slot, setSlot] = useState<{ host: HTMLElement; slug: string } | null>(null);

  useEffect(() => {
    setSlot(null);
    const at = pathname.indexOf('/docs/');
    if (at === -1) return;
    const parts = pathname.slice(at + 6).replace(/\/$/, '').split('/');
    if (parts.length !== 1 || !parts[0]) return; // section landing pages only

    const timer = window.setTimeout(() => {
      const article = document.querySelector('article');
      const anchor = article?.querySelector('h1');
      if (!article || !anchor) return;
      const host = document.createElement('div');
      anchor.insertAdjacentElement('afterend', host);
      setSlot({ host, slug: parts[0] });
    }, 60);

    return () => window.clearTimeout(timer);
  }, [pathname]);

  return (
    <>
      <AmbientVisual />
      <div className="page-transition" key={pathname}>
        {children}
      </div>
      <ScrollButtons />
      <AiPanel />
      <ReadToggle />
      <VisitorCount />
      {slot && createPortal(<LiveDiagram kind={diagramFor(slot.slug)} />, slot.host)}
    </>
  );
}

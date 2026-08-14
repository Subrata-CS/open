import { useEffect, type ReactNode } from 'react';
import { useLocation } from '@docusaurus/router';
import AmbientVisual from '@site/src/components/AmbientVisual';
import ScrollButtons from '@site/src/components/ScrollButtons';

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

  return (
    <>
      <AmbientVisual />
      <div className="page-transition" key={pathname}>
        {children}
      </div>
      <ScrollButtons />
    </>
  );
}

import type { ReactNode } from 'react';
import ScrollButtons from '@site/src/components/ScrollButtons';

/**
 * Root wrapper — renders on every page.
 * Adds the floating scroll up / down controls site-wide.
 */
export default function Root({ children }: { children: ReactNode }): ReactNode {
  return (
    <>
      {children}
      <ScrollButtons />
    </>
  );
}

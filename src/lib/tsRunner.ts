/**
 * TypeScript is transpiled in the browser and then run by the same sandboxed
 * Web Worker JavaScript uses — so it needs no compile server and no network
 * round-trip once the compiler has loaded.
 */

import type { RunResult } from './pyodide';
import { runJavaScript } from './jsRunner';

const TS_CDN = 'https://cdnjs.cloudflare.com/ajax/libs/typescript/5.6.3/typescript.min.js';

type TsLike = {
  transpileModule: (
    code: string,
    opts: { compilerOptions: Record<string, unknown> },
  ) => { outputText: string; diagnostics?: unknown[] };
};

declare global {
  interface Window {
    ts?: TsLike;
    __openTs__?: Promise<TsLike>;
  }
}

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    const el = document.createElement('script');
    el.src = src;
    el.onload = () => resolve();
    el.onerror = () => reject(new Error('Could not load the TypeScript compiler.'));
    document.head.appendChild(el);
  });
}

function getTs(): Promise<TsLike> {
  if (!window.__openTs__) {
    window.__openTs__ = loadScript(TS_CDN).then(() => {
      if (!window.ts) throw new Error('TypeScript compiler unavailable.');
      return window.ts;
    });
  }
  return window.__openTs__;
}

export async function runTypeScript(
  code: string,
  onProgress?: (msg: string) => void,
): Promise<RunResult> {
  try {
    onProgress?.('Loading the TypeScript compiler…');
    const ts = await getTs();

    onProgress?.('Transpiling…');
    const { outputText } = ts.transpileModule(code, {
      compilerOptions: { target: 'ES2020', module: 'None' },
    });

    onProgress?.('Running…');
    return runJavaScript(outputText);
  } catch (err) {
    return { ok: false, output: String(err) };
  }
}

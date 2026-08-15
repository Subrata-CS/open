import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import styles from './styles.module.css';

/**
 * A chat model that runs on the reader's own machine.
 *
 * WebLLM compiles a small open model to WebGPU, so once the weights are
 * downloaded the conversation happens entirely inside the browser: no API key,
 * no server, no bill to anyone, and nothing leaves the device. That is the only
 * honest way to offer "free and live" on a static site — every hosted
 * assistant either wants a key or forbids being embedded.
 *
 * The costs, stated plainly rather than hidden: it needs WebGPU (Chrome or
 * Edge on a desktop today), a one-off download of roughly 800 MB that the
 * browser then caches, and the model is small, so it is good for explanations
 * and definitions rather than hard reasoning. When WebGPU is missing this
 * component says so and sends the reader to the hosted assistants instead.
 */

const CDN = 'https://esm.run/@mlc-ai/web-llm';
const MODEL = 'Llama-3.2-1B-Instruct-q4f16_1-MLC';

const SYSTEM = [
  'You are a concise computer science tutor inside a free learning site.',
  'Answer in plain English, a few short paragraphs at most.',
  'Use a small code example when it genuinely helps.',
  'If you are unsure, say so rather than inventing details.',
].join(' ');

type Message = { role: 'user' | 'assistant'; content: string };

type Engine = {
  chat: {
    completions: {
      create: (opts: {
        messages: { role: string; content: string }[];
        stream: boolean;
        temperature?: number;
        max_tokens?: number;
      }) => Promise<AsyncIterable<{ choices: { delta: { content?: string } }[] }>>;
    };
  };
};

type Support = 'checking' | 'ready' | 'unsupported';

export default function LocalAi({ context }: { context: string }): ReactNode {
  const [support, setSupport] = useState<Support>('checking');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [thinking, setThinking] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState('');
  const engineRef = useRef<Engine | null>(null);
  const logRef = useRef<HTMLDivElement>(null);

  /* --------------------------------------------------------- capability */

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const gpu = (navigator as Navigator & { gpu?: { requestAdapter: () => Promise<unknown> } })
        .gpu;
      if (!gpu) {
        if (!cancelled) setSupport('unsupported');
        return;
      }
      try {
        const adapter = await gpu.requestAdapter();
        if (!cancelled) setSupport(adapter ? 'ready' : 'unsupported');
      } catch {
        if (!cancelled) setSupport('unsupported');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight });
  }, [messages, thinking]);

  /* ------------------------------------------------------------- engine */

  const load = useCallback(async () => {
    if (engineRef.current || loading) return engineRef.current;
    setLoading(true);
    setStatus('Fetching the model — first time only, then it is cached.');
    try {
      const webllm = await import(/* webpackIgnore: true */ CDN);
      const engine = await webllm.CreateMLCEngine(MODEL, {
        initProgressCallback: (p: { text?: string; progress?: number }) => {
          const pct = p.progress ? ` ${Math.round(p.progress * 100)}%` : '';
          setStatus(`${p.text ?? 'Loading'}${pct}`);
        },
      });
      engineRef.current = engine as Engine;
      setStatus('');
      return engineRef.current;
    } catch (err) {
      setStatus(`Could not start the local model: ${String(err).slice(0, 140)}`);
      return null;
    } finally {
      setLoading(false);
    }
  }, [loading]);

  const send = useCallback(async () => {
    const text = draft.trim();
    if (!text || thinking) return;

    const history: Message[] = [...messages, { role: 'user', content: text }];
    setMessages(history);
    setDraft('');
    setThinking(true);

    const engine = await load();
    if (!engine) {
      setThinking(false);
      return;
    }

    try {
      const stream = await engine.chat.completions.create({
        messages: [
          { role: 'system', content: context ? `${SYSTEM} The reader is on the page: ${context}.` : SYSTEM },
          ...history,
        ],
        stream: true,
        temperature: 0.6,
        max_tokens: 700,
      });

      setMessages((m) => [...m, { role: 'assistant', content: '' }]);
      for await (const chunk of stream) {
        const piece = chunk.choices[0]?.delta?.content ?? '';
        if (!piece) continue;
        setMessages((m) => {
          const next = [...m];
          next[next.length - 1] = {
            role: 'assistant',
            content: next[next.length - 1].content + piece,
          };
          return next;
        });
      }
    } catch (err) {
      setMessages((m) => [
        ...m,
        { role: 'assistant', content: `Something went wrong: ${String(err).slice(0, 160)}` },
      ]);
    } finally {
      setThinking(false);
    }
  }, [context, draft, load, messages, thinking]);

  /* -------------------------------------------------------------- views */

  if (support === 'checking') {
    return <p className={styles.status}>Checking whether this browser can run a model…</p>;
  }

  if (support === 'unsupported') {
    return (
      <div className={styles.unsupported}>
        <b>This browser cannot run a model locally.</b>
        <p>
          Running an assistant on your own machine needs WebGPU — Chrome or Edge on a
          desktop or laptop today. On a phone, or in Safari and Firefox, use one of the
          hosted assistants above instead.
        </p>
      </div>
    );
  }

  return (
    <div className={styles.chat}>
      <div className={styles.log} ref={logRef}>
        {messages.length === 0 && !status && (
          <p className={styles.hint}>
            Runs on your own machine — free, private, and it keeps working offline.
            The first question downloads the model (about 800 MB), which the browser
            then caches; after that it is instant.
          </p>
        )}

        {messages.map((m, i) => (
          <div
            key={i}
            className={m.role === 'user' ? styles.fromUser : styles.fromModel}>
            {m.content || '…'}
          </div>
        ))}

        {thinking && messages[messages.length - 1]?.role === 'user' && (
          <div className={styles.fromModel}>…</div>
        )}
      </div>

      {status && <p className={styles.status}>{status}</p>}

      <div className={styles.composer}>
        <textarea
          className={styles.input}
          rows={2}
          value={draft}
          placeholder="Ask anything about this topic…"
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              void send();
            }
          }}
        />
        <button
          type="button"
          className={styles.send}
          onClick={() => void send()}
          disabled={thinking || loading || !draft.trim()}>
          {loading ? 'Loading…' : thinking ? 'Thinking…' : 'Send'}
        </button>
      </div>
    </div>
  );
}

import { runPython, type RunResult } from './pyodide';
import { runJavaScript } from './jsRunner';

/**
 * Where code runs
 * ---------------
 *  Python      — Pyodide, entirely inside the browser (offline, no limits)
 *  JavaScript  — a sandboxed Web Worker, also entirely local
 *  Everything else — compiled and executed by Wandbox, a free public service
 *
 * Anything the reader writes runs, not just the samples on the page.
 */

const WANDBOX = 'https://wandbox.org/api/compile.json';

export type LangId =
  | 'python'
  | 'javascript'
  | 'c'
  | 'cpp'
  | 'java'
  | 'typescript'
  | 'go'
  | 'rust'
  | 'csharp'
  | 'ruby'
  | 'php'
  | 'sql'
  | 'bash'
  | 'r'
  | 'swift'
  | 'scala'
  | 'haskell'
  | 'lua'
  | 'perl';

export type LangSpec = {
  id: LangId;
  label: string;
  /** Prism language used for highlighting. */
  prism: string;
  /** Extension used when downloading. */
  ext: string;
  /** Wandbox compiler id — omitted for locally executed languages. */
  compiler?: string;
  /** Runs in the browser rather than remotely. */
  local?: boolean;
  starter: string;
};

export const LANGS: LangSpec[] = [
  {
    id: 'python',
    label: 'Python',
    prism: 'python',
    ext: 'py',
    local: true,
    starter: 'print("hello from Python")\n',
  },
  {
    id: 'javascript',
    label: 'JavaScript',
    prism: 'javascript',
    ext: 'js',
    local: true,
    starter: 'console.log("hello from JavaScript");\n',
  },
  {
    id: 'c',
    label: 'C',
    prism: 'c',
    ext: 'c',
    compiler: 'gcc-13.2.0-c',
    starter:
      '#include <stdio.h>\n\nint main(void) {\n    printf("hello from C\\n");\n    return 0;\n}\n',
  },
  {
    id: 'cpp',
    label: 'C++',
    prism: 'cpp',
    ext: 'cpp',
    compiler: 'gcc-13.2.0',
    starter:
      '#include <iostream>\n\nint main() {\n    std::cout << "hello from C++" << std::endl;\n}\n',
  },
  {
    id: 'java',
    label: 'Java',
    prism: 'java',
    ext: 'java',
    compiler: 'openjdk-jdk-21+35',
    starter:
      'public class Main {\n    public static void main(String[] args) {\n        System.out.println("hello from Java");\n    }\n}\n',
  },
  {
    id: 'typescript',
    label: 'TypeScript',
    prism: 'typescript',
    ext: 'ts',
    compiler: 'typescript-5.6.2',
    starter: 'const msg: string = "hello from TypeScript";\nconsole.log(msg);\n',
  },
  {
    id: 'go',
    label: 'Go',
    prism: 'go',
    ext: 'go',
    compiler: 'go-1.23.2',
    starter: 'package main\n\nimport "fmt"\n\nfunc main() {\n    fmt.Println("hello from Go")\n}\n',
  },
  {
    id: 'rust',
    label: 'Rust',
    prism: 'rust',
    ext: 'rs',
    compiler: 'rust-1.82.0',
    starter: 'fn main() {\n    println!("hello from Rust");\n}\n',
  },
  {
    id: 'csharp',
    label: 'C#',
    prism: 'csharp',
    ext: 'cs',
    compiler: 'mono-6.12.0.199',
    starter:
      'using System;\n\nclass Program {\n    static void Main() {\n        Console.WriteLine("hello from C#");\n    }\n}\n',
  },
  {
    id: 'sql',
    label: 'SQL',
    prism: 'sql',
    ext: 'sql',
    compiler: 'sqlite-3.46.1',
    starter:
      "CREATE TABLE student(id INTEGER, name TEXT, marks INTEGER);\nINSERT INTO student VALUES (1, 'Asha', 91), (2, 'Rahul', 78);\nSELECT name, marks FROM student ORDER BY marks DESC;\n",
  },
  {
    id: 'ruby',
    label: 'Ruby',
    prism: 'ruby',
    ext: 'rb',
    compiler: 'ruby-3.4.9',
    starter: 'puts "hello from Ruby"\n',
  },
  {
    id: 'php',
    label: 'PHP',
    prism: 'php',
    ext: 'php',
    compiler: 'php-8.3.12',
    starter: '<?php\necho "hello from PHP\\n";\n',
  },
  {
    id: 'bash',
    label: 'Bash',
    prism: 'bash',
    ext: 'sh',
    compiler: 'bash',
    starter: 'echo "hello from Bash"\nfor i in 1 2 3; do echo "line $i"; done\n',
  },
  {
    id: 'r',
    label: 'R',
    prism: 'r',
    ext: 'R',
    compiler: 'r-4.4.1',
    starter: 'x <- c(4, 8, 15, 16, 23, 42)\ncat("mean:", mean(x), "\\n")\ncat("sd  :", sd(x), "\\n")\n',
  },
  {
    id: 'swift',
    label: 'Swift',
    prism: 'swift',
    ext: 'swift',
    compiler: 'swift-6.0.1',
    starter: 'print("hello from Swift")\n',
  },
  {
    id: 'scala',
    label: 'Scala',
    prism: 'scala',
    ext: 'scala',
    compiler: 'scala-3.5.1',
    starter: '@main def run(): Unit =\n  println("hello from Scala")\n',
  },
  {
    id: 'haskell',
    label: 'Haskell',
    prism: 'haskell',
    ext: 'hs',
    compiler: 'ghc-9.10.1',
    starter: 'main :: IO ()\nmain = putStrLn "hello from Haskell"\n',
  },
  {
    id: 'lua',
    label: 'Lua',
    prism: 'lua',
    ext: 'lua',
    compiler: 'lua-5.4.7',
    starter: 'print("hello from Lua")\n',
  },
  {
    id: 'perl',
    label: 'Perl',
    prism: 'perl',
    ext: 'pl',
    compiler: 'perl-5.40.0',
    starter: 'print "hello from Perl\\n";\n',
  },
];

export function langById(id: LangId): LangSpec {
  return LANGS.find((l) => l.id === id) ?? LANGS[0];
}

/**
 * Wandbox compiles a single file called prog.java, so a top-level
 * `public class` is rejected. Dropping the modifier changes nothing
 * about the program and lets the reader write ordinary Java.
 */
function prepare(langId: LangId, code: string): string {
  if (langId !== 'java') return code;
  return code.replace(/^[ \t]*public[ \t]+(class|interface|enum|record)\b/gm, '$1');
}

async function runRemote(
  spec: LangSpec,
  code: string,
  stdin: string,
  onProgress?: (m: string) => void,
): Promise<RunResult> {
  onProgress?.(`Compiling ${spec.label}…`);
  try {
    const res = await fetch(WANDBOX, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        compiler: spec.compiler,
        code: prepare(spec.id, code),
        stdin,
        save: false,
      }),
    });

    if (!res.ok) {
      return {
        ok: false,
        output:
          res.status === 429
            ? 'Too many runs in a short time — wait a few seconds and try again.'
            : `The compile service returned ${res.status}. Try again in a moment.`,
      };
    }

    const data = await res.json();
    const compileErr: string = (data?.compiler_error ?? '').trim();
    const out: string = (data?.program_output ?? '').trim();
    const runErr: string = (data?.program_error ?? '').trim();
    const ok = String(data?.status ?? '1') === '0';

    if (compileErr && !out) return { ok: false, output: compileErr };

    const parts = [out, runErr].filter(Boolean);
    if (compileErr) parts.push('--- compiler warnings ---', compileErr);

    return { ok, output: parts.join('\n') || '(no output)' };
  } catch {
    return {
      ok: false,
      output:
        'Could not reach the compile service. Check your connection and try again — Python and JavaScript still run offline.',
    };
  }
}

export async function runCode(
  langId: LangId,
  code: string,
  stdin = '',
  onProgress?: (m: string) => void,
): Promise<RunResult> {
  const spec = langById(langId);
  if (spec.id === 'python') return runPython(code, onProgress, stdin);
  if (spec.id === 'javascript') {
    onProgress?.('Running…');
    return runJavaScript(code);
  }
  return runRemote(spec, code, stdin, onProgress);
}

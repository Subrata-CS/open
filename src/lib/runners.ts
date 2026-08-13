import { runPython, type RunResult } from './pyodide';

/**
 * Language support.
 *
 * Python runs entirely in the browser (Pyodide) — no network, no limits.
 * Everything else is compiled and executed by the public Piston service.
 */

const PISTON = 'https://emkc.org/api/v2/piston/execute';

export type LangId =
  | 'python'
  | 'c'
  | 'cpp'
  | 'java'
  | 'javascript'
  | 'typescript'
  | 'go'
  | 'rust'
  | 'csharp'
  | 'kotlin'
  | 'ruby'
  | 'php'
  | 'sql';

export type LangSpec = {
  id: LangId;
  label: string;
  /** Prism language for highlighting / the ``` fence. */
  prism: string;
  /** File extension used when downloading. */
  ext: string;
  /** Piston language key (undefined for locally executed languages). */
  piston?: string;
  /** Filename Piston compiles — matters for Java. */
  file?: string;
  /** Executed in the browser rather than remotely. */
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
    id: 'c',
    label: 'C',
    prism: 'c',
    ext: 'c',
    piston: 'c',
    file: 'main.c',
    starter: '#include <stdio.h>\n\nint main(void) {\n    printf("hello from C\\n");\n    return 0;\n}\n',
  },
  {
    id: 'cpp',
    label: 'C++',
    prism: 'cpp',
    ext: 'cpp',
    piston: 'c++',
    file: 'main.cpp',
    starter:
      '#include <iostream>\n\nint main() {\n    std::cout << "hello from C++" << std::endl;\n    return 0;\n}\n',
  },
  {
    id: 'java',
    label: 'Java',
    prism: 'java',
    ext: 'java',
    piston: 'java',
    file: 'Main.java',
    starter:
      'public class Main {\n    public static void main(String[] args) {\n        System.out.println("hello from Java");\n    }\n}\n',
  },
  {
    id: 'javascript',
    label: 'JavaScript',
    prism: 'javascript',
    ext: 'js',
    piston: 'javascript',
    file: 'main.js',
    starter: 'console.log("hello from JavaScript");\n',
  },
  {
    id: 'typescript',
    label: 'TypeScript',
    prism: 'typescript',
    ext: 'ts',
    piston: 'typescript',
    file: 'main.ts',
    starter: 'const msg: string = "hello from TypeScript";\nconsole.log(msg);\n',
  },
  {
    id: 'go',
    label: 'Go',
    prism: 'go',
    ext: 'go',
    piston: 'go',
    file: 'main.go',
    starter:
      'package main\n\nimport "fmt"\n\nfunc main() {\n    fmt.Println("hello from Go")\n}\n',
  },
  {
    id: 'rust',
    label: 'Rust',
    prism: 'rust',
    ext: 'rs',
    piston: 'rust',
    file: 'main.rs',
    starter: 'fn main() {\n    println!("hello from Rust");\n}\n',
  },
  {
    id: 'csharp',
    label: 'C#',
    prism: 'csharp',
    ext: 'cs',
    piston: 'csharp',
    file: 'Main.cs',
    starter:
      'using System;\n\nclass Program {\n    static void Main() {\n        Console.WriteLine("hello from C#");\n    }\n}\n',
  },
  {
    id: 'kotlin',
    label: 'Kotlin',
    prism: 'kotlin',
    ext: 'kt',
    piston: 'kotlin',
    file: 'Main.kt',
    starter: 'fun main() {\n    println("hello from Kotlin")\n}\n',
  },
  {
    id: 'ruby',
    label: 'Ruby',
    prism: 'ruby',
    ext: 'rb',
    piston: 'ruby',
    file: 'main.rb',
    starter: 'puts "hello from Ruby"\n',
  },
  {
    id: 'php',
    label: 'PHP',
    prism: 'php',
    ext: 'php',
    piston: 'php',
    file: 'main.php',
    starter: '<?php\necho "hello from PHP\\n";\n',
  },
  {
    id: 'sql',
    label: 'SQL',
    prism: 'sql',
    ext: 'sql',
    piston: 'sqlite3',
    file: 'main.sql',
    starter:
      'CREATE TABLE student(id INTEGER, name TEXT, marks INTEGER);\nINSERT INTO student VALUES (1, \'Asha\', 91), (2, \'Rahul\', 78);\nSELECT name, marks FROM student ORDER BY marks DESC;\n',
  },
];

export function langById(id: LangId): LangSpec {
  return LANGS.find((l) => l.id === id) ?? LANGS[0];
}

async function runRemote(
  spec: LangSpec,
  code: string,
  stdin: string,
  onProgress?: (m: string) => void,
): Promise<RunResult> {
  onProgress?.(`Compiling ${spec.label}…`);
  try {
    const res = await fetch(PISTON, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        language: spec.piston,
        version: '*',
        files: [{ name: spec.file, content: code }],
        stdin,
      }),
    });

    if (!res.ok) {
      return {
        ok: false,
        output:
          res.status === 429
            ? 'Too many runs in a short time. Wait a few seconds and try again.'
            : `Execution service returned ${res.status}.`,
      };
    }

    const data = await res.json();
    const compileErr = data?.compile?.stderr?.trim();
    if (compileErr) return { ok: false, output: compileErr };

    const out = [data?.run?.stdout, data?.run?.stderr].filter(Boolean).join('\n').trim();
    return { ok: (data?.run?.code ?? 0) === 0, output: out || '(no output)' };
  } catch {
    return {
      ok: false,
      output: 'Could not reach the execution service. Check your connection and try again.',
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
  if (spec.local) return runPython(code, onProgress);
  return runRemote(spec, code, stdin, onProgress);
}

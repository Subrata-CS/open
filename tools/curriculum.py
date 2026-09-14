"""
The curriculum, as data.
========================

One file describes the whole site. Run `python3 tools/scaffold.py` and the
`docs/` tree is rebuilt to match it.

A node is a dict:

    {"t": "Title", "d": "one-line description", "c": [ ...children... ]}

  - a node WITH children  -> becomes a folder with a _category_.json
  - a node WITHOUT children -> becomes a single .mdx page

Nesting is unlimited, so

    Stage > Section > Language > Chapter > Topic

is just five levels of the same shape. Add a level by adding a "c" list.

To add a topic: find the chapter, add one line to its "c" list, re-run the
scaffold. Nothing else needs touching — the sidebar is generated from the
folders.
"""

# ---------------------------------------------------------------------------
# helpers so the data below stays readable
# ---------------------------------------------------------------------------

def N(t, d="", c=None):
    """A node: title, description, children."""
    node = {"t": t, "d": d}
    if c:
        node["c"] = c
    return node


def P(*titles):
    """Several leaf pages in a row, no descriptions."""
    return [N(t) for t in titles]


# ===========================================================================
# STAGE 0 — Foundation (class 11-12 level, assumes nothing)
# ===========================================================================

STAGE_0 = N("Foundation", "Start here if you are starting from zero.", [

    N("How a Computer Actually Works", "What the machine is doing underneath.", [
        N("Inside the machine", "", P(
            "What a computer is",
            "Input, process, output, storage",
            "The CPU",
            "Memory and storage — the difference",
            "Buses and how parts talk",
            "What happens when you press a key",
        )),
        N("Numbers the machine uses", "", P(
            "Why binary",
            "Binary to decimal and back",
            "Octal and hexadecimal",
            "Bits, bytes and units",
            "How text is stored — ASCII and Unicode",
            "How numbers with decimals are stored",
            "How images, sound and video are stored",
        )),
        N("Hardware and software", "", P(
            "Hardware you can point at",
            "System software vs application software",
            "What an operating system does",
            "Generations of computers",
            "Types of computers",
        )),
    ]),

    N("Using a Computer Well", "Skills assumed by every later section.", [
        N("Files and folders", "", P(
            "How a file system is organised",
            "Paths — absolute and relative",
            "File extensions and what they mean",
            "Backing up work",
        )),
        N("The internet", "", P(
            "What happens when you open a website",
            "Searching effectively",
            "Judging whether a source is reliable",
            "Staying safe online",
        )),
    ]),

    N("The Command Line and Linux Basics", "The tool every later section assumes.", [
        N("Getting started", "", P(
            "Why a terminal still matters",
            "Opening a terminal on Windows, Mac and Linux",
            "Your first commands",
        )),
        N("Moving around", "", P(
            "pwd, ls, cd",
            "Making and removing files and folders",
            "Copying and moving",
            "Wildcards",
        )),
        N("Doing real work", "", P(
            "Reading files — cat, less, head, tail",
            "Searching — grep and find",
            "Pipes and redirection",
            "Permissions",
            "Processes",
            "Editing with nano and vim",
            "Writing your first shell script",
        )),
    ]),

    N("School Mathematics Refresher",
      "The maths every CS course assumes you already have.", [
        N("Number and algebra", "", P(
            "Number systems",
            "Fractions, ratio and percentage",
            "Powers and roots",
            "Logarithms",
            "Algebraic expressions",
            "Linear equations",
            "Quadratic equations",
            "Inequalities",
        )),
        N("Sets, relations and functions", "", P(
            "Sets and set notation",
            "Operations on sets",
            "Venn diagrams",
            "Relations",
            "Functions",
            "Composition and inverse",
        )),
        N("Sequences and series", "", P(
            "Sequences",
            "Arithmetic progression",
            "Geometric progression",
            "Summation notation",
        )),
        N("Counting", "", P(
            "Fundamental counting principle",
            "Permutations",
            "Combinations",
            "Binomial theorem",
        )),
        N("Matrices and vectors", "", P(
            "What a matrix is",
            "Matrix operations",
            "Determinant and inverse",
            "Vectors in two and three dimensions",
        )),
        N("Trigonometry and geometry", "", P(
            "Angles and the unit circle",
            "Sine, cosine, tangent",
            "Coordinate geometry",
            "Lines and slopes",
        )),
        N("A first look at calculus", "", P(
            "Limits, intuitively",
            "What a derivative measures",
            "What an integral measures",
        )),
        N("A first look at probability", "", P(
            "Chance and sample space",
            "Basic probability rules",
            "Averages — mean, median, mode",
        )),
    ]),

    N("Logic and Reasoning", "How to think precisely before you code.", [
        N("Statements and truth", "", P(
            "Propositions",
            "AND, OR, NOT",
            "Implication",
            "Truth tables",
        )),
        N("Arguments", "", P(
            "Valid and invalid arguments",
            "Common fallacies",
            "Proof by example and counterexample",
        )),
        N("Thinking in steps", "", P(
            "Breaking a problem down",
            "Working through an example by hand",
            "Checking your own reasoning",
        )),
    ]),

    N("Your First Program", "From zero to a program that runs.", [
        N("Setting up", "", P(
            "Choosing a first language",
            "Installing what you need",
            "Running code without installing anything",
            "Your first program",
        )),
        N("The basics", "", P(
            "Output",
            "Variables",
            "Input",
            "Doing arithmetic",
            "Making a decision",
            "Repeating something",
        )),
        N("When it goes wrong", "", P(
            "Reading an error message",
            "Finding a bug by printing",
            "Asking a good question",
        )),
    ]),

    N("How to Learn Computer Science", "Study method, honestly described.", [
        N("Learning well", "", P(
            "Why reading alone does not work",
            "Practice, spacing and recall",
            "Taking notes that are worth re-reading",
            "Building things as a way of learning",
        )),
        N("Staying on track", "", P(
            "Choosing what to learn next",
            "Handling being stuck",
            "Using AI assistants without outsourcing your thinking",
        )),
    ]),
])


# ===========================================================================
# The C language — the reference standard, built to full depth
# ===========================================================================

C_LANGUAGE = N("C", "The language most first-year courses start with.", [

    N("Getting started", "", P(
        "What C is and why it still matters",
        "Installing a compiler",
        "Your first C program",
        "How compilation works — source to executable",
        "The structure of a C program",
        "Comments",
        "Reading compiler errors without panic",
    )),

    N("Variables and data types", "", P(
        "Variables and declaration",
        "int",
        "float and double",
        "char",
        "Signed and unsigned",
        "Integer overflow — what really happens",
        "Type conversion and promotion",
        "Explicit casting",
        "const",
        "volatile",
        "sizeof and memory layout",
        "Constants and literals",
        "Storage classes — auto, static, extern, register",
        "Scope and lifetime",
    )),

    N("Operators", "", P(
        "Arithmetic operators",
        "Relational operators",
        "Logical operators",
        "Assignment operators",
        "Increment and decrement",
        "Bitwise operators",
        "Shift operators",
        "The conditional operator",
        "Precedence and associativity",
        "Common operator traps",
    )),

    N("Input and output", "", P(
        "printf",
        "Format specifiers",
        "scanf",
        "getchar and putchar",
        "gets, puts and why gets is gone",
        "Formatting output neatly",
    )),

    N("Control flow", "", P(
        "if",
        "if-else",
        "else-if ladders",
        "Nested if",
        "switch",
        "Fall-through in switch",
        "while",
        "do-while",
        "for",
        "Nested loops",
        "break",
        "continue",
        "goto and why to avoid it",
        "Loop patterns you will reuse",
    )),

    N("Functions", "", P(
        "Why functions exist",
        "Declaration and definition",
        "Parameters and arguments",
        "Return values",
        "Call by value",
        "Why C has no call by reference",
        "Recursion",
        "The call stack",
        "Recursion vs iteration",
        "Header files",
        "Multi-file programs",
        "The standard library",
        "Variadic functions",
        "Inline functions",
    )),

    N("Arrays and strings", "", P(
        "Arrays",
        "Declaring and initialising arrays",
        "Indexing and bounds",
        "Arrays in memory",
        "Traversing an array",
        "Two-dimensional arrays",
        "Multi-dimensional arrays",
        "Arrays and functions",
        "Variable length arrays",
        "Strings as char arrays",
        "String input and output",
        "The string.h functions",
        "Writing your own string functions",
        "Array of strings",
        "Common array and string bugs",
    )),

    N("Pointers", "", P(
        "What a pointer really is",
        "The address-of and dereference operators",
        "Declaring and using pointers",
        "Pointer arithmetic",
        "Pointers and arrays",
        "Pointers and strings",
        "Pointer to pointer",
        "Pointers and functions",
        "Function pointers",
        "Void pointers",
        "NULL, dangling and wild pointers",
        "const with pointers",
        "Common pointer bugs and how to find them",
    )),

    N("Dynamic memory", "", P(
        "Stack and heap",
        "malloc",
        "calloc",
        "realloc",
        "free",
        "Memory leaks",
        "Dynamic arrays",
        "Dynamic two-dimensional arrays",
        "Debugging memory with valgrind",
    )),

    N("Structures and unions", "", P(
        "struct basics",
        "Accessing members",
        "Array of structures",
        "Nested structures",
        "Pointers to structures",
        "Structures and functions",
        "typedef",
        "Structure padding and alignment",
        "union",
        "enum",
        "Bit-fields",
        "Self-referential structures",
    )),

    N("File handling", "", P(
        "Why files",
        "Text and binary files",
        "fopen and file modes",
        "fclose",
        "Reading and writing characters",
        "Reading and writing lines",
        "fprintf and fscanf",
        "fread and fwrite",
        "Random access — fseek, ftell, rewind",
        "Error handling with files",
    )),

    N("The preprocessor", "", P(
        "What the preprocessor does",
        "#include",
        "#define",
        "Macros with arguments",
        "Conditional compilation",
        "Include guards",
        "Predefined macros",
        "Macro pitfalls",
    )),

    N("Beyond the basics", "", P(
        "Command line arguments",
        "The C standard library tour",
        "Math functions",
        "Time and date functions",
        "Random numbers",
        "Error handling with errno",
        "Undefined behaviour",
        "Writing portable C",
        "Compiling with warnings on",
        "Using a debugger",
        "Makefiles",
    )),

    N("Practice and projects", "", P(
        "Beginner problem set",
        "Array and string problem set",
        "Pointer problem set",
        "Recursion problem set",
        "Structure problem set",
        "File handling problem set",
        "Project — a student record system",
        "Project — a text-based game",
        "Project — your own string library",
        "Project — a simple shell",
    )),
])


# ===========================================================================
# STAGE 1 — Undergraduate core
# ===========================================================================

def lang(name, blurb, chapters):
    """A language with its own chapter list."""
    return N(name, blurb, [N(ch, "", P(*tops)) for ch, tops in chapters])


STAGE_1 = N("Undergraduate Core", "The compulsory spine of a CS degree.", [

    N("Programming Fundamentals", "Ideas that hold in every language.", [
        N("Thinking like a programmer", "", P(
            "What a program is", "Problem solving steps", "Algorithms",
            "Flowcharts", "Pseudocode", "Tracing an algorithm by hand")),
        N("Core building blocks", "", P(
            "Variables and data types", "Operators and expressions",
            "Input and output", "Conditionals", "Loops",
            "Functions and modularity", "Scope", "Recursion")),
        N("Working with data", "", P(
            "Arrays", "Strings", "Records", "Files", "Simple searching",
            "Simple sorting")),
        N("Good habits", "", P(
            "Naming things", "Comments that help", "Debugging",
            "Testing your own code", "Reading someone else's code")),
    ]),

    N("Programming Languages", "One full course per language.", [
        C_LANGUAGE,
        lang("C++", "C with objects, templates and the STL.", [
            ("Getting started", ["Why C++", "Your first program", "Differences from C", "Compilation"]),
            ("Core language", ["Types and auto", "References", "Namespaces", "Control flow", "Functions", "Default and overloaded functions"]),
            ("Object-oriented C++", ["Classes and objects", "Constructors and destructors", "Copy constructor", "this pointer", "Static members", "Friend functions", "Operator overloading", "Inheritance", "Virtual functions", "Abstract classes", "Polymorphism", "Multiple inheritance"]),
            ("Memory and resources", ["new and delete", "RAII", "Smart pointers", "Move semantics", "Rule of three and five"]),
            ("Templates", ["Function templates", "Class templates", "Template specialisation", "An introduction to concepts"]),
            ("The STL", ["Containers overview", "vector", "list and deque", "set and map", "unordered containers", "Iterators", "Algorithms", "Lambdas", "Function objects"]),
            ("Modern C++", ["C++11 essentials", "C++17 essentials", "C++20 essentials", "Exceptions", "File I/O", "Multithreading basics"]),
            ("Practice", ["Problem set", "Project — a container library", "Project — a small game"]),
        ]),
        lang("Python", "The language for scripts, data and AI.", [
            ("Getting started", ["Why Python", "Installing Python", "The REPL", "Your first script", "Indentation matters"]),
            ("Core language", ["Variables and types", "Numbers", "Strings", "f-strings", "Booleans and None", "Operators", "Conditionals", "Loops", "Comprehensions", "Functions", "Default and keyword arguments", "args and kwargs", "Lambdas", "Scope and closures"]),
            ("Data structures", ["Lists", "Tuples", "Sets", "Dictionaries", "Nested structures", "Choosing the right structure", "collections module"]),
            ("Object-oriented Python", ["Classes and objects", "Attributes and methods", "Inheritance", "Magic methods", "Properties", "Dataclasses", "Abstract base classes"]),
            ("Working with the world", ["Files", "CSV and JSON", "Exceptions", "Modules and packages", "Virtual environments", "pip and dependencies", "Command line arguments"]),
            ("Going further", ["Iterators and generators", "Decorators", "Context managers", "Type hints", "Testing with pytest", "Regular expressions", "Date and time", "Concurrency basics"]),
            ("The ecosystem", ["NumPy", "Pandas", "Matplotlib", "Requests", "Choosing a library"]),
            ("Practice", ["Problem set", "Project — a data cleaner", "Project — a small web scraper", "Project — a command line tool"]),
        ]),
        lang("Java", "The language of enterprise and Android.", [
            ("Getting started", ["Why Java", "JDK, JRE and JVM", "Your first program", "Compiling and running"]),
            ("Core language", ["Types and variables", "Operators", "Control flow", "Arrays", "Strings", "Methods", "Varargs"]),
            ("Object-oriented Java", ["Classes and objects", "Constructors", "Encapsulation", "Inheritance", "Polymorphism", "Abstract classes", "Interfaces", "Inner classes", "Records and sealed types"]),
            ("Essential libraries", ["Collections framework", "List, Set, Map", "Generics", "Streams", "Optional", "Exceptions", "File I/O"]),
            ("Going further", ["Multithreading", "Concurrency utilities", "Lambdas and functional interfaces", "Annotations", "Reflection", "Modules"]),
            ("Practice", ["Problem set", "Project — a library system", "Project — a REST client"]),
        ]),
        lang("JavaScript", "The language of the browser.", [
            ("Getting started", ["Why JavaScript", "Running JS in the browser and in Node", "Your first script"]),
            ("Core language", ["var, let and const", "Types and coercion", "Operators", "Control flow", "Functions", "Arrow functions", "Scope, hoisting and closures", "this"]),
            ("Data", ["Arrays", "Array methods", "Objects", "Destructuring", "Spread and rest", "JSON", "Map and Set"]),
            ("Asynchronous JavaScript", ["Callbacks", "Promises", "async and await", "The event loop", "Fetch"]),
            ("The browser", ["The DOM", "Selecting and changing elements", "Events", "Forms", "Storage", "Modules"]),
            ("Practice", ["Problem set", "Project — an interactive page", "Project — a small single page app"]),
        ]),
        lang("SQL", "The language of data.", [
            ("Getting started", ["What SQL is", "Running SQL in the browser", "Your first query"]),
            ("Querying", ["SELECT", "WHERE", "ORDER BY", "LIMIT", "DISTINCT", "Operators and NULL", "CASE"]),
            ("Combining data", ["Aggregate functions", "GROUP BY", "HAVING", "INNER JOIN", "LEFT and RIGHT JOIN", "FULL and CROSS JOIN", "SELF JOIN", "Set operations", "Subqueries", "Correlated subqueries", "CTEs", "Window functions"]),
            ("Changing data", ["INSERT", "UPDATE", "DELETE", "Transactions"]),
            ("Defining data", ["CREATE TABLE", "Data types", "Constraints", "ALTER and DROP", "Indexes", "Views"]),
            ("Practice", ["100 query problems", "Project — design and query a real schema"]),
        ]),
        N("TypeScript", "JavaScript with types.", None),
        N("Go", "Simple, fast, built for servers.", None),
        N("Rust", "Memory safety without a garbage collector.", None),
        N("C#", "The .NET language.", None),
        N("Kotlin", "Modern Android and JVM.", None),
        N("Swift", "Apple platforms.", None),
        N("R", "Statistics and data analysis.", None),
        N("PHP", "Still runs much of the web.", None),
        N("Bash", "Automating your machine.", None),
        N("MATLAB and Julia", "Numerical and scientific computing.", None),
        N("Assembly", "Talking to the processor directly.", None),
    ]),

    N("Object-Oriented Programming", "The paradigm, independent of language.", [
        N("Foundations", "", P("Why OOP exists", "Objects and classes", "Attributes and behaviour", "Constructors", "Messages and methods")),
        N("The four pillars", "", P("Encapsulation", "Abstraction", "Inheritance", "Polymorphism", "Static vs dynamic binding")),
        N("Designing with objects", "", P("Composition over inheritance", "Interfaces and contracts", "SOLID principles", "Coupling and cohesion", "Common OOP mistakes")),
        N("UML", "", P("Class diagrams", "Sequence diagrams", "Use case diagrams", "State diagrams")),
    ]),

    N("Data Structures", "How data is arranged so it can be used.", [
        N("Foundations", "", P("Why data structures matter", "Abstract data types", "Complexity notation", "Time and space trade-offs", "How to analyse a structure")),
        N("Linear structures", "", P("Arrays", "Dynamic arrays", "Linked lists", "Doubly linked lists", "Circular linked lists", "Stacks", "Stack applications", "Queues", "Circular queues", "Deques", "Priority queues")),
        N("Trees", "", P("Tree terminology", "Binary trees", "Tree traversals", "Binary search trees", "BST operations", "AVL trees", "Rotations", "Red-black trees", "B-trees", "B+ trees", "Heaps", "Heap operations", "Tries", "Segment trees", "Fenwick trees")),
        N("Hashing", "", P("The idea of hashing", "Hash functions", "Collision handling — chaining", "Collision handling — open addressing", "Load factor and rehashing", "Hash tables in practice")),
        N("Graphs", "", P("Graph terminology", "Adjacency matrix", "Adjacency list", "Breadth first search", "Depth first search", "Connected components", "Cycle detection", "Topological sort")),
        N("Choosing well", "", P("Comparing structures", "Cache behaviour", "Which structure for which problem")),
    ]),

    N("Algorithms", "Method, and how to reason about cost.", [
        N("Analysis", "", P("What complexity means", "Big O, Omega and Theta", "Best, worst and average case", "Amortised analysis", "Recurrence relations", "The master theorem", "Space complexity")),
        N("Searching", "", P("Linear search", "Binary search", "Binary search on answers", "Ternary search", "Interpolation search")),
        N("Sorting", "", P("Bubble sort", "Selection sort", "Insertion sort", "Merge sort", "Quick sort", "Heap sort", "Counting sort", "Radix sort", "Bucket sort", "Comparing sorting algorithms", "Stability", "Sorting in practice")),
        N("Divide and conquer", "", P("The idea", "Merge sort revisited", "Quick select", "Closest pair of points", "Karatsuba multiplication")),
        N("Greedy algorithms", "", P("The greedy idea", "Activity selection", "Fractional knapsack", "Huffman coding", "When greedy fails")),
        N("Dynamic programming", "", P("The idea", "Memoisation vs tabulation", "Fibonacci", "0/1 knapsack", "Longest common subsequence", "Longest increasing subsequence", "Edit distance", "Matrix chain multiplication", "Coin change", "Subset sum", "DP on grids", "DP on trees", "Bitmask DP")),
        N("Graph algorithms", "", P("Dijkstra", "Bellman-Ford", "Floyd-Warshall", "Prim", "Kruskal", "Union-find", "Strongly connected components", "Articulation points and bridges", "Maximum flow", "Bipartite matching")),
        N("Strings", "", P("Naive matching", "KMP", "Rabin-Karp", "Z algorithm", "Suffix arrays", "Tries for strings")),
        N("Backtracking", "", P("The idea", "N-queens", "Sudoku solver", "Subsets and permutations", "Rat in a maze")),
        N("Hard problems", "", P("P and NP", "NP-complete problems", "Approximation algorithms", "Randomised algorithms", "Heuristics")),
    ]),

    N("Discrete Mathematics", "The mathematics of the discrete.", [
        N("Logic", "", P("Propositional logic", "Logical equivalences", "Predicates and quantifiers", "Rules of inference", "Proof methods", "Mathematical induction", "Strong induction")),
        N("Sets, relations, functions", "", P("Sets", "Set operations", "Cardinality", "Relations", "Properties of relations", "Equivalence relations", "Partial orders", "Hasse diagrams", "Functions", "Pigeonhole principle")),
        N("Counting", "", P("Counting principles", "Permutations", "Combinations", "Binomial coefficients", "Inclusion-exclusion", "Recurrence relations", "Generating functions")),
        N("Graph theory", "", P("Graphs and terminology", "Paths and connectivity", "Trees", "Spanning trees", "Euler paths", "Hamiltonian paths", "Graph colouring", "Planar graphs", "Matching")),
        N("Algebraic structures", "", P("Groups", "Rings and fields", "Lattices", "Boolean algebra")),
        N("Number theory", "", P("Divisibility", "GCD and Euclid's algorithm", "Modular arithmetic", "Prime numbers", "Fermat and Euler theorems", "Chinese remainder theorem")),
    ]),

    N("Linear Algebra", "The mathematics behind graphics and machine learning.", [
        N("Vectors", "", P("What a vector is", "Vector operations", "Dot product", "Cross product", "Norms", "Vector spaces", "Subspaces", "Linear independence", "Basis and dimension")),
        N("Matrices", "", P("What a matrix is", "Matrix operations", "Matrix multiplication", "Transpose", "Special matrices", "Determinant", "Inverse", "Rank", "Trace")),
        N("Systems of equations", "", P("Linear systems", "Gaussian elimination", "LU decomposition", "Solvability")),
        N("Transformations", "", P("Linear transformations", "Matrix as a transformation", "Change of basis", "Projections")),
        N("Eigen-everything", "", P("Eigenvalues and eigenvectors", "Diagonalisation", "Symmetric matrices", "Singular value decomposition", "Principal component analysis")),
        N("Applied", "", P("Least squares", "Linear algebra in graphics", "Linear algebra in machine learning")),
    ]),

    N("Calculus and Analysis", "Change, accumulation and limits.", [
        N("Limits and continuity", "", P("Limits", "One-sided limits", "Continuity", "Intermediate value theorem")),
        N("Differentiation", "", P("The derivative", "Rules of differentiation", "Chain rule", "Implicit differentiation", "Higher derivatives", "Maxima and minima", "Taylor series")),
        N("Integration", "", P("The integral", "Techniques of integration", "Definite integrals", "Applications of integration", "Improper integrals")),
        N("Multivariable", "", P("Functions of several variables", "Partial derivatives", "Gradient", "Chain rule in several variables", "Multiple integrals", "Jacobian and Hessian")),
        N("For computer science", "", P("Gradient descent, mathematically", "Convexity", "Numerical differentiation", "Why calculus appears in machine learning")),
    ]),

    N("Probability and Statistics", "Reasoning under uncertainty.", [
        N("Probability", "", P("Sample space and events", "Axioms of probability", "Conditional probability", "Independence", "Bayes theorem", "Law of total probability")),
        N("Random variables", "", P("Discrete random variables", "Continuous random variables", "Expectation", "Variance", "Moments", "Joint distributions", "Covariance and correlation")),
        N("Distributions", "", P("Bernoulli and binomial", "Poisson", "Geometric", "Uniform", "Normal", "Exponential", "Central limit theorem")),
        N("Statistics", "", P("Descriptive statistics", "Sampling", "Estimation", "Confidence intervals", "Hypothesis testing", "p-values and what they are not", "t-test and chi-square", "ANOVA", "Regression", "Correlation is not causation")),
        N("For computer science", "", P("Randomised algorithms", "Probabilistic data structures", "Statistics for experiments", "Bootstrap")),
    ]),

    N("Digital Logic Design", "From transistors to a working circuit.", [
        N("Number systems and codes", "", P("Binary arithmetic", "Signed number representation", "1s and 2s complement", "BCD", "Gray code", "Error detecting codes")),
        N("Boolean algebra", "", P("Boolean laws", "Logic gates", "Universal gates", "Truth tables", "Sum of products and product of sums", "Karnaugh maps", "Don't care conditions", "Quine-McCluskey")),
        N("Combinational circuits", "", P("Adders", "Subtractors", "Multiplexers", "Demultiplexers", "Encoders", "Decoders", "Comparators", "Code converters")),
        N("Sequential circuits", "", P("Latches", "Flip-flops", "Registers", "Shift registers", "Counters", "State machines", "State minimisation")),
        N("Memory and logic families", "", P("ROM, RAM, PROM, EPROM", "Programmable logic", "TTL and CMOS", "Timing and hazards")),
    ]),

    N("Computer Organisation and Architecture", "How the machine is actually built.", [
        N("Basics", "", P("Von Neumann architecture", "Instruction cycle", "Registers", "Bus structure", "CPU organisation")),
        N("Instructions", "", P("Instruction formats", "Addressing modes", "Instruction set design", "RISC and CISC", "Assembly and machine code")),
        N("Arithmetic", "", P("Fixed point arithmetic", "Booth's algorithm", "Division algorithms", "Floating point representation", "IEEE 754", "Floating point arithmetic")),
        N("Memory", "", P("Memory hierarchy", "Cache memory", "Cache mapping", "Cache replacement policies", "Write policies", "Virtual memory", "Paging and segmentation", "TLB")),
        N("Performance", "", P("Pipelining", "Pipeline hazards", "Branch prediction", "Superscalar and out of order", "Instruction level parallelism", "Measuring performance", "Amdahl's law")),
        N("Input and output", "", P("I/O organisation", "Programmed I/O", "Interrupts", "DMA", "Buses and standards")),
    ]),

    N("Microprocessors and Assembly", "Speaking the machine's own language.", [
        N("Foundations", "", P("What a microprocessor is", "Architecture of a simple processor", "Registers and flags", "The fetch-decode-execute cycle")),
        N("Assembly programming", "", P("Assembly syntax", "Data movement", "Arithmetic and logic", "Branching", "Loops", "Procedures and the stack", "Interrupts", "Writing and debugging assembly")),
        N("Interfacing", "", P("Memory interfacing", "I/O interfacing", "Timers and counters", "Serial communication")),
    ]),

    N("Operating Systems", "The program that runs the programs.", [
        N("Foundations", "", P("What an operating system does", "Types of operating systems", "System calls", "Kernel and user mode", "OS structure", "Virtual machines")),
        N("Processes", "", P("What a process is", "Process states", "Process control block", "Context switching", "Process creation", "Threads", "Multithreading models", "Inter-process communication")),
        N("Scheduling", "", P("Scheduling criteria", "First come first served", "Shortest job first", "Shortest remaining time", "Priority scheduling", "Round robin", "Multilevel queues", "Comparing schedulers", "Real-time scheduling")),
        N("Synchronisation", "", P("The critical section problem", "Peterson's solution", "Mutex locks", "Semaphores", "Classic problems — producer consumer", "Classic problems — readers writers", "Classic problems — dining philosophers", "Monitors")),
        N("Deadlocks", "", P("What a deadlock is", "Necessary conditions", "Resource allocation graphs", "Deadlock prevention", "Deadlock avoidance", "Banker's algorithm", "Deadlock detection", "Recovery")),
        N("Memory management", "", P("Address binding", "Contiguous allocation", "Fragmentation", "Paging", "Page tables", "TLB", "Segmentation", "Virtual memory", "Demand paging", "Page replacement — FIFO", "Page replacement — LRU", "Page replacement — Optimal", "Thrashing", "Working set model")),
        N("Storage and file systems", "", P("File concept", "Directory structure", "File allocation methods", "Free space management", "Disk scheduling — FCFS, SSTF, SCAN", "RAID", "Journaling")),
        N("Protection and security", "", P("Protection goals", "Access control", "Authentication", "Common OS attacks")),
    ]),

    N("Computer Networks", "How machines talk.", [
        N("Foundations", "", P("What a network is", "Network types", "Topologies", "The OSI model", "The TCP/IP model", "Protocol layering", "Switching techniques")),
        N("Physical layer", "", P("Transmission media", "Signals and encoding", "Bandwidth and data rate", "Multiplexing")),
        N("Data link layer", "", P("Framing", "Error detection", "Error correction", "Flow control", "Stop and wait", "Sliding window", "Go-back-N and selective repeat", "MAC and ALOHA", "CSMA/CD", "Ethernet", "Switches and bridges")),
        N("Network layer", "", P("Routing basics", "IPv4 addressing", "Subnetting", "CIDR", "IPv6", "NAT", "ARP", "ICMP", "Distance vector routing", "Link state routing", "OSPF and BGP", "Congestion control")),
        N("Transport layer", "", P("Transport layer services", "UDP", "TCP", "TCP connection management", "TCP flow control", "TCP congestion control", "Sockets")),
        N("Application layer", "", P("DNS", "HTTP and HTTPS", "Email protocols", "FTP", "DHCP", "Web architecture", "CDNs")),
        N("Network security", "", P("Threats", "Firewalls", "VPNs", "TLS", "Wireless security")),
    ]),

    N("Database Systems", "Storing data so it stays correct.", [
        N("Foundations", "", P("File systems vs DBMS", "Three-schema architecture", "Data independence", "Database users", "DBMS architecture", "Data models")),
        N("ER modelling", "", P("Entities and attributes", "Keys", "Relationships and cardinality", "Participation constraints", "Weak entities", "Generalisation and specialisation", "Aggregation", "Extended ER", "ER to relational mapping")),
        N("Relational model", "", P("Relations and tuples", "Types of keys", "Integrity constraints", "Relational algebra", "Relational calculus")),
        N("SQL", "", P("DDL", "DML", "SELECT", "Operators and NULL", "Aggregate functions", "GROUP BY and HAVING", "Joins", "Subqueries", "Set operations", "Views", "Window functions", "CTEs", "Stored procedures", "Triggers", "Cursors", "DCL and TCL")),
        N("Normalisation", "", P("Anomalies", "Functional dependencies", "Armstrong's axioms", "Attribute closure", "Finding candidate keys", "Canonical cover", "1NF", "2NF", "3NF", "BCNF", "Multivalued dependency and 4NF", "Join dependency and 5NF", "Lossless join", "Dependency preservation", "Denormalisation")),
        N("Storage and indexing", "", P("Disk structure", "File organisation", "Indexing basics", "Dense and sparse indexes", "Multilevel indexes", "B-trees", "B+ trees", "Hash indexing", "Extendible hashing", "Bitmap indexes")),
        N("Query processing", "", P("The query pipeline", "Cost estimation", "Join algorithms", "Heuristic optimisation", "Cost-based optimisation", "Reading a query plan")),
        N("Transactions", "", P("What a transaction is", "ACID", "Transaction states", "Schedules", "Conflict serialisability", "View serialisability", "Recoverable schedules")),
        N("Concurrency control", "", P("Concurrency problems", "Lock-based protocols", "Two-phase locking", "Deadlock handling", "Timestamp ordering", "Thomas write rule", "Optimistic concurrency control", "Multiple granularity", "MVCC")),
        N("Recovery", "", P("Failure types", "Log-based recovery", "Deferred and immediate update", "Checkpoints", "ARIES", "Shadow paging")),
        N("Beyond relational", "", P("Why NoSQL", "CAP theorem", "Key-value stores", "Document stores", "Column stores", "Graph databases", "NewSQL", "Choosing a store")),
        N("Distributed and warehousing", "", P("Fragmentation and replication", "Distributed query processing", "Two-phase commit", "Sharding", "OLTP vs OLAP", "Star and snowflake schemas", "ETL", "OLAP operations")),
    ]),

    N("Software Engineering", "Building software that survives.", [
        N("Process", "", P("What software engineering is", "Software development life cycle", "Waterfall", "Iterative and incremental", "Spiral", "Agile", "Scrum", "Kanban", "Choosing a process")),
        N("Requirements", "", P("Gathering requirements", "Functional and non-functional", "Use cases", "User stories", "Requirement specification", "Validation")),
        N("Design", "", P("Design principles", "Architectural styles", "Modularity", "Coupling and cohesion", "Design documentation")),
        N("Quality", "", P("Testing levels", "Verification and validation", "Code review", "Static analysis", "Technical debt", "Metrics")),
        N("Management", "", P("Estimation", "COCOMO", "Risk management", "Configuration management", "Maintenance", "Working in a team")),
    ]),

    N("Theory of Computation", "What can and cannot be computed.", [
        N("Languages and automata", "", P("Alphabets, strings and languages", "Finite automata", "DFA", "NFA", "NFA to DFA", "Minimisation", "Regular expressions", "Regular languages", "Pumping lemma for regular languages", "Closure properties")),
        N("Context-free languages", "", P("Context-free grammars", "Derivations and parse trees", "Ambiguity", "Chomsky normal form", "Pushdown automata", "Pumping lemma for CFLs", "CYK algorithm")),
        N("Turing machines", "", P("The Turing machine", "Variants", "The Church-Turing thesis", "Decidability", "The halting problem", "Reducibility", "Recursively enumerable languages")),
        N("Complexity", "", P("Time complexity classes", "P and NP", "NP-completeness", "Cook-Levin theorem", "Reductions", "Space complexity", "PSPACE")),
    ]),

    N("Compiler Design", "Turning source text into a running program.", [
        N("Overview", "", P("Phases of a compiler", "Compiler vs interpreter", "The symbol table", "Error handling")),
        N("Lexical analysis", "", P("Tokens and lexemes", "Regular expressions for tokens", "Finite automata for scanning", "Writing a lexer", "Lex and Flex")),
        N("Syntax analysis", "", P("Context-free grammars in compilers", "Top-down parsing", "Recursive descent", "LL(1) parsing", "Bottom-up parsing", "LR(0)", "SLR", "CLR", "LALR", "Yacc and Bison", "Error recovery")),
        N("Semantic analysis", "", P("Syntax-directed definitions", "Attribute grammars", "Type checking", "Scope and symbol tables")),
        N("Intermediate code", "", P("Three address code", "Quadruples and triples", "Syntax trees", "Control flow graphs")),
        N("Optimisation", "", P("Local optimisation", "Global optimisation", "Data flow analysis", "Loop optimisation", "Peephole optimisation")),
        N("Code generation", "", P("Target code", "Register allocation", "Instruction selection", "Runtime environments", "Activation records")),
    ]),

    N("Git and Version Control", "Working without losing work.", [
        N("Foundations", "", P("Why version control", "How Git thinks", "Installing and configuring", "Your first repository", "The three areas")),
        N("Everyday Git", "", P("add, commit, status", "Writing good commit messages", "Viewing history", "Diffing", "Undoing changes", "Ignoring files")),
        N("Branching", "", P("What a branch is", "Creating and switching", "Merging", "Merge conflicts", "Rebasing", "Cherry-picking", "Stashing", "Tags")),
        N("Working with others", "", P("Remotes", "Clone, push, pull, fetch", "Pull requests", "Code review on GitHub", "Forks", "Branching strategies", "Resolving conflicts in a team")),
        N("Going further", "", P("Reflog and recovery", "Bisect", "Hooks", "Submodules", "GitHub Actions basics", "Common Git disasters and how to escape them")),
    ]),
])


# ===========================================================================
# STAGE 2 — Undergraduate advanced and applied
# ===========================================================================

def S(title, blurb, chapters):
    """A section defined by (chapter title, [topics]) pairs."""
    return N(title, blurb, [N(c, "", P(*t)) for c, t in chapters])


STAGE_2 = N("Advanced and Applied", "Specialise, and start building real things.", [

    S("Design and Analysis of Algorithms", "Algorithm design as a discipline.", [
        ("Design techniques", ["Problem reduction", "Divide and conquer revisited", "Greedy proofs of correctness", "Dynamic programming formulation", "Branch and bound", "Randomisation"]),
        ("Advanced topics", ["Amortised analysis", "Competitive analysis", "Approximation ratios", "Parameterised complexity", "Lower bounds"]),
        ("Practice", ["Classic problem set", "Contest-style problems"]),
    ]),

    S("System Design", "Designing systems that do not fall over.", [
        ("Foundations", ["What system design asks", "Requirements and constraints", "Back of the envelope estimation", "Latency numbers worth knowing"]),
        ("Building blocks", ["Load balancers", "Caching", "CDNs", "Databases at scale", "Replication", "Sharding", "Message queues", "Rate limiting", "Consistent hashing", "Search systems", "Object storage"]),
        ("Properties", ["Scalability", "Availability", "Reliability", "Consistency models", "CAP and PACELC", "Fault tolerance", "Observability"]),
        ("Case studies", ["Design a URL shortener", "Design a news feed", "Design a chat system", "Design a rate limiter", "Design a video platform", "Design a ride hailing service", "Design a payment system"]),
    ]),

    S("Web Development — Frontend", "What the user actually sees.", [
        ("HTML", ["Document structure", "Text and lists", "Links and images", "Forms", "Tables", "Semantic HTML", "Accessibility basics", "Meta tags and SEO"]),
        ("CSS", ["Selectors", "The box model", "Colours and units", "Typography", "Flexbox", "Grid", "Positioning", "Responsive design", "Media queries", "Transitions and animation", "Custom properties", "Modern CSS features"]),
        ("JavaScript in the browser", ["The DOM", "Events", "Forms and validation", "Fetch and APIs", "Local storage", "Modules"]),
        ("Frameworks", ["Why frameworks exist", "React basics", "Components and props", "State and hooks", "Routing", "State management", "Vue basics", "Svelte basics", "Choosing a framework"]),
        ("Craft", ["Design fundamentals for developers", "Performance", "Accessibility in depth", "Testing the frontend", "Build tools", "Deployment"]),
    ]),

    S("Web Development — Backend and APIs", "The part behind the screen.", [
        ("Foundations", ["What a backend does", "HTTP in depth", "Request and response", "Status codes", "Servers and hosting"]),
        ("Building an API", ["REST principles", "Designing endpoints", "Request validation", "Authentication", "Authorisation and roles", "JWT and sessions", "Error handling", "Versioning", "Pagination", "Rate limiting", "API documentation"]),
        ("Data", ["Connecting to a database", "ORMs", "Migrations", "Transactions in application code", "Caching strategies", "File uploads"]),
        ("Beyond REST", ["GraphQL", "gRPC", "WebSockets", "Server-sent events", "Webhooks"]),
        ("Production", ["Logging", "Monitoring", "Security checklist", "Deployment", "Scaling a backend"]),
    ]),

    S("Mobile Development", "Software in a pocket.", [
        ("Foundations", ["Mobile platforms", "Native vs cross-platform", "Mobile UI principles", "App lifecycle"]),
        ("Android", ["Setting up", "Activities and fragments", "Layouts", "Jetpack Compose", "Data and storage", "Networking", "Publishing"]),
        ("iOS", ["Setting up", "SwiftUI basics", "Navigation", "Data and storage", "Networking", "Publishing"]),
        ("Cross-platform", ["React Native", "Flutter", "Choosing an approach"]),
    ]),

    S("Cloud Computing", "Someone else's computer, used well.", [
        ("Foundations", ["What cloud computing is", "IaaS, PaaS, SaaS", "Public, private, hybrid", "Regions and availability zones", "The shared responsibility model", "Cloud pricing"]),
        ("Core services", ["Compute", "Storage", "Networking", "Managed databases", "Identity and access management", "Serverless functions", "Containers in the cloud"]),
        ("Practice", ["Deploying a first application", "Infrastructure as code", "Cost control", "Cloud security basics"]),
    ]),

    S("DevOps", "Shipping reliably and repeatedly.", [
        ("Foundations", ["What DevOps means", "Culture and practice", "The deployment pipeline"]),
        ("Tooling", ["Linux for DevOps", "Shell scripting", "Docker", "Docker Compose", "Kubernetes basics", "Kubernetes in practice", "Terraform", "Ansible"]),
        ("CI/CD", ["Continuous integration", "Continuous delivery", "GitHub Actions", "Testing in the pipeline", "Release strategies"]),
        ("Operations", ["Monitoring", "Logging and tracing", "Alerting", "Incident response", "Postmortems", "Site reliability engineering"]),
    ]),

    S("Software Testing and Quality Assurance", "Proving it works.", [
        ("Foundations", ["Why testing", "Testing levels", "Testing types", "Test case design", "Test plans"]),
        ("Techniques", ["Black box testing", "Equivalence partitioning", "Boundary value analysis", "White box testing", "Coverage criteria", "Mutation testing"]),
        ("In practice", ["Unit testing", "Mocking", "Integration testing", "End to end testing", "Test driven development", "Performance testing", "Security testing", "Test automation"]),
    ]),

    S("Design Patterns", "Solutions that keep reappearing.", [
        ("Foundations", ["What a pattern is", "When not to use a pattern", "Pattern categories"]),
        ("Creational", ["Singleton", "Factory method", "Abstract factory", "Builder", "Prototype"]),
        ("Structural", ["Adapter", "Bridge", "Composite", "Decorator", "Facade", "Flyweight", "Proxy"]),
        ("Behavioural", ["Chain of responsibility", "Command", "Iterator", "Mediator", "Memento", "Observer", "State", "Strategy", "Template method", "Visitor"]),
        ("Beyond the classics", ["MVC, MVP, MVVM", "Dependency injection", "Repository", "Anti-patterns"]),
    ]),

    S("Functional Programming", "Programming with values, not state.", [
        ("Foundations", ["What functional programming is", "Pure functions", "Immutability", "First class functions", "Higher order functions", "Recursion as control flow"]),
        ("Core ideas", ["map, filter, reduce", "Closures", "Currying and partial application", "Function composition", "Lazy evaluation", "Pattern matching"]),
        ("Going deeper", ["Algebraic data types", "Functors", "Monads, gently", "Functional error handling", "Functional programming in mainstream languages"]),
    ]),

    S("Clean Code and Refactoring", "Code someone else can read.", [
        ("Writing it well", ["Naming", "Functions that do one thing", "Comments that earn their place", "Formatting", "Error handling", "Boundaries"]),
        ("Improving it", ["Code smells", "Refactoring catalogue", "Refactoring safely with tests", "Legacy code strategies", "Measuring readability"]),
    ]),

    S("Computer Graphics", "Making pictures with mathematics.", [
        ("Foundations", ["Graphics pipeline", "Raster vs vector", "Colour models", "Frame buffers"]),
        ("2D graphics", ["Line drawing algorithms", "Circle drawing", "Polygon filling", "Clipping", "2D transformations", "Windowing and viewports"]),
        ("3D graphics", ["3D transformations", "Projections", "Viewing pipeline", "Hidden surface removal", "Z-buffer", "Shading models", "Texture mapping", "Ray tracing", "Rasterisation"]),
        ("Practice", ["OpenGL basics", "Shaders", "A first 3D scene"]),
    ]),

    S("Game Development", "Interactive systems under a frame budget.", [
        ("Foundations", ["What a game engine does", "The game loop", "Input handling", "Time and delta"]),
        ("Building blocks", ["Sprites and animation", "Collision detection", "Physics basics", "Audio", "Scene management", "Entity component systems"]),
        ("Design and ship", ["Game design basics", "Level design", "Performance", "Publishing a game"]),
    ]),

    S("Human–Computer Interaction", "Designing for people.", [
        ("Foundations", ["What HCI studies", "Human capabilities and limits", "Mental models", "Affordances and signifiers"]),
        ("Design", ["Design principles", "Interaction styles", "Prototyping", "Information architecture", "Visual design basics", "Accessibility and inclusive design"]),
        ("Evaluation", ["Usability testing", "Heuristic evaluation", "User research methods", "Measuring usability"]),
    ]),

    S("Cybersecurity", "Attack, defence and the mindset between.", [
        ("Foundations", ["The CIA triad", "Threat modelling", "Security principles", "Risk"]),
        ("Attacks", ["Malware", "Phishing and social engineering", "SQL injection", "Cross-site scripting", "Cross-site request forgery", "Buffer overflows", "Denial of service", "Man in the middle", "Privilege escalation"]),
        ("Defences", ["Authentication", "Authorisation", "Secure coding", "Input validation", "Firewalls", "Intrusion detection", "Network security", "Web application security", "OWASP Top Ten"]),
        ("Operations", ["Penetration testing", "Vulnerability management", "Incident response", "Digital forensics", "Security policy and law", "Ethics"]),
    ]),

    S("Cryptography", "The mathematics of secrets.", [
        ("Foundations", ["What cryptography guarantees", "Classical ciphers", "Frequency analysis", "Kerckhoffs's principle"]),
        ("Symmetric cryptography", ["Block and stream ciphers", "DES", "AES", "Modes of operation", "Key management"]),
        ("Asymmetric cryptography", ["Public key idea", "RSA", "Diffie-Hellman", "Elliptic curve cryptography"]),
        ("Integrity and identity", ["Hash functions", "SHA family", "Message authentication codes", "Digital signatures", "Certificates and PKI", "TLS in detail"]),
        ("Modern topics", ["Random number generation", "Zero knowledge proofs", "Homomorphic encryption", "Post-quantum cryptography"]),
    ]),

    S("Embedded Systems", "Computers inside other things.", [
        ("Foundations", ["What an embedded system is", "Microcontrollers vs microprocessors", "Embedded C", "Cross compilation and toolchains"]),
        ("Hardware interface", ["GPIO", "ADC and DAC", "Timers and PWM", "Interrupts", "UART, SPI, I2C", "Sensors and actuators"]),
        ("Building systems", ["Power management", "Real-time constraints", "Debugging embedded code", "Firmware updates", "A first Arduino project", "A first Raspberry Pi project"]),
    ]),

    S("Internet of Things", "Connected devices at scale.", [
        ("Foundations", ["What IoT is", "IoT architecture", "Devices and gateways", "IoT operating systems"]),
        ("Connectivity", ["Wi-Fi, BLE, Zigbee, LoRa", "MQTT", "CoAP", "Edge computing"]),
        ("Systems", ["IoT data pipelines", "IoT security", "Privacy", "A first IoT project"]),
    ]),

    S("Real-Time Systems", "When late is the same as wrong.", [
        ("Foundations", ["Hard and soft real-time", "Timing constraints", "Real-time operating systems"]),
        ("Scheduling", ["Rate monotonic scheduling", "Earliest deadline first", "Schedulability analysis", "Priority inversion", "Resource sharing protocols"]),
        ("Practice", ["Designing a real-time application", "Measuring worst case execution time"]),
    ]),

    S("Artificial Intelligence", "Making machines act sensibly.", [
        ("Foundations", ["What AI is", "A short history", "Agents and environments", "Rationality"]),
        ("Search", ["Problem formulation", "Uninformed search", "BFS, DFS, UCS", "Informed search", "Greedy best first", "A* search", "Heuristics", "Local search", "Hill climbing", "Simulated annealing", "Genetic algorithms"]),
        ("Games", ["Adversarial search", "Minimax", "Alpha-beta pruning", "Stochastic games", "Monte Carlo tree search"]),
        ("Knowledge and reasoning", ["Propositional logic agents", "First order logic", "Inference", "Knowledge representation", "Ontologies", "Rule-based systems"]),
        ("Uncertainty and planning", ["Probabilistic reasoning", "Bayesian networks", "Hidden Markov models", "Markov decision processes", "Classical planning", "Planning algorithms"]),
        ("Applied AI", ["Expert systems", "Fuzzy logic", "Swarm intelligence", "AI in practice"]),
    ]),

    S("Machine Learning", "Learning from data.", [
        ("Foundations", ["What machine learning is", "Types of learning", "The machine learning pipeline", "Features and labels", "Training, validation and test", "Generalisation", "Bias and variance", "Overfitting and underfitting", "Cross validation"]),
        ("Supervised learning", ["Linear regression", "Gradient descent", "Polynomial regression", "Regularisation", "Logistic regression", "k nearest neighbours", "Naive Bayes", "Decision trees", "Random forests", "Gradient boosting", "XGBoost and friends", "Support vector machines", "Kernels"]),
        ("Unsupervised learning", ["k-means clustering", "Hierarchical clustering", "DBSCAN", "Gaussian mixture models", "Principal component analysis", "t-SNE and UMAP", "Anomaly detection", "Association rules"]),
        ("Doing it properly", ["Feature engineering", "Handling missing data", "Categorical encoding", "Scaling and normalisation", "Imbalanced data", "Hyperparameter tuning", "Ensemble methods", "Model selection"]),
        ("Evaluation", ["Accuracy and its limits", "Precision and recall", "F1 and beyond", "ROC and AUC", "Confusion matrix", "Regression metrics", "Statistical significance in ML"]),
        ("Practice", ["A first end to end project", "Common mistakes", "Reading an ML paper"]),
    ]),

    S("Data Science", "Turning data into decisions.", [
        ("Foundations", ["What data science is", "The data science process", "Asking a good question", "Types of data"]),
        ("Working with data", ["Data collection", "Data cleaning", "Exploratory data analysis", "Feature engineering", "Handling missing values", "Outliers"]),
        ("Analysis", ["Descriptive statistics", "Inferential statistics", "Hypothesis testing in practice", "A/B testing", "Causal inference basics", "Time series basics"]),
        ("Communication", ["Visualisation principles", "Choosing the right chart", "Dashboards", "Telling a story with data", "Reporting honestly"]),
        ("Practice", ["A first end to end analysis", "Working with real messy data", "Reproducible analysis"]),
    ]),

    S("Data Mining and Warehousing", "Finding patterns in large stores.", [
        ("Foundations", ["What data mining is", "The KDD process", "Data preprocessing", "Data reduction"]),
        ("Techniques", ["Classification", "Clustering", "Association rule mining", "Apriori algorithm", "FP-growth", "Sequence mining", "Outlier mining", "Text mining basics"]),
        ("Warehousing", ["Data warehouse architecture", "OLTP vs OLAP", "Star and snowflake schema", "Fact and dimension tables", "ETL", "OLAP operations", "Data marts", "Data lakes"]),
    ]),

    S("Data Engineering and Big Data", "Moving data reliably at scale.", [
        ("Foundations", ["What data engineering is", "Batch vs streaming", "Data modelling for analytics", "The modern data stack"]),
        ("Pipelines", ["ETL and ELT", "Orchestration", "Airflow", "Data quality and testing", "Idempotency and retries", "Schema evolution"]),
        ("Big data systems", ["The big data problem", "HDFS", "MapReduce", "Apache Spark", "Spark SQL", "Streaming with Kafka", "Flink basics", "Columnar formats — Parquet", "Query engines"]),
        ("Practice", ["Building a first pipeline", "Cost and performance"]),
    ]),

    S("Data Visualisation", "Showing data honestly.", [
        ("Principles", ["Why visualise", "Perception and encoding", "Choosing a chart type", "Colour use", "Chart junk", "Misleading charts"]),
        ("Doing it", ["Matplotlib", "Seaborn", "Plotly", "D3 basics", "Dashboards", "Visualising for print and screen"]),
    ]),

    S("Information Retrieval", "Finding the right thing among many.", [
        ("Foundations", ["What IR is", "Documents and queries", "Boolean retrieval", "Tokenisation and normalisation", "Stemming and lemmatisation", "Stop words"]),
        ("Indexing", ["Inverted index", "Index construction", "Index compression", "Positional indexes", "Distributed indexing"]),
        ("Ranking", ["Term frequency", "TF-IDF", "The vector space model", "BM25", "Language models for IR", "Learning to rank", "Dense retrieval", "Hybrid retrieval"]),
        ("Evaluation", ["Precision and recall in IR", "MAP", "nDCG", "MRR", "Test collections", "Relevance judgements"]),
        ("Systems", ["Web search architecture", "Crawling", "PageRank", "Query understanding", "Recommender systems"]),
    ]),

    S("Numerical Methods", "Computing answers when formulas run out.", [
        ("Foundations", ["Why numerical methods", "Error and precision", "Floating point pitfalls", "Conditioning and stability"]),
        ("Equations", ["Bisection method", "Newton-Raphson", "Secant method", "Fixed point iteration", "Systems of linear equations", "Gauss elimination", "LU decomposition", "Iterative methods"]),
        ("Approximation", ["Interpolation", "Lagrange interpolation", "Newton divided differences", "Splines", "Curve fitting", "Least squares"]),
        ("Calculus numerically", ["Numerical differentiation", "Trapezoidal rule", "Simpson's rule", "Gaussian quadrature", "Ordinary differential equations", "Euler method", "Runge-Kutta"]),
    ]),

    S("Optimisation", "Finding the best under constraints.", [
        ("Foundations", ["What optimisation is", "Objective functions and constraints", "Convexity", "Local and global optima"]),
        ("Methods", ["Gradient descent", "Stochastic gradient descent", "Momentum and adaptive methods", "Newton and quasi-Newton", "Linear programming", "Simplex method", "Duality", "Integer programming", "Constrained optimisation", "Lagrange multipliers", "KKT conditions"]),
        ("Applied", ["Optimisation in machine learning", "Metaheuristics", "Multi-objective optimisation"]),
    ]),

    S("Blockchain", "Agreeing without a central authority.", [
        ("Foundations", ["What a blockchain is", "Cryptographic foundations", "Hash chains and Merkle trees", "Distributed ledgers"]),
        ("Consensus", ["The consensus problem", "Proof of work", "Proof of stake", "Byzantine fault tolerance", "Forks and finality"]),
        ("Building", ["Bitcoin architecture", "Ethereum and the EVM", "Smart contracts", "Solidity basics", "Tokens and standards", "DApps", "Security of smart contracts"]),
        ("Perspective", ["Scalability and layer 2", "Energy and criticism", "Real uses and hype"]),
    ]),

    S("Robotics", "Machines that sense, decide and move.", [
        ("Foundations", ["What a robot is", "Robot anatomy", "Degrees of freedom", "Sensors", "Actuators"]),
        ("Motion", ["Coordinate frames", "Forward kinematics", "Inverse kinematics", "Jacobians", "Trajectory planning", "Dynamics", "Control basics", "PID control"]),
        ("Intelligence", ["Localisation", "Mapping and SLAM", "Path planning", "Obstacle avoidance", "Robot vision", "ROS basics"]),
    ]),
])


# ===========================================================================
# STAGE 3 — Master's and specialisation
# ===========================================================================

STAGE_3 = N("Specialisation", "Master's-level depth in one direction.", [

    S("Deep Learning", "Learning representations with neural networks.", [
        ("Foundations", ["The perceptron", "Multilayer networks", "Activation functions", "Forward propagation", "Loss functions", "Backpropagation", "Computational graphs", "Automatic differentiation"]),
        ("Training", ["Optimisers", "Learning rate schedules", "Weight initialisation", "Batch normalisation", "Layer normalisation", "Dropout", "Regularisation", "Vanishing and exploding gradients", "Debugging a training run"]),
        ("Architectures", ["Convolutional networks", "Convolution and pooling", "Classic CNN architectures", "Residual networks", "Recurrent networks", "LSTM and GRU", "Sequence to sequence", "Attention", "The transformer", "Vision transformers", "Autoencoders", "Variational autoencoders", "Generative adversarial networks", "Diffusion models", "Graph neural networks"]),
        ("Practice", ["PyTorch basics", "Building a training loop", "Datasets and dataloaders", "Transfer learning", "Fine-tuning", "Mixed precision", "Distributed training", "Reading a deep learning paper"]),
    ]),

    S("Natural Language Processing", "Teaching machines to read.", [
        ("Foundations", ["What NLP is", "Text preprocessing", "Tokenisation", "Subword tokenisation", "Morphology", "Part of speech tagging", "Parsing", "Named entity recognition"]),
        ("Representations", ["Bag of words", "TF-IDF for text", "Word2Vec", "GloVe", "FastText", "Contextual embeddings", "Sentence embeddings"]),
        ("Models", ["Language models", "n-gram models", "Neural language models", "Seq2seq with attention", "BERT and encoders", "GPT and decoders", "T5 and encoder-decoders", "Fine-tuning for NLP tasks"]),
        ("Tasks", ["Text classification", "Sentiment analysis", "Question answering", "Summarisation", "Machine translation", "Information extraction", "Dialogue systems"]),
        ("Evaluation", ["NLP metrics", "BLEU and ROUGE", "Human evaluation", "Benchmark pitfalls"]),
    ]),

    S("Computer Vision", "Teaching machines to see.", [
        ("Foundations", ["Images as data", "Colour spaces", "Filtering and convolution", "Edge detection", "Corner and feature detection", "SIFT and descriptors", "Image transformations", "Histogram methods"]),
        ("Classical vision", ["Segmentation", "Morphological operations", "Optical flow", "Camera models", "Stereo vision", "Structure from motion"]),
        ("Deep vision", ["CNNs for vision", "Image classification", "Object detection", "R-CNN family", "YOLO and single-shot detectors", "Semantic segmentation", "Instance segmentation", "Pose estimation", "Video understanding", "Vision transformers in detail"]),
        ("Applied", ["Data augmentation", "Evaluation metrics for vision", "Deploying a vision model", "Failure modes"]),
    ]),

    S("Reinforcement Learning", "Learning by acting.", [
        ("Foundations", ["The RL problem", "Agents, states, actions, rewards", "Markov decision processes", "Policies and value functions", "Bellman equations", "Exploration and exploitation"]),
        ("Classical methods", ["Dynamic programming", "Monte Carlo methods", "Temporal difference learning", "SARSA", "Q-learning", "Eligibility traces"]),
        ("Deep RL", ["Deep Q-networks", "Policy gradients", "REINFORCE", "Actor-critic", "A2C and A3C", "PPO", "DDPG and SAC", "Model-based RL"]),
        ("Applied", ["Reward design", "Environments and simulators", "RL from human feedback", "Where RL actually works"]),
    ]),

    S("Generative AI and Large Language Models", "The current frontier, explained properly.", [
        ("Foundations", ["What a large language model is", "The transformer, revisited", "Pretraining", "Scaling laws", "Tokenisers in practice", "Context windows"]),
        ("Making them useful", ["Instruction tuning", "RLHF and preference optimisation", "Prompting", "Chain of thought", "Structured output", "Function calling and tools", "Agents"]),
        ("Retrieval augmented generation", ["Why RAG", "Chunking", "Embedding models", "Vector databases", "Retrieval strategies", "Reranking", "Evaluating a RAG system", "Failure modes of RAG"]),
        ("Efficiency", ["Quantisation", "LoRA and parameter efficient fine-tuning", "Distillation", "Inference optimisation", "Serving at scale"]),
        ("Limits", ["Hallucination", "Evaluation of generative models", "Benchmark contamination", "Safety and misuse"]),
    ]),

    S("Document AI and Multimodal Retrieval", "Understanding documents as they actually look.", [
        ("Foundations", ["What visual document understanding is", "Documents as images", "OCR and its limits", "OCR-free approaches", "Layout as information"]),
        ("Models", ["Layout-aware language models", "Vision-language models for documents", "Late interaction retrieval", "Multi-vector embeddings"]),
        ("Tasks", ["Document classification", "Key information extraction", "Table understanding", "Document visual question answering", "Chart and infographic understanding"]),
        ("Retrieval and evaluation", ["Page-level retrieval", "Region-level retrieval", "Embedding compression", "Benchmarks and datasets", "Measuring what actually helps"]),
    ]),

    S("MLOps", "Machine learning that survives contact with production.", [
        ("Foundations", ["Why models fail in production", "The ML lifecycle", "Reproducibility"]),
        ("Practice", ["Experiment tracking", "Data versioning", "Model registries", "Feature stores", "CI/CD for ML", "Model serving", "Batch and online inference", "Monitoring and drift", "Retraining strategies", "Cost management"]),
    ]),

    S("Distributed Systems", "Many machines, one system.", [
        ("Foundations", ["What makes distribution hard", "The eight fallacies", "System models", "Failure models"]),
        ("Coordination", ["Time and clocks", "Logical clocks", "Vector clocks", "Consistent snapshots", "Consensus", "Paxos", "Raft", "Leader election", "Distributed mutual exclusion"]),
        ("Data", ["Replication", "Quorums", "Consistency models", "Eventual consistency", "CAP theorem in depth", "Distributed transactions", "Two-phase commit", "Sagas", "Conflict-free replicated data types"]),
        ("Practice", ["Remote procedure calls", "Message passing", "Microservices", "Service discovery", "Distributed tracing", "Chaos engineering"]),
    ]),

    S("Parallel and High-Performance Computing", "Using all the hardware.", [
        ("Foundations", ["Why parallelism", "Flynn's taxonomy", "Speedup and efficiency", "Amdahl and Gustafson", "Parallel architectures"]),
        ("Programming models", ["Shared memory", "Threads and OpenMP", "Message passing and MPI", "GPU computing", "CUDA basics", "Memory hierarchy on GPUs", "Vectorisation"]),
        ("Doing it well", ["Race conditions", "Locks and lock-free", "Load balancing", "Profiling", "Performance tuning", "Scaling studies"]),
    ]),

    S("Advanced Operating Systems", "Beyond the undergraduate course.", [
        ("Kernel internals", ["Kernel architectures", "Microkernels", "System call implementation", "Interrupt handling", "Kernel synchronisation"]),
        ("Advanced topics", ["Virtualisation", "Hypervisors", "Containers under the hood", "Modern schedulers", "Memory management at scale", "File system implementation", "Distributed file systems"]),
    ]),

    S("Advanced Computer Networks", "Networks as research subject.", [
        ("Topics", ["Software defined networking", "Network function virtualisation", "Data centre networking", "Congestion control research", "QoS", "Multicast", "Mobile and wireless networks", "5G architecture", "Network measurement", "Programmable data planes"]),
    ]),

    S("Advanced Database Systems", "Where databases are going.", [
        ("Topics", ["Modern query optimisation", "Columnar storage", "In-memory databases", "Distributed query execution", "Stream processing", "Time series databases", "Vector databases", "Learned index structures", "Database internals — a tour"]),
    ]),

    S("Advanced Algorithms", "Beyond worst-case deterministic.", [
        ("Topics", ["Randomised algorithms", "Probabilistic analysis", "Approximation algorithms", "Online algorithms", "Streaming algorithms", "Sketching", "Sublinear algorithms", "Parameterised algorithms", "Linear programming relaxation", "Spectral methods"]),
    ]),

    S("Computational Complexity", "The structure of hardness.", [
        ("Topics", ["Turing machines revisited", "Time and space classes", "Hierarchy theorems", "NP-completeness in depth", "coNP", "Polynomial hierarchy", "Randomised classes", "Interactive proofs", "PCP theorem", "Circuit complexity", "Hardness of approximation"]),
    ]),

    S("Formal Methods and Verification", "Proving software correct.", [
        ("Topics", ["Why formal methods", "Formal specification", "Hoare logic", "Weakest preconditions", "Model checking", "Temporal logic", "SAT and SMT solvers", "Theorem provers", "Type systems as proofs", "Verified compilers"]),
    ]),

    S("Programming Language Theory", "What a language actually means.", [
        ("Topics", ["Syntax and semantics", "Operational semantics", "Denotational semantics", "Lambda calculus", "Type systems", "Type inference", "Polymorphism", "Subtyping", "Effects", "Memory models", "Language design trade-offs"]),
    ]),

    S("Information Theory", "Measuring information itself.", [
        ("Topics", ["Entropy", "Joint and conditional entropy", "Mutual information", "KL divergence", "Source coding theorem", "Huffman and arithmetic coding", "Channel capacity", "Noisy channel coding theorem", "Error correcting codes", "Rate distortion theory", "Information theory in machine learning"]),
    ]),

    S("Computational Geometry", "Algorithms on shapes.", [
        ("Topics", ["Geometric primitives", "Convex hull", "Line segment intersection", "Polygon triangulation", "Voronoi diagrams", "Delaunay triangulation", "Range searching", "kd-trees", "Nearest neighbour search", "Geometric robustness"]),
    ]),

    S("Quantum Computing", "Computing with amplitudes.", [
        ("Foundations", ["Why quantum computing", "Qubits", "Superposition", "Entanglement", "Measurement", "The maths you need"]),
        ("Circuits and algorithms", ["Quantum gates", "Quantum circuits", "Deutsch-Jozsa", "Grover's algorithm", "Shor's algorithm", "Quantum Fourier transform", "Variational algorithms"]),
        ("Reality", ["Quantum error correction", "Noise and decoherence", "Current hardware", "What quantum computers cannot do"]),
    ]),

    S("Bioinformatics and Computational Biology", "Algorithms for living systems.", [
        ("Topics", ["Biology for computer scientists", "Sequence alignment", "Needleman-Wunsch", "Smith-Waterman", "BLAST", "Multiple sequence alignment", "Phylogenetics", "Genome assembly", "Gene expression analysis", "Protein structure prediction", "Machine learning in biology"]),
    ]),

    S("AI Ethics, Safety and Policy", "The consequences of building this.", [
        ("Topics", ["Why ethics belongs in the curriculum", "Bias in data and models", "Fairness definitions", "Interpretability and explainability", "Privacy and data protection", "Surveillance", "Automation and work", "Misinformation", "AI safety research", "Alignment", "Regulation and governance", "Responsible deployment"]),
    ]),

    S("Augmented and Virtual Reality", "Computing you stand inside.", [
        ("Topics", ["AR, VR and MR", "Display technologies", "Tracking and registration", "3D interaction", "Spatial audio", "Rendering for headsets", "Latency and comfort", "Building a first XR application"]),
    ]),
])


# ===========================================================================
# STAGE 4 — Doctoral and post-doctoral
# ===========================================================================

STAGE_4 = N("Research", "From consuming research to producing it.", [
    S("Research Methodology", "How research is actually done.", [
        ("Foundations", ["What research is", "Types of research", "Finding a research question", "Novelty and contribution", "Research ethics", "Working with a supervisor"]),
        ("Planning", ["Scoping a project", "Research design", "Timeline and milestones", "Managing a long project"]),
    ]),
    S("How to Read a Paper", "A skill nobody teaches.", [
        ("Method", ["The three-pass approach", "Reading the abstract critically", "Checking the claims against the evidence", "Reading related work", "Keeping notes and a reading system", "Spotting weak papers"]),
    ]),
    S("How to Write a Paper", "Saying it clearly enough to be believed.", [
        ("Structure", ["Choosing the story", "Title and abstract", "Introduction", "Related work", "Method", "Experiments", "Results and discussion", "Conclusion", "Limitations"]),
        ("Craft", ["Writing clearly", "Figures and tables that earn space", "Mathematical notation", "LaTeX for papers", "Citation practice", "Revising and cutting"]),
    ]),
    S("Experimental Design and Statistics for Research", "Making results mean something.", [
        ("Topics", ["Hypotheses and variables", "Controls and baselines", "Ablation studies", "Sample size and power", "Significance testing", "Multiple comparisons", "Confidence intervals", "Effect size", "Bootstrap and permutation tests", "Reporting results honestly"]),
    ]),
    S("Reproducibility and Open Science", "Work others can build on.", [
        ("Topics", ["The reproducibility crisis", "Reproducible code", "Environment and dependency capture", "Seeds and determinism", "Releasing data", "Releasing models", "Documentation for reuse", "Licensing", "Preregistration"]),
    ]),
    S("Benchmarking and Evaluation", "Measuring the right thing.", [
        ("Topics", ["What a benchmark is for", "Designing an evaluation", "Choosing metrics", "Baselines that are actually fair", "Contamination and leakage", "Benchmark saturation", "Human evaluation", "Error analysis", "When a benchmark misleads"]),
    ]),
    S("Peer Review", "Both sides of the process.", [
        ("Topics", ["How review works", "Writing a useful review", "Reading reviews of your own work", "Writing a rebuttal", "Handling rejection", "Venues and their cultures", "Conference vs journal", "Preprints"]),
    ]),
    S("Literature Surveys and Systematic Reviews", "Mapping a field.", [
        ("Topics", ["Kinds of survey", "Systematic search", "Inclusion criteria", "Building a taxonomy", "Synthesising results", "Meta-analysis basics", "Keeping a survey alive"]),
    ]),
    S("Grants, Funding and Proposals", "Paying for the work.", [
        ("Topics", ["Funding landscape", "Reading a call", "Writing a proposal", "Budgets", "Reviewer expectations", "Fellowships and scholarships"]),
    ]),
    S("Presenting Your Work", "Talks, posters and demos.", [
        ("Topics", ["Structuring a talk", "Slide design", "Delivering with nerves", "Poster design", "Handling questions", "Demos that work"]),
    ]),
    S("Research Frontiers", "A living section, updated as fields move.", [
        ("Topics", ["How to track a moving field", "Open problems in document AI", "Open problems in retrieval", "Open problems in efficiency", "Open problems in evaluation"]),
    ]),
    S("Teaching and Mentoring", "Passing it on.", [
        ("Topics", ["Preparing to teach", "Designing a course", "Running a lab session", "Giving feedback", "Mentoring juniors", "Assessment"]),
    ]),
    S("Research Careers", "What comes after the degree.", [
        ("Topics", ["Academic career paths", "Industry research labs", "Postdoc or not", "Building a research profile", "Networking and collaboration", "Work and life in research"]),
    ]),
])


# ===========================================================================
# CAREER — runs alongside every stage
# ===========================================================================

CAREER = N("Career and Exams", "Getting the job, passing the exam.", [
    S("Competitive Programming", "Speed, accuracy and pattern recognition.", [
        ("Getting started", ["What competitive programming is", "Choosing a language", "Setting up", "Reading a problem statement", "Input and output speed"]),
        ("Core techniques", ["Complexity for contests", "Two pointers", "Sliding window", "Prefix sums", "Binary search on answer", "Sorting tricks", "Greedy patterns", "DP patterns", "Graph patterns", "Number theory for contests", "Bit manipulation", "Data structure tricks"]),
        ("Practice", ["Contest strategy", "Debugging under time pressure", "Problem sets by topic", "Where to practise"]),
    ]),
    S("Interview Preparation — DSA", "The coding round.", [
        ("Preparing", ["How coding interviews work", "A study plan", "Patterns worth memorising"]),
        ("Topic drills", ["Arrays and strings", "Linked lists", "Stacks and queues", "Trees", "Graphs", "Heaps", "Hashing", "Recursion and backtracking", "Dynamic programming", "Sorting and searching", "Bit manipulation", "Maths and puzzles"]),
        ("On the day", ["Thinking out loud", "Clarifying a question", "Writing clean code under pressure", "Testing your answer", "When you are stuck"]),
    ]),
    S("Interview Preparation — System Design", "The design round.", [
        ("Preparing", ["What is actually being assessed", "A framework for the round", "Estimation practice"]),
        ("Practice", ["Common design questions", "Trade-off discussions", "Deep dives", "Mock design walkthroughs"]),
    ]),
    S("Interview Preparation — Behavioural", "The conversation round.", [
        ("Topics", ["What behavioural rounds test", "The STAR method", "Common questions", "Talking about failure", "Questions to ask them", "Salary conversations"]),
    ]),
    S("GATE Preparation", "The Indian postgraduate entrance.", [
        ("Planning", ["Exam pattern and syllabus", "Building a study plan", "Subject weightage", "Resources that help"]),
        ("Subject revision", ["Engineering mathematics", "Digital logic", "Computer organisation", "Programming and data structures", "Algorithms", "Theory of computation", "Compiler design", "Operating systems", "Databases", "Computer networks", "Aptitude"]),
        ("Practice", ["Previous year papers by topic", "Mock test strategy", "Common mistakes", "Last month revision"]),
    ]),
    S("Aptitude and Logical Reasoning", "The round that filters before the code.", [
        ("Quantitative", ["Numbers", "Percentage", "Ratio and proportion", "Averages", "Time and work", "Time speed distance", "Profit and loss", "Simple and compound interest", "Permutations and combinations", "Probability", "Mensuration", "Data interpretation"]),
        ("Logical", ["Series", "Coding decoding", "Blood relations", "Directions", "Syllogisms", "Seating arrangement", "Puzzles", "Data sufficiency"]),
        ("Verbal", ["Reading comprehension", "Grammar", "Vocabulary", "Sentence correction"]),
    ]),
    S("Resume, Portfolio and Profile", "Being findable and credible.", [
        ("Topics", ["What a technical resume is for", "Structure and length", "Describing projects well", "Quantifying impact", "Common resume mistakes", "LinkedIn", "GitHub as a portfolio", "A personal website", "Cover letters"]),
    ]),
    S("Contributing to Open Source", "Learning in public.", [
        ("Topics", ["Why contribute", "Finding a project", "Reading an unfamiliar codebase", "Your first issue", "Your first pull request", "Working with maintainers", "Open source licences", "Maintaining your own project"]),
    ]),
    S("Internships and Research Applications", "Getting in the door.", [
        ("Topics", ["Where to look", "Timelines", "Cold emailing a professor", "Statement of purpose", "Letters of recommendation", "Applying abroad", "Funding and scholarships", "Interview preparation for research roles"]),
    ]),
    S("Technical Writing and Communication", "Being understood.", [
        ("Topics", ["Writing for engineers", "Documentation", "READMEs that work", "Writing a technical blog post", "Email and issue etiquette", "Explaining to non-technical people", "Writing in English as a second language"]),
    ]),
])


# ===========================================================================
# The whole site
# ===========================================================================

SITE = [STAGE_0, STAGE_1, STAGE_2, STAGE_3, STAGE_4, CAREER]

# Algorithm-to-C-Converter

## Overview

This project is a mini compiler front-end developed using FLEX and BISON.  
The system accepts a structured pseudo-code algorithm as input and generates equivalent C language code.

The project demonstrates the core concepts of compiler design including:

- Lexical Analysis
- Syntax Analysis
- Context Free Grammar (CFG)
- Code Generation

---

# Objective

The objective of this project is to design and implement a translator that converts algorithmic pseudo-code into executable C code.

The translator performs:
1. Tokenization using FLEX
2. Parsing using BISON
3. C code generation using grammar rules

---

# Technologies Used

| Tool | Purpose |
|---|---|
| FLEX | Lexical Analysis |
| BISON | Syntax Analysis |
| GCC | Compilation |
| C Language | Code Generation |

---

# Supported Pseudo-Code Statements

The translator currently supports:

- START
- STOP
- READ
- PRINT
- Assignment Statements
- Addition Expressions

---

# Project Structure

```text
automata/
│
├── lexer.l
├── parser.y
├── input.txt
├── lex.yy.c
├── y.tab.c
├── y.tab.h
└── translator
```

---

# Working Principle

## Step 1 — Input Algorithm

The user provides pseudo-code as input.

Example:

```text
START
READ A
READ B
SUM = A + B
PRINT SUM
STOP
```

---

## Step 2 — Lexical Analysis

FLEX identifies tokens such as:
- Keywords
- Identifiers
- Operators
- Numbers

Example:

| Input | Token |
|---|---|
| START | START |
| READ | READ |
| A | ID |
| + | Operator |

---

## Step 3 — Syntax Analysis

BISON validates the syntax using Context Free Grammar (CFG).

Example grammar rules:

```text
program → START statements STOP

statement → READ ID
statement → PRINT ID
statement → ID = expr
```

---

## Step 4 — Code Generation

Equivalent C statements are generated during parsing.

Example:

```text
READ A
```

becomes:

```c
scanf("%d", &A);
```

---

# lexer.l Explanation

The `lexer.l` file performs lexical analysis.

Main tasks:
- Recognizes keywords
- Identifies variables
- Detects operators
- Returns tokens to parser

Example:

```c
START      { return START; }
READ       { return READ; }
```

---

# parser.y Explanation

The `parser.y` file performs:
- Syntax validation
- Grammar parsing
- C code generation

Example:

```c
statement:
      READ ID
```

This rule checks whether a valid READ statement exists.

---

# Compilation Steps

## Step 1 — Run FLEX

```bash
flex lexer.l
```

Generates:
```text
lex.yy.c
```

---

## Step 2 — Run BISON

```bash
bison -dy parser.y
```

Generates:
```text
y.tab.c
y.tab.h
```

---

## Step 3 — Compile Using GCC

```bash
gcc lex.yy.c y.tab.c -o translator
```

Creates executable:
```text
translator
```

---

# Execution

Run the translator using:

```bash
./translator < input.txt
```

---

# Sample Input

```text
START
READ A
READ B
SUM = A + B
PRINT SUM
STOP
```

---

# Generated Output

```c
#include <stdio.h>

int main() {

int A;
scanf("%d", &A);

int B;
scanf("%d", &B);

int SUM;
SUM = A + B;

printf("%d", SUM);

return 0;
}
```

---

# Context Free Grammar (CFG)

```text
program → START statements STOP

statements → statements statement
           | statement

statement → READ ID
          | PRINT ID
          | ID = expr

expr → ID
     | NUMBER
     | ID + ID
```

---

# Features Implemented

- Lexical Analysis
- Syntax Analysis
- Token Recognition
- Grammar Validation
- Code Generation
- Input Parsing
- Pseudo-code Translation

---

# Applications

- Compiler Design Learning
- Educational Mini Compiler
- Automata and Compiler Lab
- Understanding Parsing Techniques

---

# Advantages

- Easy to understand
- Demonstrates compiler phases
- Beginner-friendly implementation
- Simple pseudo-code translation

---

# Limitations

Currently the translator supports only:
- Basic arithmetic
- Simple statements

Advanced constructs like:
- IF ELSE
- FOR loops
- WHILE loops

can be added in future enhancements.

---

# Future Enhancements

Possible future improvements:
- Loop support
- Conditional statements
- Nested expressions
- Semantic analysis
- Error recovery
- Full C program generation

---

# Conclusion

This project successfully demonstrates the front-end phases of compiler design using FLEX and BISON. The translator converts structured pseudo-code into equivalent C code by performing lexical analysis, syntax analysis, and code generation.
```

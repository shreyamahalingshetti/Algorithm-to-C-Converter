"use client";

import { motion } from "framer-motion";
import { Book, CheckCircle2, Code2, Database, Layout, Server, Settings } from "lucide-react";

export default function DocsPage() {
  return (
    <div className="flex-1 flex flex-col max-w-4xl w-full mx-auto p-4 md:p-8 pb-24">
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12"
      >
        <h1 className="text-4xl font-bold gradient-text mb-4">Project Documentation</h1>
        <p className="text-xl text-zinc-400">
          Algorithm to C Program Converter Architecture and Specifications
        </p>
      </motion.div>

      <div className="space-y-12">
        {/* Abstract & Objectives */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass rounded-2xl p-8 border border-zinc-800"
        >
          <div className="flex items-center space-x-3 mb-6">
            <Book className="w-6 h-6 text-blue-400" />
            <h2 className="text-2xl font-bold">1. Problem Statement & Objectives</h2>
          </div>
          
          <div className="prose prose-invert max-w-none">
            <p className="text-zinc-300 leading-relaxed mb-6">
              The objective of this project is to design and implement a web-based educational tool that 
              translates algorithmic pseudo-code into executable C code. This serves as an interactive demonstration 
              of compiler front-end phases.
            </p>
            
            <h3 className="text-lg font-semibold text-zinc-200 mb-3">Key Objectives:</h3>
            <ul className="space-y-2 text-zinc-400">
              <li className="flex items-start">
                <CheckCircle2 className="w-5 h-5 text-green-400 mr-2 shrink-0 mt-0.5" />
                <span>Demonstrate Lexical Analysis by tokenizing pseudo-code keywords, identifiers, and operators.</span>
              </li>
              <li className="flex items-start">
                <CheckCircle2 className="w-5 h-5 text-green-400 mr-2 shrink-0 mt-0.5" />
                <span>Demonstrate Syntax Analysis using a Context-Free Grammar (CFG) parser.</span>
              </li>
              <li className="flex items-start">
                <CheckCircle2 className="w-5 h-5 text-green-400 mr-2 shrink-0 mt-0.5" />
                <span>Visualize the intermediate representation via an Abstract Syntax Tree (AST).</span>
              </li>
              <li className="flex items-start">
                <CheckCircle2 className="w-5 h-5 text-green-400 mr-2 shrink-0 mt-0.5" />
                <span>Generate valid C code from the AST and execute it in a sandboxed environment.</span>
              </li>
            </ul>
          </div>
        </motion.section>

        {/* Tech Stack */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass rounded-2xl p-8 border border-zinc-800"
        >
          <div className="flex items-center space-x-3 mb-6">
            <Settings className="w-6 h-6 text-purple-400" />
            <h2 className="text-2xl font-bold">2. Technologies Used</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-zinc-900/50 p-6 rounded-xl border border-zinc-800">
              <div className="flex items-center space-x-2 mb-4">
                <Layout className="w-5 h-5 text-blue-400" />
                <h3 className="font-semibold text-zinc-200">Frontend</h3>
              </div>
              <ul className="space-y-2 text-sm text-zinc-400">
                <li><strong className="text-zinc-300">Framework:</strong> Next.js 14 (App Router), React</li>
                <li><strong className="text-zinc-300">Styling:</strong> Tailwind CSS, Framer Motion</li>
                <li><strong className="text-zinc-300">Editor:</strong> Monaco Editor (VS Code core)</li>
                <li><strong className="text-zinc-300">Visualization:</strong> React Flow (Parse Tree)</li>
                <li><strong className="text-zinc-300">State Management:</strong> Zustand</li>
              </ul>
            </div>
            
            <div className="bg-zinc-900/50 p-6 rounded-xl border border-zinc-800">
              <div className="flex items-center space-x-2 mb-4">
                <Server className="w-5 h-5 text-green-400" />
                <h3 className="font-semibold text-zinc-200">Backend & Execution</h3>
              </div>
              <ul className="space-y-2 text-sm text-zinc-400">
                <li><strong className="text-zinc-300">Server:</strong> Node.js, Express</li>
                <li><strong className="text-zinc-300">Compiler Logic:</strong> Custom JS Lexer & Parser (Based on original FLEX/BISON)</li>
                <li><strong className="text-zinc-300">Execution Engine:</strong> Piston API (v2)</li>
                <li><strong className="text-zinc-300">Deployment target:</strong> Vercel (Front) + Render/Railway (Back)</li>
              </ul>
            </div>
          </div>
        </motion.section>

        {/* CFG Rules */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass rounded-2xl p-8 border border-zinc-800"
        >
          <div className="flex items-center space-x-3 mb-6">
            <Code2 className="w-6 h-6 text-orange-400" />
            <h2 className="text-2xl font-bold">3. Context-Free Grammar (CFG)</h2>
          </div>
          
          <div className="bg-[#09090b] p-6 rounded-xl border border-zinc-800 font-mono text-sm overflow-x-auto">
            <pre className="text-zinc-300 leading-loose">
<span className="text-purple-400">Program</span>    → START Statements STOP
<span className="text-purple-400">Statements</span> → Statement Statements | ε
<span className="text-purple-400">Statement</span>  → READ idList
           | PRINT expr
           | ID = expr
           | IF condition THEN Statements [ELSE Statements] ENDIF
           | FOR ID = expr TO expr Statements ENDFOR
           | WHILE condition DO Statements ENDWHILE
<span className="text-purple-400">idList</span>     → ID (, ID)*
<span className="text-purple-400">condition</span>  → expr relop expr
<span className="text-purple-400">expr</span>       → term ((+ | -) term)*
<span className="text-purple-400">term</span>       → factor ((* | /) factor)*
<span className="text-purple-400">factor</span>     → ID | NUMBER | ( expr )
<span className="text-purple-400">relop</span>      → &gt; | &lt; | &gt;= | &lt;= | == | !=
            </pre>
          </div>
        </motion.section>
        
        {/* Conclusion */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass rounded-2xl p-8 border border-zinc-800 text-center"
        >
          <h2 className="text-2xl font-bold mb-4">Conclusion</h2>
          <p className="text-zinc-400 max-w-2xl mx-auto">
            This project successfully demonstrates the core phases of a compiler front-end. By migrating the 
            original FLEX/BISON logic to a modern JavaScript-based web architecture, it provides an accessible, 
            visual, and interactive learning tool for compiler design concepts.
          </p>
        </motion.section>
      </div>
    </div>
  );
}

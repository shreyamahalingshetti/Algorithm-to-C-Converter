"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Code2, ArrowDownRight } from "lucide-react";

export default function Home() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background glowing effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[120px] pointer-events-none" />

      <div className="z-10 max-w-5xl mx-auto px-4 text-center mt-20 mb-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-zinc-800/50 border border-zinc-700 text-zinc-300 text-sm mb-8">
            <span className="flex h-2 w-2 rounded-full bg-blue-500 animate-pulse"></span>
            <span>Compiler Front-End Mini Project</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8">
            Algorithm to <br className="md:hidden" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 drop-shadow-sm">
              C Program
            </span> Converter
          </h1>
          
          <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto mb-12">
            A full-stack web application demonstrating lexical analysis, syntax parsing, 
            parse tree visualization, and code generation from pseudo-code algorithms.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              href="/editor"
              className="px-8 py-4 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-semibold flex items-center space-x-2 transition-all shadow-[0_0_20px_rgba(37,99,235,0.4)] hover:shadow-[0_0_30px_rgba(37,99,235,0.6)] hover:-translate-y-1"
            >
              <span>Start Converting</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
            
            <Link 
              href="/docs"
              className="px-8 py-4 rounded-full bg-zinc-800 hover:bg-zinc-700 text-white font-semibold flex items-center space-x-2 transition-all border border-zinc-700 hover:border-zinc-600"
            >
              <Code2 className="w-5 h-5" />
              <span>View Architecture</span>
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Architecture Flow */}
      <div className="w-full max-w-6xl mx-auto px-4 mb-32 z-10">
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="glass rounded-3xl p-8 md:p-12 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500" />
          
          <h2 className="text-3xl font-bold mb-12 text-center">How it Works</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 text-center">
            {[
              { step: "1", title: "Pseudo-code", desc: "Write algorithm" },
              { step: "2", title: "Lexer", desc: "Token generation" },
              { step: "3", title: "Parser", desc: "Syntax validation" },
              { step: "4", title: "Code Gen", desc: "C code translation" },
              { step: "5", title: "Execute", desc: "Compile & Run" },
            ].map((item, i) => (
              <motion.div 
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 + 0.2 }}
                className="relative"
              >
                <div className="w-16 h-16 mx-auto rounded-2xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-2xl font-bold mb-4 shadow-lg group-hover:border-blue-500 transition-colors">
                  <span className="text-transparent bg-clip-text bg-gradient-to-br from-blue-400 to-purple-400">
                    {item.step}
                  </span>
                </div>
                <h3 className="font-semibold text-zinc-200 mb-2">{item.title}</h3>
                <p className="text-sm text-zinc-500">{item.desc}</p>
                
                {i < 4 && (
                  <ArrowDownRight className="hidden md:block absolute top-8 -right-8 w-6 h-6 text-zinc-600 -rotate-45" />
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      <footer className="w-full py-8 text-center text-zinc-500 text-sm z-10 border-t border-zinc-800/50">
        <p>Built with Next.js, Node.js, and Express. Concept based on FLEX/BISON compiler tools.</p>
      </footer>
    </div>
  );
}

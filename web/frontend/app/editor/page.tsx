"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useStore } from "@/store/useStore";
import { ArrowRight, Play, Save } from "lucide-react";

const EXAMPLES = {
  Addition: "START\nREAD a,b\nsum = a+b\nPRINT sum\nSTOP\n",
  Factorial: "START\nREAD n\nfact = 1\nFOR i = 1 TO n\n  fact = fact * i\nENDFOR\nPRINT fact\nSTOP\n",
  Fibonacci: "START\nREAD n\na = 0\nb = 1\nPRINT a\nPRINT b\nFOR i = 3 TO n\n  c = a + b\n  PRINT c\n  a = b\n  b = c\nENDFOR\nSTOP\n",
  "While Loop": "START\nREAD x\nWHILE x > 0 DO\n  PRINT x\n  x = x - 1\nENDWHILE\nSTOP\n",
  "Nested Conditions": "START\nREAD a,b\nIF a > b THEN\n  PRINT a\nELSE\n  PRINT b\nENDIF\nSTOP\n",
};

export default function EditorPage() {
  const router = useRouter();
  const { code, setCode, setTokens, setLexErrors } = useStore();
  const [isTokenizing, setIsTokenizing] = useState(false);

  const handleEditorChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCode(e.target.value);
  };

  const loadExample = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const key = e.target.value as keyof typeof EXAMPLES;
    if (EXAMPLES[key]) setCode(EXAMPLES[key]);
  };

  const handleTokenize = async () => {
    setIsTokenizing(true);
    try {
      // Assuming backend is running on 3001
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
      const res = await fetch(`${API_URL}/api/tokenize`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code })
      });
      const data = await res.json();
      setTokens(data.tokens);
      setLexErrors(data.errors);
      router.push("/lexer");
    } catch (err) {
      console.error("Tokenization failed", err);
      alert("Failed to connect to backend server");
    } finally {
      setIsTokenizing(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col max-w-7xl w-full mx-auto p-4 md:p-8">
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4 md:gap-0"
      >
        <div>
          <h1 className="text-3xl font-bold gradient-text mb-2">Pseudo-code Editor</h1>
          <p className="text-zinc-400">Write your algorithm or load an example to begin.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 w-full md:w-auto">
          <select 
            onChange={loadExample}
            defaultValue=""
            className="px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white outline-none focus:ring-2 focus:ring-blue-500 appearance-none w-full sm:w-auto"
          >
            <option value="" disabled>Load Example...</option>
            {Object.keys(EXAMPLES).map(ex => (
              <option key={ex} value={ex}>{ex}</option>
            ))}
          </select>
          
          <button
            onClick={handleTokenize}
            disabled={isTokenizing || !code.trim()}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg flex items-center justify-center space-x-2 transition-all shadow-[0_0_15px_rgba(37,99,235,0.3)] disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
          >
            {isTokenizing ? (
              <span className="animate-pulse">Processing...</span>
            ) : (
              <>
                <span>Tokenize</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="flex-1 min-h-[500px] border border-zinc-800 rounded-xl overflow-hidden glass shadow-2xl relative"
      >
        <div className="h-12 bg-zinc-900/80 border-b border-zinc-800 flex items-center px-4">
          <div className="flex space-x-2">
            <div className="w-3 h-3 rounded-full bg-red-500/80" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
            <div className="w-3 h-3 rounded-full bg-green-500/80" />
          </div>
          <span className="ml-4 text-xs font-medium text-zinc-500 font-mono">algorithm.txt</span>
        </div>
        
        <textarea
          value={code}
          onChange={handleEditorChange}
          className="w-full h-[500px] p-6 bg-[#1e1e1e] text-zinc-300 font-mono text-base resize-none outline-none focus:ring-1 focus:ring-blue-500/50"
          placeholder="Enter your algorithm here..."
          spellCheck={false}
        />
      </motion.div>
    </div>
  );
}

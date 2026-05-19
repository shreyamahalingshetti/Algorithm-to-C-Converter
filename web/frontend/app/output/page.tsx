"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useStore } from "@/store/useStore";
import { ArrowLeft, Play, Download, TerminalSquare } from "lucide-react";

export default function OutputPage() {
  const router = useRouter();
  const { cCode } = useStore();
  const [isRunning, setIsRunning] = useState(false);
  const [output, setOutput] = useState<{stdout: string, stderr: string, code: number} | null>(null);
  const [inputs, setInputs] = useState("10 20"); // Default test inputs
  
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [output]);

  const handleRun = async () => {
    setIsRunning(true);
    setOutput(null);
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
      const res = await fetch(`${API_URL}/api/execute`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: cCode, stdin: inputs })
      });
      const data = await res.json();
      setOutput(data);
    } catch (err) {
      console.error(err);
      setOutput({ stdout: "", stderr: "Failed to connect to execution server.", code: -1 });
    } finally {
      setIsRunning(false);
    }
  };

  if (!cCode) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center">
        <TerminalSquare className="w-16 h-16 text-zinc-600 mb-4" />
        <h2 className="text-2xl font-semibold mb-2">No C Code to Run</h2>
        <p className="text-zinc-400 mb-6">Generate the C code before trying to execute it.</p>
        <button 
          onClick={() => router.push("/codegen")}
          className="px-6 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg flex items-center space-x-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Code Gen</span>
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col max-w-5xl w-full mx-auto p-4 md:p-8">
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4 md:gap-0"
      >
        <div>
          <h1 className="text-3xl font-bold gradient-text mb-2">Execution Output</h1>
          <p className="text-zinc-400">Run the generated C code in a sandboxed environment.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 w-full md:w-auto">
          <button
            onClick={() => router.push("/codegen")}
            className="px-6 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white font-medium rounded-lg flex items-center justify-center space-x-2 transition-colors border border-zinc-700 w-full sm:w-auto"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Controls Panel */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="md:col-span-1 glass rounded-2xl p-6 border border-zinc-800 h-fit"
        >
          <h3 className="text-lg font-semibold mb-4 text-zinc-200">Execution Settings</h3>
          
          <div className="mb-6">
            <label className="block text-sm text-zinc-400 mb-2">
              Standard Input (stdin)
            </label>
            <textarea
              value={inputs}
              onChange={(e) => setInputs(e.target.value)}
              className="w-full h-32 bg-zinc-900 border border-zinc-700 rounded-lg p-3 text-sm font-mono text-zinc-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none resize-none"
              placeholder="Enter space-separated inputs (e.g. for READ a,b)"
            />
            <p className="text-xs text-zinc-500 mt-2">
              Values to be read by scanf() in the generated code.
            </p>
          </div>

          <button
            onClick={handleRun}
            disabled={isRunning || !cCode}
            className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg flex justify-center items-center space-x-2 transition-all shadow-[0_0_15px_rgba(37,99,235,0.3)] disabled:opacity-50"
          >
            {isRunning ? (
              <span className="animate-pulse">Running...</span>
            ) : (
              <>
                <Play className="w-5 h-5 fill-current" />
                <span>Run Program</span>
              </>
            )}
          </button>
        </motion.div>

        {/* Terminal Window */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="md:col-span-2 rounded-2xl overflow-hidden border border-zinc-800 bg-black flex flex-col min-h-[400px] shadow-2xl"
        >
          {/* Terminal Header */}
          <div className="h-10 bg-[#2d2d2d] flex items-center px-4 border-b border-black">
            <div className="flex space-x-2">
              <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
              <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
              <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
            </div>
            <div className="mx-auto text-xs text-zinc-400 font-mono flex items-center space-x-2">
              <TerminalSquare className="w-3 h-3" />
              <span>bash - piston-env</span>
            </div>
          </div>
          
          {/* Terminal Output */}
          <div className="flex-1 p-4 font-mono text-sm overflow-y-auto">
            {!output && !isRunning && (
              <div className="text-zinc-500 italic">
                $ gcc main.c -o main<br/>
                $ ./main<br/>
                Waiting for execution...
              </div>
            )}
            
            {isRunning && (
              <div className="text-blue-400 flex items-center space-x-2">
                <span className="animate-pulse">●</span>
                <span>Compiling and running on Piston API...</span>
              </div>
            )}

            {output && (
              <div className="space-y-2">
                <div className="text-zinc-300">
                  <span className="text-green-400">guest@sandbox</span>
                  <span className="text-zinc-500">:$</span> ./main
                </div>
                
                {output.stdout && (
                  <pre className="text-zinc-100 whitespace-pre-wrap">{output.stdout}</pre>
                )}
                
                {output.stderr && (
                  <pre className="text-red-400 whitespace-pre-wrap">{output.stderr}</pre>
                )}
                
                <div className="pt-2 text-zinc-500 flex items-center space-x-2">
                  <span>[Process completed with exit code {output.code}]</span>
                  {output.code === 0 && <span className="text-green-400">✓</span>}
                  {output.code !== 0 && <span className="text-red-400">✗</span>}
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>
        </motion.div>
      </div>
    </div>
  );
}

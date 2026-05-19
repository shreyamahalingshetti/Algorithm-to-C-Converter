"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useStore } from "@/store/useStore";
import { ArrowRight, ArrowLeft, Code2, Download, Copy, Check } from "lucide-react";

export default function CodeGenPage() {
  const router = useRouter();
  const { code, cCode } = useStore();
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(cCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([cCode], { type: "text/x-csrc" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "program.c";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (!cCode) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center">
        <Code2 className="w-16 h-16 text-zinc-600 mb-4" />
        <h2 className="text-2xl font-semibold mb-2">No C Code Generated</h2>
        <p className="text-zinc-400 mb-6">Go back and generate the code first.</p>
        <button 
          onClick={() => router.push("/tree")}
          className="px-6 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg flex items-center space-x-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Parse Tree</span>
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col max-w-7xl w-full mx-auto p-4 md:p-8 h-[calc(100vh-64px)] pb-12">
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4 md:gap-0"
      >
        <div>
          <h1 className="text-3xl font-bold gradient-text mb-2">Code Generation</h1>
          <p className="text-zinc-400">Equivalent C program generated from AST.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 w-full md:w-auto">
          <button
            onClick={() => router.push("/tree")}
            className="px-6 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white font-medium rounded-lg flex items-center justify-center space-x-2 transition-colors border border-zinc-700 w-full sm:w-auto"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
          
          <button
            onClick={() => router.push("/output")}
            disabled={!cCode}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg flex items-center justify-center space-x-2 transition-all shadow-[0_0_15px_rgba(37,99,235,0.3)] disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
          >
            <span>Run Code</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </motion.div>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 min-h-0">
        {/* Pseudo-code View */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col border border-zinc-800 rounded-xl overflow-hidden glass shadow-xl"
        >
          <div className="h-12 bg-zinc-900/80 border-b border-zinc-800 flex items-center px-4 shrink-0">
            <span className="text-sm font-medium text-purple-400 font-mono">Input: Pseudo-code</span>
          </div>
          <div className="flex-1">
            <textarea
              readOnly
              value={code}
              className="w-full h-full min-h-[300px] p-4 bg-[#1e1e1e] text-zinc-300 font-mono text-sm resize-none outline-none"
            />
          </div>
        </motion.div>

        {/* Generated C Code View */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col border border-zinc-800 rounded-xl overflow-hidden glass shadow-[0_0_30px_rgba(37,99,235,0.1)] relative"
        >
          <div className="h-12 bg-zinc-900/80 border-b border-zinc-800 flex items-center justify-between px-4 shrink-0">
            <span className="text-sm font-medium text-blue-400 font-mono">Output: main.c</span>
            <div className="flex space-x-2">
              <button 
                onClick={handleCopy}
                className="p-1.5 text-zinc-400 hover:text-white bg-zinc-800 hover:bg-zinc-700 rounded-md transition-colors"
                title="Copy to clipboard"
              >
                {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
              </button>
              <button 
                onClick={handleDownload}
                className="p-1.5 text-zinc-400 hover:text-white bg-zinc-800 hover:bg-zinc-700 rounded-md transition-colors"
                title="Download .c file"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="flex-1">
            <textarea
              readOnly
              value={cCode}
              className="w-full h-full min-h-[300px] p-4 bg-[#1e1e1e] text-blue-300 font-mono text-sm resize-none outline-none"
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
}

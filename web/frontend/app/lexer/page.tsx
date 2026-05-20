"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useStore } from "@/store/useStore";
import { ArrowRight, ArrowLeft, TerminalSquare, AlertTriangle } from "lucide-react";

export default function LexerPage() {
  const router = useRouter();
  const { tokens, lexErrors, code, setParseTree, setParseErrors, setVariables, setCCode, setSymbolTable } = useStore();
  const [isParsing, setIsParsing] = useState(false);

  // Stats
  const stats = {
    keywords: tokens.filter(t => [
      'START', 'STOP', 'READ', 'PRINT', 'IF', 'THEN', 'ELSE', 'ENDIF', 'FOR', 'TO', 'ENDFOR', 'WHILE', 'DO', 'ENDWHILE',
      'INT_TYPE', 'FLOAT_TYPE', 'CHAR_TYPE', 'STRING_TYPE', 'DOUBLE_TYPE', 'LONG_TYPE', 'SWITCH', 'CASE', 'DEFAULT', 'BREAK', 'ENDSWITCH',
      'REPEAT', 'UNTIL', 'FUNCTION', 'RETURN', 'ENDFUNCTION', 'ARRAY'
    ].includes(t.token)).length,
    identifiers: tokens.filter(t => t.token === 'ID').length,
    operators: tokens.filter(t => ['=', '+', '-', '*', '/', '<', '>', '<=', '>=', '==', ',', ':', '[', ']'].includes(t.token)).length,
    numbers: tokens.filter(t => t.token === 'NUMBER').length,
  };

  const getTokenColor = (token: string) => {
    if ([
      'START', 'STOP', 'READ', 'PRINT', 'IF', 'THEN', 'ELSE', 'ENDIF', 'FOR', 'TO', 'ENDFOR', 'WHILE', 'DO', 'ENDWHILE',
      'INT_TYPE', 'FLOAT_TYPE', 'CHAR_TYPE', 'STRING_TYPE', 'DOUBLE_TYPE', 'LONG_TYPE', 'SWITCH', 'CASE', 'DEFAULT', 'BREAK', 'ENDSWITCH',
      'REPEAT', 'UNTIL', 'FUNCTION', 'RETURN', 'ENDFUNCTION', 'ARRAY'
    ].includes(token)) return "text-purple-400 bg-purple-400/10 border-purple-400/20";
    if (token === 'ID') return "text-blue-400 bg-blue-400/10 border-blue-400/20";
    if (token === 'NUMBER') return "text-green-400 bg-green-400/10 border-green-400/20";
    if (token === 'EOF') return "text-zinc-500 bg-zinc-500/10 border-zinc-500/20";
    return "text-orange-400 bg-orange-400/10 border-orange-400/20"; // operators
  };

  const handleParse = async () => {
    setIsParsing(true);
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
      const res = await fetch(`${API_URL}/api/parse`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code })
      });
      const data = await res.json();
      
      setParseTree(data.tree);
      setParseErrors(data.errors);
      setVariables(data.variables || []);
      setSymbolTable(data.symbolTable || {});
      
      router.push("/parser");
    } catch (err) {
      console.error("Parsing failed", err);
      alert("Failed to connect to backend server");
    } finally {
      setIsParsing(false);
    }
  };

  if (!tokens || tokens.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center">
        <TerminalSquare className="w-16 h-16 text-zinc-600 mb-4" />
        <h2 className="text-2xl font-semibold mb-2">No Tokens Found</h2>
        <p className="text-zinc-400 mb-6">Go back to the editor and tokenize your code first.</p>
        <button 
          onClick={() => router.push("/editor")}
          className="px-6 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg flex items-center space-x-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Editor</span>
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col max-w-7xl w-full mx-auto p-4 md:p-8">
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4 md:gap-0"
      >
        <div>
          <h1 className="text-3xl font-bold gradient-text mb-2">Lexical Analysis</h1>
          <p className="text-zinc-400">Tokens generated from your pseudo-code.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 w-full md:w-auto">
          <button
            onClick={() => router.push("/editor")}
            className="px-6 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white font-medium rounded-lg flex items-center justify-center space-x-2 transition-colors border border-zinc-700 w-full sm:w-auto"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
          
          <button
            onClick={handleParse}
            disabled={isParsing || lexErrors.length > 0}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg flex items-center justify-center space-x-2 transition-all shadow-[0_0_15px_rgba(37,99,235,0.3)] disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
          >
            {isParsing ? (
              <span className="animate-pulse">Parsing...</span>
            ) : (
              <>
                <span>Parse Syntax</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
      >
        <div className="glass p-4 rounded-xl border-t-2 border-t-purple-500 flex flex-col">
          <span className="text-zinc-400 text-sm">Keywords</span>
          <span className="text-3xl font-bold text-zinc-100 mt-1">{stats.keywords}</span>
        </div>
        <div className="glass p-4 rounded-xl border-t-2 border-t-blue-500 flex flex-col">
          <span className="text-zinc-400 text-sm">Identifiers</span>
          <span className="text-3xl font-bold text-zinc-100 mt-1">{stats.identifiers}</span>
        </div>
        <div className="glass p-4 rounded-xl border-t-2 border-t-orange-500 flex flex-col">
          <span className="text-zinc-400 text-sm">Operators</span>
          <span className="text-3xl font-bold text-zinc-100 mt-1">{stats.operators}</span>
        </div>
        <div className="glass p-4 rounded-xl border-t-2 border-t-green-500 flex flex-col">
          <span className="text-zinc-400 text-sm">Numbers</span>
          <span className="text-3xl font-bold text-zinc-100 mt-1">{stats.numbers}</span>
        </div>
      </motion.div>

      {/* Error Display */}
      {lexErrors && lexErrors.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-8 p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start space-x-3 text-red-400"
        >
          <AlertTriangle className="w-6 h-6 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold mb-1">Lexical Errors Detected</h3>
            <ul className="list-disc pl-5 space-y-1">
              {lexErrors.map((err, i) => (
                <li key={i}>{err.message} at line {err.line}, col {err.col}</li>
              ))}
            </ul>
          </div>
        </motion.div>
      )}

      {/* Token Table */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass rounded-xl overflow-hidden border border-zinc-800 flex-1"
      >
        <div className="overflow-x-auto max-h-[500px]">
          <table className="w-full text-left text-sm text-zinc-300">
            <thead className="text-xs uppercase bg-zinc-900/80 sticky top-0 z-10 border-b border-zinc-800">
              <tr>
                <th scope="col" className="px-6 py-4 font-semibold">Line</th>
                <th scope="col" className="px-6 py-4 font-semibold">Lexeme</th>
                <th scope="col" className="px-6 py-4 font-semibold">Token Type</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {tokens.filter(t => t.token !== 'EOF').map((token, index) => (
                <motion.tr 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.02 }}
                  key={index} 
                  className="hover:bg-zinc-800/30 transition-colors"
                >
                  <td className="px-6 py-3 text-zinc-500 font-mono">{token.line}:{token.col}</td>
                  <td className="px-6 py-3 font-mono font-medium text-white">{token.lexeme}</td>
                  <td className="px-6 py-3">
                    <span className={`px-2.5 py-1 rounded-md text-xs font-semibold border ${getTokenColor(token.token)}`}>
                      {token.token}
                    </span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}

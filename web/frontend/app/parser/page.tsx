"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useStore } from "@/store/useStore";
import { ArrowRight, ArrowLeft, FileText, CheckCircle2, XCircle } from "lucide-react";

const CFG_RULES = [
  "Program → START Declarations Statements STOP",
  "Declarations → Declaration Declarations | ε",
  "Declaration → DataType ID | ARRAY ID [ NUMBER ]",
  "DataType → INT | FLOAT | CHAR | STRING | DOUBLE | LONG",
  "Statements → Statement Statements | ε",
  "Statement → READ idList",
  "Statement → PRINT expr",
  "Statement → ID = expr | ArrayIndex = expr",
  "Statement → IF condition THEN Statements [ELSE Statements] ENDIF",
  "Statement → FOR ID = expr TO expr Statements ENDFOR",
  "Statement → WHILE condition DO Statements ENDWHILE",
  "Statement → SWITCH (expr) Cases ENDSWITCH",
  "Statement → REPEAT Statements UNTIL condition",
  "Statement → FUNCTION ID ( params ) Statements ENDFUNCTION",
  "Statement → RETURN expr",
  "Cases → Case Cases | DefaultCase | ε",
  "Case → CASE expr : Statements [BREAK]",
  "DefaultCase → DEFAULT : Statements",
  "condition → expr (==|!=|>|<|>=|<=) expr",
  "expr → term ((+|-) term)*",
  "term → factor ((*|/) factor)*",
  "factor → ID | ArrayIndex | NUMBER | ( expr )",
  "ArrayIndex → ID [ expr ]",
];

export default function ParserPage() {
  const router = useRouter();
  const { parseTree, parseErrors, variables, symbolTable } = useStore();

  const handleNext = () => {
    router.push("/tree");
  };

  if (!parseTree && (!parseErrors || parseErrors.length === 0)) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center">
        <FileText className="w-16 h-16 text-zinc-600 mb-4" />
        <h2 className="text-2xl font-semibold mb-2">No Parse Tree Found</h2>
        <p className="text-zinc-400 mb-6">Go back and parse the tokens first.</p>
        <button 
          onClick={() => router.push("/lexer")}
          className="px-6 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg flex items-center space-x-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Lexer</span>
        </button>
      </div>
    );
  }

  const isValid = parseErrors.length === 0;

  return (
    <div className="flex-1 flex flex-col max-w-7xl w-full mx-auto p-4 md:p-8">
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4 md:gap-0"
      >
        <div>
          <h1 className="text-3xl font-bold gradient-text mb-2">Syntax Analysis</h1>
          <p className="text-zinc-400">Context Free Grammar validation.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 w-full md:w-auto">
          <button
            onClick={() => router.push("/lexer")}
            className="px-6 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white font-medium rounded-lg flex items-center justify-center space-x-2 transition-colors border border-zinc-700 w-full sm:w-auto"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
          
          <button
            onClick={handleNext}
            disabled={!isValid}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg flex items-center justify-center space-x-2 transition-all shadow-[0_0_15px_rgba(37,99,235,0.3)] disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
          >
            <span>View Parse Tree</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </motion.div>

      <div className="flex flex-col md:flex-row gap-6 mb-8">
        {/* Status Card */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`md:w-1/3 p-6 rounded-2xl border flex flex-col items-center justify-center text-center ${
            isValid 
              ? "glass border-green-500/30 bg-green-500/5 shadow-[0_0_30px_rgba(34,197,94,0.1)]" 
              : "glass border-red-500/30 bg-red-500/5 shadow-[0_0_30px_rgba(239,68,68,0.1)]"
          }`}
        >
          {isValid ? (
            <>
              <CheckCircle2 className="w-16 h-16 text-green-400 mb-4" />
              <h2 className="text-2xl font-bold text-green-400 mb-2">Syntax Valid</h2>
              <p className="text-green-400/80 text-sm">
                The tokens match the grammar rules. Ready to build parse tree.
              </p>
            </>
          ) : (
            <>
              <XCircle className="w-16 h-16 text-red-400 mb-4" />
              <h2 className="text-2xl font-bold text-red-400 mb-2">Syntax Error</h2>
              <p className="text-red-400/80 text-sm mb-4">
                Failed to parse according to CFG rules.
              </p>
              <div className="w-full text-left bg-red-500/10 rounded-lg p-3 text-red-300 text-sm font-mono">
                {parseErrors.map((err, i) => (
                  <div key={i}>{err.message}</div>
                ))}
              </div>
            </>
          )}
        </motion.div>

        {/* Variables Found */}
        {isValid && variables.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="md:col-span-2 glass rounded-2xl p-6 border border-zinc-800"
          >
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <span className="w-2 h-2 rounded-full bg-blue-500 mr-2"></span>
              Variables Detected (Symbol Table)
            </h3>
            <div className="flex flex-wrap gap-2">
              {variables.map((v, i) => {
                const type = symbolTable[v] || 'int';
                let displayType = `int ${v}`;
                if (type === 'float') displayType = `float ${v}`;
                else if (type === 'char') displayType = `char ${v}`;
                else if (type === 'string') displayType = `char ${v}[100]`;
                else if (type === 'double') displayType = `double ${v}`;
                else if (type === 'long') displayType = `long ${v}`;
                else if (type.startsWith('array:')) {
                  const size = type.split(':')[1];
                  displayType = `int ${v}[${size}]`;
                }
                return (
                  <span key={i} className="px-3 py-1 bg-blue-500/10 border border-blue-500/30 text-blue-300 rounded-md font-mono" id={`sym-${v}`}>
                    {displayType}
                  </span>
                );
              })}
            </div>
            <p className="text-zinc-500 text-sm mt-4">
              These variables were collected during parsing and will be declared in the generated C code.
            </p>
          </motion.div>
        )}
      </div>

      {/* CFG Rules */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass rounded-2xl overflow-hidden border border-zinc-800 flex-1 flex flex-col"
      >
        <div className="px-6 py-4 border-b border-zinc-800 bg-zinc-900/50">
          <h3 className="font-semibold text-zinc-200">Context Free Grammar (CFG) Rules Used</h3>
        </div>
        <div className="p-6 overflow-y-auto font-mono text-sm text-zinc-300 bg-[#09090b]/50">
          {CFG_RULES.map((rule, i) => {
            const parts = rule.split('→');
            return (
              <div key={i} className="flex mb-2 hover:bg-zinc-800/30 px-2 py-1 rounded transition-colors">
                <span className="text-purple-400 w-32 shrink-0">{parts[0].trim()}</span>
                <span className="text-zinc-500 mx-2">→</span>
                <span className="text-blue-300">{parts[1]?.trim()}</span>
              </div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}

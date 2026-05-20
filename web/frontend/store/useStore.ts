import { create } from 'zustand';

interface StoreState {
  code: string;
  setCode: (code: string) => void;
  tokens: any[];
  setTokens: (tokens: any[]) => void;
  lexErrors: any[];
  setLexErrors: (errors: any[]) => void;
  parseTree: any;
  setParseTree: (tree: any) => void;
  parseErrors: any[];
  setParseErrors: (errors: any[]) => void;
  variables: string[];
  setVariables: (vars: string[]) => void;
  symbolTable: Record<string, string>;
  setSymbolTable: (table: Record<string, string>) => void;
  cCode: string;
  setCCode: (code: string) => void;
}

export const useStore = create<StoreState>((set) => ({
  code: 'START\nREAD a,b\nsum = a+b\nPRINT sum\nSTOP\n',
  setCode: (code) => set({ code }),
  tokens: [],
  setTokens: (tokens) => set({ tokens }),
  lexErrors: [],
  setLexErrors: (lexErrors) => set({ lexErrors }),
  parseTree: null,
  setParseTree: (parseTree) => set({ parseTree }),
  parseErrors: [],
  setParseErrors: (parseErrors) => set({ parseErrors }),
  variables: [],
  setVariables: (variables) => set({ variables }),
  symbolTable: {},
  setSymbolTable: (symbolTable) => set({ symbolTable }),
  cCode: '',
  setCCode: (cCode) => set({ cCode }),
}));

class Lexer {
  constructor() {
    this.rules = [
      // Ignore whitespace
      { regex: /^\s+/, type: null },
      
      // Keywords
      { regex: /^START\b/, type: 'START' },
      { regex: /^READ\b/, type: 'READ' },
      { regex: /^PRINT\b/, type: 'PRINT' },
      { regex: /^IF\b/, type: 'IF' },
      { regex: /^THEN\b/, type: 'THEN' },
      { regex: /^ELSE\b/, type: 'ELSE' },
      { regex: /^ENDIF\b/, type: 'ENDIF' },
      { regex: /^FOR\b/, type: 'FOR' },
      { regex: /^TO\b/, type: 'TO' },
      { regex: /^ENDFOR\b/, type: 'ENDFOR' },
      { regex: /^WHILE\b/, type: 'WHILE' },
      { regex: /^DO\b/, type: 'DO' },
      { regex: /^ENDWHILE\b/, type: 'ENDWHILE' },
      
      // Datatypes
      { regex: /^INT\b/, type: 'INT_TYPE' },
      { regex: /^FLOAT\b/, type: 'FLOAT_TYPE' },
      { regex: /^CHAR\b/, type: 'CHAR_TYPE' },
      { regex: /^STRING\b/, type: 'STRING_TYPE' },
      { regex: /^DOUBLE\b/, type: 'DOUBLE_TYPE' },
      { regex: /^LONG\b/, type: 'LONG_TYPE' },
      
      // Switch-Case
      { regex: /^SWITCH\b/, type: 'SWITCH' },
      { regex: /^CASE\b/, type: 'CASE' },
      { regex: /^DEFAULT\b/, type: 'DEFAULT' },
      { regex: /^BREAK\b/, type: 'BREAK' },
      { regex: /^END\s*SWITCH\b/, type: 'ENDSWITCH' },
      
      // Repeat-Until
      { regex: /^REPEAT\b/, type: 'REPEAT' },
      { regex: /^UNTIL\b/, type: 'UNTIL' },
      
      // Functions
      { regex: /^FUNCTION\b/, type: 'FUNCTION' },
      { regex: /^RETURN\b/, type: 'RETURN' },
      { regex: /^ENDFUNCTION\b/, type: 'ENDFUNCTION' },
      
      // Arrays
      { regex: /^ARRAY\b/, type: 'ARRAY' },
      
      // Program Termination (STOP or END)
      { regex: /^(STOP|END)\b/, type: 'STOP' },
      
      // Numbers
      { regex: /^[0-9]+/, type: 'NUMBER' },
      
      // Strings
      { regex: /^"[^"]*"/, type: 'STRING' },
      
      // Identifiers
      { regex: /^[a-zA-Z_][a-zA-Z0-9_]*/, type: 'ID' },
      
      // Operators and Symbols
      { regex: /^==/, type: '==' },
      { regex: /^<=/, type: '<=' },
      { regex: /^>=/, type: '>=' },
      { regex: /^</, type: '<' },
      { regex: /^>/, type: '>' },
      { regex: /^=/, type: '=' },
      { regex: /^\+/, type: '+' },
      { regex: /^-/, type: '-' },
      { regex: /^\*/, type: '*' },
      { regex: /^\//, type: '/' },
      { regex: /^,/, type: ',' },
      { regex: /^\(/, type: '(' },
      { regex: /^\)/, type: ')' },
      { regex: /^:/, type: ':' },
      { regex: /^\[/, type: '[' },
      { regex: /^\]/, type: ']' },
    ];
  }

  tokenize(input) {
    let cursor = 0;
    let line = 1;
    let col = 1;
    const tokens = [];
    const errors = [];

    while (cursor < input.length) {
      let matched = false;
      const str = input.slice(cursor);

      for (const rule of this.rules) {
        const match = str.match(rule.regex);
        if (match) {
          matched = true;
          const lexeme = match[0];
          
          if (rule.type !== null) {
            tokens.push({
              lexeme,
              token: rule.type,
              line,
              col
            });
          }

          // Update cursor and line/col
          for (let i = 0; i < lexeme.length; i++) {
            if (lexeme[i] === '\n') {
              line++;
              col = 1;
            } else {
              col++;
            }
          }
          cursor += lexeme.length;
          break;
        }
      }

      if (!matched) {
        // Invalid token
        const char = str[0];
        errors.push({
          message: `Invalid token '${char}'`,
          line,
          col
        });
        
        if (char === '\n') {
            line++;
            col = 1;
        } else {
            col++;
        }
        cursor++;
      }
    }

    // Add EOF token
    tokens.push({ lexeme: '', token: 'EOF', line, col });

    return { tokens, errors };
  }
}

module.exports = Lexer;

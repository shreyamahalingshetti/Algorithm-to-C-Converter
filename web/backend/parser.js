class Parser {
  constructor(tokens) {
    this.tokens = tokens;
    this.current = 0;
    this.errors = [];
    this.tree = null;
    this.variables = new Set();
    this.symbolTable = new Map();
  }

  parse() {
    this.tree = this.program();
    
    // Check if we consumed all tokens (except EOF)
    if (this.current < this.tokens.length && this.peek().token !== 'EOF') {
      this.error('Unexpected trailing tokens');
    }

    return {
      valid: this.errors.length === 0,
      errors: this.errors,
      tree: this.tree,
      variables: Array.from(this.variables),
      symbolTable: Object.fromEntries(this.symbolTable)
    };
  }

  peek() {
    if (this.current >= this.tokens.length) {
      return this.tokens[this.tokens.length - 1]; // EOF
    }
    return this.tokens[this.current];
  }

  previous() {
    return this.tokens[this.current - 1];
  }

  advance() {
    if (this.peek().token !== 'EOF') {
      this.current++;
    }
    return this.previous();
  }

  match(...types) {
    for (const type of types) {
      if (this.check(type)) {
        this.advance();
        return true;
      }
    }
    return false;
  }

  check(type) {
    return this.peek().token === type;
  }

  consume(type, message) {
    if (this.check(type)) return this.advance();
    this.error(message);
    // Simple recovery: just advance to prevent infinite loops in some cases
    // but here we might just throw or return null to stop current rule
    throw new Error(message);
  }

  error(message) {
    const token = this.peek();
    this.errors.push({
      message: `${message} at line ${token.line}, col ${token.col} (got ${token.lexeme || token.token})`,
      line: token.line,
      col: token.col
    });
  }

  // --- Grammar Rules ---

  // program → START declarations statements STOP
  program() {
    const node = { type: 'Program', children: [] };
    try {
      this.consume('START', 'Expected START at beginning of program');
      node.children.push({ type: 'Terminal', value: 'START' });

      node.children.push(this.declarations());

      node.children.push(this.statements());

      this.consume('STOP', 'Expected STOP at end of program');
      node.children.push({ type: 'Terminal', value: 'STOP' });
    } catch (e) {
      // Error already recorded
    }
    return node;
  }

  // declarations → declaration*
  declarations() {
    const node = { type: 'Declarations', children: [] };
    while (this.check('INT_TYPE') || this.check('FLOAT_TYPE') || this.check('CHAR_TYPE') || 
           this.check('STRING_TYPE') || this.check('DOUBLE_TYPE') || this.check('LONG_TYPE') || 
           this.check('ARRAY')) {
      try {
        node.children.push(this.declaration());
      } catch (e) {
        this.advance();
      }
    }
    return node;
  }

  // declaration → DataType ID | ARRAY ID '[' NUMBER ']'
  declaration() {
    if (this.match('ARRAY')) {
      const node = { type: 'ArrayDeclaration', children: [{ type: 'Terminal', value: 'ARRAY' }] };
      const idToken = this.consume('ID', "Expected array name after ARRAY");
      this.variables.add(idToken.lexeme);
      node.children.push({ type: 'Identifier', value: idToken.lexeme });
      
      this.consume('[', "Expected '[' after array name");
      const sizeToken = this.consume('NUMBER', "Expected array size");
      node.children.push({ type: 'Number', value: sizeToken.lexeme });
      this.consume(']', "Expected ']' after array size");
      
      this.symbolTable.set(idToken.lexeme, `array:${sizeToken.lexeme}`);
      return node;
    } else {
      const node = { type: 'Declaration', children: [] };
      const typeToken = this.advance(); // INT_TYPE, FLOAT_TYPE, etc.
      node.children.push({ type: 'DataType', value: typeToken.lexeme });
      
      const idToken = this.consume('ID', "Expected variable name after datatype");
      this.variables.add(idToken.lexeme);
      node.children.push({ type: 'Identifier', value: idToken.lexeme });
      
      // Store in symbol table (standard lowercase type name like int, float, char, string)
      let typeStr = 'int';
      if (typeToken.token === 'FLOAT_TYPE') typeStr = 'float';
      else if (typeToken.token === 'CHAR_TYPE') typeStr = 'char';
      else if (typeToken.token === 'STRING_TYPE') typeStr = 'string';
      else if (typeToken.token === 'DOUBLE_TYPE') typeStr = 'double';
      else if (typeToken.token === 'LONG_TYPE') typeStr = 'long';
      
      this.symbolTable.set(idToken.lexeme, typeStr);
      return node;
    }
  }

  // statements → statement*
  statements() {
    const node = { type: 'Statements', children: [] };
    while (!this.check('STOP') && !this.check('EOF') && 
           !this.check('ENDIF') && !this.check('ELSE') && 
           !this.check('ENDFOR') && !this.check('ENDWHILE') &&
           !this.check('CASE') && !this.check('DEFAULT') && 
           !this.check('ENDSWITCH') && !this.check('BREAK') &&
           !this.check('UNTIL') && !this.check('ENDFUNCTION')) {
      try {
        const stmt = this.statement();
        if (stmt) {
          node.children.push(stmt);
        } else {
          // If statement failed, advance to avoid infinite loop
          this.advance();
        }
      } catch (e) {
        this.advance();
      }
    }
    return node;
  }

  // statement → READ idList | PRINT idExpr | ID = expr | IF... | FOR... | WHILE... | SWITCH... | REPEAT... | FUNCTION... | RETURN...
  statement() {
    if (this.match('READ')) return this.readStatement();
    if (this.match('PRINT')) return this.printStatement();
    if (this.match('IF')) return this.ifStatement();
    if (this.match('FOR')) return this.forStatement();
    if (this.match('WHILE')) return this.whileStatement();
    if (this.match('SWITCH')) return this.switchStatement();
    if (this.match('REPEAT')) return this.repeatStatement();
    if (this.match('FUNCTION')) return this.functionStatement();
    if (this.match('RETURN')) return this.returnStatement();
    if (this.check('ID')) return this.assignmentStatement();
    
    this.error('Expected a valid statement (READ, PRINT, IF, FOR, WHILE, SWITCH, REPEAT, FUNCTION, RETURN, or assignment)');
    throw new Error('Invalid statement');
  }

  readStatement() {
    const node = { type: 'ReadStatement', children: [{ type: 'Terminal', value: 'READ' }] };
    
    do {
      const idToken = this.consume('ID', 'Expected variable name after READ');
      this.variables.add(idToken.lexeme);
      node.children.push({ type: 'Identifier', value: idToken.lexeme });
    } while (this.match(','));

    return node;
  }

  printStatement() {
    const node = { type: 'PrintStatement', children: [{ type: 'Terminal', value: 'PRINT' }] };
    
    // Simplification: We allow printing a variable or expression.
    const e = this.expression();
    node.children.push(e);
    
    return node;
  }

  assignmentStatement() {
    const idToken = this.consume('ID', 'Expected variable name in assignment');
    this.variables.add(idToken.lexeme);
    
    const node = { type: 'Assignment', children: [] };
    
    if (this.match('[')) {
      const indexExpr = this.expression();
      this.consume(']', "Expected ']' after array index");
      node.children.push({ type: 'ArrayIndex', children: [{ type: 'Identifier', value: idToken.lexeme }, indexExpr] });
    } else {
      node.children.push({ type: 'Identifier', value: idToken.lexeme });
    }
    
    this.consume('=', "Expected '=' in assignment");
    node.children.push({ type: 'Terminal', value: '=' });
    
    node.children.push(this.expression());
    
    return node;
  }

  switchStatement() {
    const node = { type: 'SwitchStatement', children: [{ type: 'Terminal', value: 'SWITCH' }] };
    
    const hasParen = this.match('(');
    node.children.push(this.expression());
    if (hasParen) {
      this.consume(')', "Expected ')' after switch expression");
    }
    
    node.children.push(this.cases());
    
    this.consume('ENDSWITCH', "Expected ENDSWITCH at end of switch");
    node.children.push({ type: 'Terminal', value: 'ENDSWITCH' });
    
    return node;
  }

  cases() {
    const node = { type: 'Cases', children: [] };
    while (this.check('CASE') || this.check('DEFAULT')) {
      if (this.check('CASE')) {
        node.children.push(this.caseItem());
      } else {
        node.children.push(this.defaultCaseItem());
      }
    }
    return node;
  }

  caseItem() {
    const node = { type: 'Case', children: [{ type: 'Terminal', value: 'CASE' }] };
    this.consume('CASE', 'Expected CASE');
    
    node.children.push(this.expression());
    this.consume(':', "Expected ':' after case expression");
    
    node.children.push(this.statements());
    
    if (this.match('BREAK')) {
      node.children.push({ type: 'Terminal', value: 'BREAK' });
    }
    
    return node;
  }

  defaultCaseItem() {
    const node = { type: 'DefaultCase', children: [{ type: 'Terminal', value: 'DEFAULT' }] };
    this.consume('DEFAULT', 'Expected DEFAULT');
    
    this.consume(':', "Expected ':' after default");
    node.children.push(this.statements());
    
    return node;
  }

  repeatStatement() {
    const node = { type: 'RepeatStatement', children: [{ type: 'Terminal', value: 'REPEAT' }] };
    node.children.push(this.statements());
    
    this.consume('UNTIL', "Expected UNTIL in REPEAT loop");
    node.children.push({ type: 'Terminal', value: 'UNTIL' });
    
    node.children.push(this.condition());
    return node;
  }

  functionStatement() {
    const node = { type: 'FunctionDeclaration', children: [{ type: 'Terminal', value: 'FUNCTION' }] };
    const idToken = this.consume('ID', "Expected function name");
    this.variables.add(idToken.lexeme);
    node.children.push({ type: 'Identifier', value: idToken.lexeme });
    
    this.consume('(', "Expected '(' after function name");
    
    const params = { type: 'Parameters', children: [] };
    if (!this.check(')')) {
      do {
        const paramToken = this.consume('ID', "Expected parameter name");
        this.variables.add(paramToken.lexeme);
        params.children.push({ type: 'Identifier', value: paramToken.lexeme });
      } while (this.match(','));
    }
    this.consume(')', "Expected ')' after parameters");
    node.children.push(params);
    
    node.children.push(this.statements());
    
    this.consume('ENDFUNCTION', "Expected ENDFUNCTION");
    node.children.push({ type: 'Terminal', value: 'ENDFUNCTION' });
    
    return node;
  }

  returnStatement() {
    const node = { type: 'ReturnStatement', children: [{ type: 'Terminal', value: 'RETURN' }] };
    node.children.push(this.expression());
    return node;
  }

  ifStatement() {
    const node = { type: 'IfStatement', children: [{ type: 'Terminal', value: 'IF' }] };
    
    node.children.push(this.condition());
    
    this.consume('THEN', "Expected THEN after condition");
    node.children.push({ type: 'Terminal', value: 'THEN' });
    
    node.children.push(this.statements());
    
    if (this.match('ELSE')) {
      node.children.push({ type: 'Terminal', value: 'ELSE' });
      node.children.push(this.statements());
    }
    
    this.consume('ENDIF', "Expected ENDIF");
    node.children.push({ type: 'Terminal', value: 'ENDIF' });
    
    return node;
  }

  forStatement() {
    const node = { type: 'ForStatement', children: [{ type: 'Terminal', value: 'FOR' }] };
    
    const idToken = this.consume('ID', "Expected loop variable in FOR");
    this.variables.add(idToken.lexeme);
    node.children.push({ type: 'Identifier', value: idToken.lexeme });
    
    this.consume('=', "Expected '=' in FOR statement");
    node.children.push({ type: 'Terminal', value: '=' });
    
    node.children.push(this.expression());
    
    this.consume('TO', "Expected TO in FOR statement");
    node.children.push({ type: 'Terminal', value: 'TO' });
    
    node.children.push(this.expression());
    
    node.children.push(this.statements());
    
    this.consume('ENDFOR', "Expected ENDFOR");
    node.children.push({ type: 'Terminal', value: 'ENDFOR' });
    
    return node;
  }

  whileStatement() {
    const node = { type: 'WhileStatement', children: [{ type: 'Terminal', value: 'WHILE' }] };
    
    node.children.push(this.condition());
    
    this.consume('DO', "Expected DO in WHILE statement");
    node.children.push({ type: 'Terminal', value: 'DO' });
    
    node.children.push(this.statements());
    
    this.consume('ENDWHILE', "Expected ENDWHILE");
    node.children.push({ type: 'Terminal', value: 'ENDWHILE' });
    
    return node;
  }

  condition() {
    const node = { type: 'Condition', children: [] };
    
    node.children.push(this.expression());
    
    if (this.match('==', '!=', '>', '<', '>=', '<=')) {
      node.children.push({ type: 'Operator', value: this.previous().lexeme });
      node.children.push(this.expression());
    } else {
      this.error("Expected relational operator in condition");
      throw new Error("Missing relational operator");
    }
    
    return node;
  }

  expression() {
    return this.term();
  }

  term() {
    let expr = this.factor();

    while (this.match('+', '-')) {
      const operator = this.previous();
      const right = this.factor();
      const node = { type: 'Expression', children: [expr, { type: 'Operator', value: operator.lexeme }, right] };
      expr = node;
    }

    return expr;
  }

  factor() {
    let expr = this.primary();

    while (this.match('*', '/')) {
      const operator = this.previous();
      const right = this.primary();
      const node = { type: 'Expression', children: [expr, { type: 'Operator', value: operator.lexeme }, right] };
      expr = node;
    }

    return expr;
  }

  primary() {
    if (this.match('STRING')) {
      return { type: 'String', value: this.previous().lexeme };
    }
    if (this.match('NUMBER')) {
      return { type: 'Number', value: this.previous().lexeme };
    }
    if (this.match('ID')) {
      const idToken = this.previous();
      if (this.match('(')) {
        const args = { type: 'Arguments', children: [] };
        if (!this.check(')')) {
          do {
            args.children.push(this.expression());
          } while (this.match(','));
        }
        this.consume(')', "Expected ')' after arguments");
        return { type: 'FunctionCall', children: [{ type: 'Identifier', value: idToken.lexeme }, args] };
      }
      if (this.match('[')) {
        const indexExpr = this.expression();
        this.consume(']', "Expected ']' after array index");
        return { type: 'ArrayIndex', children: [{ type: 'Identifier', value: idToken.lexeme }, indexExpr] };
      }
      return { type: 'Identifier', value: idToken.lexeme };
    }
    if (this.match('(')) {
      const expr = this.expression();
      this.consume(')', "Expected ')' after expression");
      return { type: 'Group', children: [expr] };
    }
    
    this.error("Expected expression (number, identifier, or '(')");
    throw new Error("Invalid expression");
  }
}

module.exports = Parser;

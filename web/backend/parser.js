class Parser {
  constructor(tokens) {
    this.tokens = tokens;
    this.current = 0;
    this.errors = [];
    this.tree = null;
    this.variables = new Set();
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
      variables: Array.from(this.variables)
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

  // program → START statements STOP
  program() {
    const node = { type: 'Program', children: [] };
    try {
      this.consume('START', 'Expected START at beginning of program');
      node.children.push({ type: 'Terminal', value: 'START' });

      node.children.push(this.statements());

      this.consume('STOP', 'Expected STOP at end of program');
      node.children.push({ type: 'Terminal', value: 'STOP' });
    } catch (e) {
      // Error already recorded
    }
    return node;
  }

  // statements → statement*
  statements() {
    const node = { type: 'Statements', children: [] };
    while (!this.check('STOP') && !this.check('EOF') && 
           !this.check('ENDIF') && !this.check('ELSE') && 
           !this.check('ENDFOR') && !this.check('ENDWHILE')) {
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

  // statement → READ idList | PRINT idExpr | ID = expr | IF... | FOR... | WHILE...
  statement() {
    if (this.match('READ')) return this.readStatement();
    if (this.match('PRINT')) return this.printStatement();
    if (this.match('IF')) return this.ifStatement();
    if (this.match('FOR')) return this.forStatement();
    if (this.match('WHILE')) return this.whileStatement();
    if (this.match('ID')) return this.assignmentStatement();
    
    this.error('Expected a valid statement (READ, PRINT, IF, FOR, WHILE, or assignment)');
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
    // In original it was PRINT ID, but let's allow an expression.
    const e = this.expression();
    node.children.push(e);
    
    return node;
  }

  assignmentStatement() {
    const idToken = this.previous();
    this.variables.add(idToken.lexeme);
    
    const node = { type: 'Assignment', children: [{ type: 'Identifier', value: idToken.lexeme }] };
    
    this.consume('=', "Expected '=' in assignment");
    node.children.push({ type: 'Terminal', value: '=' });
    
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
      return { type: 'Identifier', value: this.previous().lexeme };
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

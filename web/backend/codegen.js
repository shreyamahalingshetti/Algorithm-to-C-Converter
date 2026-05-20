class CodeGenerator {
  constructor(tree, variables, symbolTable) {
    this.tree = tree;
    this.variables = variables;
    this.symbolTable = symbolTable || {};
    this.output = '';
    this.indent = 0;
    this.errors = [];
  }

  getType(name) {
    return this.symbolTable[name] || 'int';
  }

  generate() {
    this.output = '';
    if (!this.tree || this.tree.type !== 'Program') {
      this.errors.push('Invalid parse tree root');
      return { code: '', errors: this.errors };
    }

    // Standard headers
    this.emitLine('#include <stdio.h>');
    this.emitLine('');

    // Process function declarations FIRST so they are defined before main()
    let funcDecls = [];
    if (this.tree.children) {
      const statementsNode = this.tree.children.find(c => c.type === 'Statements');
      
      if (statementsNode) {
        funcDecls = statementsNode.children.filter(c => c.type === 'FunctionDeclaration');
        // Remove FunctionDeclaration nodes from statements so they aren't generated inside main()
        statementsNode.children = statementsNode.children.filter(c => c.type !== 'FunctionDeclaration');
      }
    }

    // Output function definitions before main()
    for (const func of funcDecls) {
      this.visit(func);
      this.emitLine('');
    }

    this.emitLine('int main() {');
    this.indent++;

    // Declare variables
    if (this.variables && this.variables.length > 0) {
      const decls = [];
      const groupedVars = { int: [], float: [], char: [], string: [], double: [], long: [] };
      
      for (const v of this.variables) {
        // Skip function names from variable declarations
        if (funcDecls.some(f => f.children[1].value === v)) {
          continue;
        }
        
        // Skip function parameters from variable declarations
        let isParam = false;
        for (const func of funcDecls) {
          const paramsNode = func.children[2];
          if (paramsNode && paramsNode.children.some(p => p.value === v)) {
            isParam = true;
            break;
          }
        }
        if (isParam) {
          continue;
        }
        
        const type = this.getType(v);
        if (type.startsWith('array:')) {
          const size = type.split(':')[1];
          decls.push(`int ${v}[${size}]`);
        } else if (type === 'string') {
          decls.push(`char ${v}[100]`);
        } else {
          if (groupedVars[type]) {
            groupedVars[type].push(v);
          } else {
            // Default to int if unknown type
            groupedVars['int'].push(v);
          }
        }
      }
      
      for (const [type, vars] of Object.entries(groupedVars)) {
        if (vars.length > 0) {
          decls.push(`${type} ${vars.join(', ')}`);
        }
      }
      
      if (decls.length > 0) {
        for (const d of decls) {
          this.emitLine(`${d};`);
        }
        this.emitLine('');
      }
    }

    // Process children inside main()
    for (const child of this.tree.children) {
      this.visit(child);
    }

    this.indent--;
    this.emitLine('}');

    return { code: this.output, errors: this.errors };
  }

  emit(str) {
    this.output += str;
  }

  emitLine(str) {
    if (str.length > 0) {
      this.output += '    '.repeat(this.indent) + str;
    }
    this.output += '\n';
  }

  visit(node) {
    if (!node) return;

    switch (node.type) {
      case 'Statements':
        for (const stmt of node.children) {
          this.visit(stmt);
        }
        break;
        
      case 'Declarations':
      case 'Declaration':
      case 'ArrayDeclaration':
        // No-op since variable declarations are handled at the beginning of main()
        break;

      case 'ReadStatement':
        // children[0] is 'READ'
        for (let i = 1; i < node.children.length; i++) {
          const v = node.children[i];
          if (v.type === 'Identifier') {
            const type = this.getType(v.value);
            if (type === 'float') {
              this.emitLine(`scanf("%f", &${v.value});`);
            } else if (type === 'char') {
              this.emitLine(`scanf(" %c", &${v.value});`);
            } else if (type === 'string') {
              this.emitLine(`scanf("%s", ${v.value});`);
            } else if (type === 'double') {
              this.emitLine(`scanf("%lf", &${v.value});`);
            } else if (type === 'long') {
              this.emitLine(`scanf("%ld", &${v.value});`);
            } else {
              this.emitLine(`scanf("%d", &${v.value});`);
            }
          }
        }
        break;
        
      case 'PrintStatement':
        // children[0] is 'PRINT', children[1] is Expression or String
        const exprNode = node.children[1];
        if (exprNode && exprNode.type === 'String') {
          this.emitLine(`printf(${exprNode.value});`);
          this.emitLine(`printf("\\n");`);
        } else if (exprNode && exprNode.type === 'Identifier') {
          const type = this.getType(exprNode.value);
          if (type === 'float') {
            this.emitLine(`printf("%f\\n", ${exprNode.value});`);
          } else if (type === 'char') {
            this.emitLine(`printf("%c\\n", ${exprNode.value});`);
          } else if (type === 'string') {
            this.emitLine(`printf("%s\\n", ${exprNode.value});`);
          } else if (type === 'double') {
            this.emitLine(`printf("%lf\\n", ${exprNode.value});`);
          } else if (type === 'long') {
            this.emitLine(`printf("%ld\\n", ${exprNode.value});`);
          } else {
            this.emitLine(`printf("%d\\n", ${exprNode.value});`);
          }
        } else {
          this.emitLine(`printf("%d\\n", ${this.evaluateExpr(exprNode)});`);
        }
        break;
        
      case 'Assignment':
        // children[0] = id or ArrayIndex, children[1] = '=', children[2] = expr
        const lhsNode = node.children[0];
        let lhsCode = '';
        if (lhsNode.type === 'ArrayIndex') {
          const arrId = lhsNode.children[0].value;
          const idxCode = this.evaluateExpr(lhsNode.children[1]);
          lhsCode = `${arrId}[${idxCode}]`;
        } else {
          lhsCode = lhsNode.value;
        }
        const exprCode = this.evaluateExpr(node.children[2]);
        this.emitLine(`${lhsCode} = ${exprCode};`);
        break;
        
      case 'IfStatement':
        // children[0] = 'IF', [1] = condition, [2] = 'THEN', [3] = statements
        // [4] = 'ELSE' and [5] = statements (optional), then 'ENDIF'
        const condCode = this.evaluateCondition(node.children[1]);
        this.emitLine(`if (${condCode}) {`);
        this.indent++;
        this.visit(node.children[3]); // statements
        this.indent--;
        
        if (node.children.length > 5 && node.children[4].value === 'ELSE') {
          this.emitLine(`} else {`);
          this.indent++;
          this.visit(node.children[5]);
          this.indent--;
        }
        this.emitLine(`}`);
        break;
        
      case 'ForStatement':
        // [0] = 'FOR', [1] = id, [2] = '=', [3] = expr, [4] = 'TO', [5] = expr
        // [6] = statements, [7] = 'ENDFOR'
        const loopVar = node.children[1].value;
        const startCode = this.evaluateExpr(node.children[3]);
        const endCode = this.evaluateExpr(node.children[5]);
        
        this.emitLine(`for (${loopVar} = ${startCode}; ${loopVar} <= ${endCode}; ${loopVar}++) {`);
        this.indent++;
        this.visit(node.children[6]);
        this.indent--;
        this.emitLine(`}`);
        break;
        
      case 'WhileStatement':
        // [0] = 'WHILE', [1] = condition, [2] = 'DO', [3] = statements, [4] = 'ENDWHILE'
        const whileCond = this.evaluateCondition(node.children[1]);
        this.emitLine(`while (${whileCond}) {`);
        this.indent++;
        this.visit(node.children[3]);
        this.indent--;
        this.emitLine(`}`);
        break;

      case 'SwitchStatement':
        // [0] = 'SWITCH', [1] = expression, [2] = cases, [3] = 'ENDSWITCH'
        const swExpr = this.evaluateExpr(node.children[1]);
        this.emitLine(`switch (${swExpr}) {`);
        this.indent++;
        this.visit(node.children[2]); // cases
        this.indent--;
        this.emitLine(`}`);
        break;

      case 'Cases':
        for (const item of node.children) {
          this.visit(item);
        }
        break;

      case 'Case':
        // [0] = 'CASE', [1] = expression, [2] = statements, [3] = 'BREAK' (optional)
        const caseVal = this.evaluateExpr(node.children[1]);
        this.emitLine(`case ${caseVal}:`);
        this.indent++;
        this.visit(node.children[2]);
        if (node.children.length > 3 && node.children[3].value === 'BREAK') {
          this.emitLine('break;');
        }
        this.indent--;
        break;

      case 'DefaultCase':
        // [0] = 'DEFAULT', [1] = statements
        this.emitLine('default:');
        this.indent++;
        this.visit(node.children[1]);
        this.indent--;
        break;

      case 'RepeatStatement':
        // [0] = 'REPEAT', [1] = statements, [2] = 'UNTIL', [3] = condition
        this.emitLine('do {');
        this.indent++;
        this.visit(node.children[1]);
        this.indent--;
        const untilCond = this.evaluateCondition(node.children[3]);
        this.emitLine(`} while (!(${untilCond}));`);
        break;

      case 'FunctionDeclaration':
        // [0] = 'FUNCTION', [1] = id, [2] = parameters, [3] = statements, [4] = 'ENDFUNCTION'
        const funcName = node.children[1].value;
        const paramsNode = node.children[2];
        const funcStmts = node.children[3];
        
        const paramList = [];
        for (const param of paramsNode.children) {
          const pType = this.getType(param.value);
          paramList.push(`${pType} ${param.value}`);
        }
        
        this.emitLine(`int ${funcName}(${paramList.join(', ')}) {`);
        this.indent++;
        this.visit(funcStmts);
        this.indent--;
        this.emitLine(`}`);
        break;

      case 'ReturnStatement':
        // [0] = 'RETURN', [1] = expression
        const retExpr = this.evaluateExpr(node.children[1]);
        this.emitLine(`return ${retExpr};`);
        break;
        
      case 'Terminal':
      case 'EOF':
        if (node.value === 'STOP' || node.value === 'END') {
          this.emitLine('return 0;');
        }
        break;
        
      default:
        break;
    }
  }

  evaluateCondition(node) {
    if (!node || node.type !== 'Condition') return '1';
    const left = this.evaluateExpr(node.children[0]);
    const op = node.children[1].value;
    const right = this.evaluateExpr(node.children[2]);
    return `${left} ${op} ${right}`;
  }

  evaluateExpr(node) {
    if (!node) return '';
    
    if (node.type === 'Number' || node.type === 'Identifier' || node.type === 'String') {
      return node.value;
    }

    if (node.type === 'FunctionCall') {
      const funcId = node.children[0].value;
      const argsNode = node.children[1];
      const argCodes = argsNode.children.map(a => this.evaluateExpr(a));
      return `${funcId}(${argCodes.join(', ')})`;
    }

    if (node.type === 'ArrayIndex') {
      const arrId = node.children[0].value;
      const idxCode = this.evaluateExpr(node.children[1]);
      return `${arrId}[${idxCode}]`;
    }
    
    if (node.type === 'Expression') {
      const left = this.evaluateExpr(node.children[0]);
      const op = node.children[1].value;
      const right = this.evaluateExpr(node.children[2]);
      return `${left} ${op} ${right}`;
    }
    
    if (node.type === 'Group') {
      return `(${this.evaluateExpr(node.children[0])})`;
    }
    
    return '';
  }
}

module.exports = CodeGenerator;

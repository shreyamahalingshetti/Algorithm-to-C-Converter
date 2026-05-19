class CodeGenerator {
  constructor(tree, variables) {
    this.tree = tree;
    this.variables = variables;
    this.output = '';
    this.indent = 0;
    this.errors = [];
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
    this.emitLine('int main() {');
    this.indent++;

    // Declare variables
    if (this.variables && this.variables.length > 0) {
      this.emitLine(`int ${this.variables.join(', ')};`);
      this.emitLine('');
    }

    // Process children
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
        
      case 'ReadStatement':
        // children[0] is 'READ'
        for (let i = 1; i < node.children.length; i++) {
          const v = node.children[i];
          if (v.type === 'Identifier') {
            this.emitLine(`scanf("%d", &${v.value});`);
          }
        }
        break;
        
      case 'PrintStatement':
        // children[0] is 'PRINT', children[1] is Expression or String
        const exprNode = node.children[1];
        if (exprNode && exprNode.type === 'String') {
          this.emitLine(`printf(${exprNode.value});`);
          this.emitLine(`printf("\\n");`);
        } else {
          this.emitLine(`printf("%d\\n", ${this.evaluateExpr(exprNode)});`);
        }
        break;
        
      case 'Assignment':
        // children[0] = id, children[1] = '=', children[2] = expr
        const id = node.children[0].value;
        const exprCode = this.evaluateExpr(node.children[2]);
        this.emitLine(`${id} = ${exprCode};`);
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
        
      case 'Terminal':
      case 'EOF':
        // Handled by parent nodes usually
        if (node.value === 'STOP') {
          this.emitLine('return 0;');
        }
        break;
        
      default:
        // Expression nodes handled in evaluateExpr
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

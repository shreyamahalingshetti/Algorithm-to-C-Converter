const Lexer = require('./lexer');
const Parser = require('./parser');
const CodeGenerator = require('./codegen');

const testCases = [
  {
    name: 'Multiple Datatypes and Custom Scanf/Printf',
    code: `START
INT a
FLOAT b
CHAR c
STRING name
DOUBLE d
LONG l
READ a, b, c, name, d, l
PRINT name
PRINT a
PRINT d
PRINT l
STOP`
  },
  {
    name: 'Switch-Case Block',
    code: `START
INT choice
choice = 2
SWITCH(choice)
CASE 1:
  PRINT "One"
  BREAK
CASE 2:
  PRINT "Two"
  BREAK
DEFAULT:
  PRINT "Invalid"
ENDSWITCH
STOP`
  },
  {
    name: 'Array Indexing and Assignments',
    code: `START
ARRAY arr[5]
arr[0] = 10
arr[1] = 20
x = arr[0] + arr[1]
PRINT x
STOP`
  },
  {
    name: 'Repeat-Until Loop',
    code: `START
INT i
i = 0
REPEAT
  PRINT i
  i = i + 1
UNTIL i == 5
STOP`
  },
  {
    name: 'Functions and Return Statements',
    code: `START
FUNCTION add(a, b)
  RETURN a + b
ENDFUNCTION
x = add(3, 4)
PRINT x
STOP`
  }
];

testCases.forEach((tc) => {
  console.log('='.repeat(50));
  console.log(`TEST CASE: ${tc.name}`);
  console.log('='.repeat(50));
  
  const lexer = new Lexer();
  const lexResult = lexer.tokenize(tc.code);
  
  if (lexResult.errors.length > 0) {
    console.error('Lexical errors:', lexResult.errors);
    return;
  }
  
  const parser = new Parser(lexResult.tokens);
  const parseResult = parser.parse();
  
  if (!parseResult.valid) {
    console.error('Syntax errors:', parseResult.errors);
    return;
  }
  
  console.log('Symbol Table:', parseResult.symbolTable);
  
  const codegen = new CodeGenerator(parseResult.tree, parseResult.variables, parseResult.symbolTable);
  const cResult = codegen.generate();
  
  console.log('Generated C Code:');
  console.log(cResult.code);
});

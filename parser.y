%{
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

void yyerror(const char *s);
int yylex();

%}

%union {
    char* str;
}

%token START STOP READ PRINT
%token <str> ID NUMBER

%type <str> expr

%%

program:
    START
    {
        printf("#include <stdio.h>\n\n");
        printf("int main() {\n");
    }
    statements
    STOP
    {
        printf("\nreturn 0;\n}");
    }
;

statements:
      statements statement
    | statement
;

statement:

      READ ID
      {
          printf("int %s;\n", $2);
          printf("scanf(\"%%d\", &%s);\n", $2);
      }

    | PRINT ID
      {
          printf("printf(\"%%d\", %s);\n", $2);
      }

    | ID '=' expr
      {
          printf("int %s;\n", $1);
          printf("%s = %s;\n", $1, $3);
      }
;

expr:

      ID
      {
          $$ = $1;
      }

    | NUMBER
      {
          $$ = $1;
      }

    | ID '+' ID
      {
          char *temp = malloc(100);
          sprintf(temp, "%s + %s", $1, $3);
          $$ = temp;
      }
;

%%

void yyerror(const char *s) {
    printf("Syntax Error\n");
}

int main() {
    yyparse();
    return 0;
}
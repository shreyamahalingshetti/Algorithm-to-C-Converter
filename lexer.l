%{
#include "y.tab.h"
#include <stdio.h>
#include <string.h>
#include <stdlib.h>
%}

%%

START      { return START; }
STOP       { return STOP; }
READ       { return READ; }
PRINT      { return PRINT; }

[a-zA-Z][a-zA-Z0-9]* {
    yylval.str = strdup(yytext);
    return ID;
}

[0-9]+ {
    yylval.str = strdup(yytext);
    return NUMBER;
}

"="        { return '='; }
"+"        { return '+'; }

[ \t\r\n]+ ;

.          { return yytext[0]; }

%%

int yywrap() {
    return 1;
}
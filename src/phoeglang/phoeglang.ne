
@builtin "whitespace.ne" # `_` means arbitrary amount of whitespace
@builtin "number.ne"     # `int`, `decimal`, and `percentage` number primitives
@builtin "string.ne"     # `dqstring` and `sqstring` primitives

main -> statement {% id %}

statement -> condition                          {% id %}

operation -> condition # for !, AND, XOR etc

condition -> expression                         {% id %}
           | expression _ "<" _ expression
           | expression _ "<=" _ expression
           | expression _ ">" _ expression
           | expression _ ">=" _ expression
           | expression _ "==" _ expression
           | expression _ "!=" _ expression



expression -> arithmetic_expression             {% id %}
            | "MAX(" _ expression _ ")"         {% (d) => "GREATEST(" + d[2] + ")" %}
            | "MIN(" _ expression _ ")"         {% (d) => "LEAST(" + d[2] + ")" %}
            | "SUM(" _ expression _ ")"         {% (d) => "SUM(" + d[2] + ")" %}
            | "AVG(" _ expression _ ")"         {% (d) => "AVG(" + d[2] + ")" %}
            | "MEAN(" _ expression _ ")"        {% (d) => "MEAN(" + d[2] + ")" %}
            | "VAR(" _ expression _ ")"         {% (d) => "VAR(" + d[2] + ")" %}
            | "FLOOR(" _ term _ ")"             {% (d) => "FLOOR(" + d[2] + ")" %}
            | "CEIL(" _ term _ ")"              {% (d) => "CEIL(" + d[2] + ")" %}
            | "ROUND(" _ term _ ")"             {% (d) => "ROUND(" + d[2] + ")" %}

arithmetic_expression -> terms_list             {% id %}    
                       | term                   {% id %}

terms_list -> terms_list _ "," _ term           {% (d) => [...d[0], d[4]] %}
            | term                              {% (d) => [d[0]] %}

term -> term _ "+" _ factor                     {% (d) => d[0] + d[4] %}
      | term _ "-" _ factor                     {% (d) => d[0] - d[4] %}
      | factor                                  {% id %}

factor -> factor _ "*" _ power                  {% (d) => d[0] * d[4] %}
        | factor _ "/" _ power                  {% (d) => d[0] / d[4] %}
        | factor _ "%" _ power                  {% (d) => d[0] % d[4] %}
        | factor _ "mod" _ power                {% (d) => d[0] % d[4] %}
        | power                                 {% id %}

power -> power _ "^" _ NUMBER                   {% (d) => Math.pow(d[0], d[4]) %}
       | NUMBER                                 {% id %}

NUMBER -> "-" _ NUMBER                          {% (d) => -d[2] %}
        | int                                   {% id %}

INVARIANT -> dqstring                           {% id %}


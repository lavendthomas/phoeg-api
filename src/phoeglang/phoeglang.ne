@preprocessor typescript

@builtin "whitespace.ne" # `_` means arbitrary amount of whitespace
@builtin "number.ne"     # `int`, `decimal`, and `percentage` number primitives
@builtin "string.ne"     # `dqstring` and `sqstring` primitives

@{%
import { Data } from "dataclass";

let temp_table = 0;             // Increased for each temporary table.

export class PhoegLangResult extends Data {
        constraints: string = ""
        query_params: number[] = []
        invariants: string[] = []
}
%}

main -> statement {% id %}

statement -> disjonction                                {% (d) => "SELECT " + d[0] + ";" %}

disjonction -> exclusion                                {% id %}
           | disjonction _ ("OR"|"||") _ exclusion      {% (d) => d[0] + " OR " + d[4] %}

exclusion -> conjonction                                {% id %}
          | exclusion "XOR" conjonction                 {% (d) => d[0] + " XOR " + d[4] %}


conjonction -> negation                                 {% id %}
             | conjonction _ ("AND"|"&&") _ negation    {% (d) => d[0] + " AND " + d[4] %}

negation -> condition                                   {% id %}
          | ("NOT"|"!") _ condition                     {% (d) => "NOT " + d[2] %}


condition -> expression                         {% id %}
           | condition _ "<" _ expression       {% (d) => d[0] + "<"  + d[4] %}
           | condition _ "<=" _ expression      {% (d) => d[0] + "<=" + d[4] %}
           | condition _ ">" _ expression       {% (d) => d[0] + ">"  + d[4] %}
           | condition _ ">=" _ expression      {% (d) => d[0] + "<=" + d[4] %}
           | condition _ "==" _ expression      {% (d) => d[0] + "="  + d[4] %}
           | condition _ "!=" _ expression      {% (d) => d[0] + "<>" + d[4] %}



expression -> arithmetic_expression                     {% id %}
            | "MAX(" _ arithmetic_expression _ ")"      {% (d) => "GREATEST(" + d[2] + ")" %}
            | "MIN(" _ arithmetic_expression _ ")"      {% (d) => "LEAST(" + d[2] + ")" %}
            | "SUM(" _ arithmetic_expression _ ")"      {% (d) => "SUM(" + d[2] + ")" %}
            | "AVG(" _ arithmetic_expression _ ")"      {% (d) => "AVG(" + d[2] + ")" %}
            | "MEAN(" _ arithmetic_expression _ ")"     {% (d) => "MEAN(" + d[2] + ")" %}
            | "VAR(" _ arithmetic_expression _ ")"      {% (d) => "VAR(" + d[2] + ")" %}
            | "FLOOR(" _ term _ ")"                     {% (d) => "FLOOR(" + d[2] + ")" %}
            | "CEIL(" _ term _ ")"                      {% (d) => "CEIL(" + d[2] + ")" %}
            | "ROUND(" _ term _ ")"                     {% (d) => "ROUND(" + d[2] + ")" %}

#arithmetic_expression -> terms_list             {% (d) => `WITH phoeglang_tmp_${temp_table++} AS ()` %} 
arithmetic_expression -> terms_list             {% id %}

terms_list -> terms_list _ "," _ term           {% (d) => [...d[0], d[4]] %}
            | term                              {% (d) => [d[0]] %}

term -> term _ "+" _ factor                     {% (d) => d[0] + "+" + d[4] %}
      | term _ "-" _ factor                     {% (d) => d[0] + "-" + d[4] %}
      | factor                                  {% id %}

factor -> factor _ "*" _ power                  {% (d) => d[0] + "*" + d[4] %}
        | factor _ "/" _ power                  {% (d) => d[0] + "/" + d[4] %}
        | factor _ "%" _ power                  {% (d) => d[0] + "%" + d[4] %}
        | factor _ "mod" _ power                {% (d) => d[0] + "%" + d[4] %}
        | power                                 {% id %}

power -> power _ "^" _ NUMBER                   {% (d) => d[0] + "^" + d[4] %}
       | NUMBER                                 {% id %}

NUMBER -> decimal                               {% (d) => d[0].toString() %}
        | INVARIANT                             {% (d) => d[0].toString() + ".val" %}

INVARIANT -> dqstring | sqstring                {% id %}


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

main -> statement                                       {% id %}

statement -> disjonction                                {% (d) => PhoegLangResult.create({constraints: d[0]}) %}

disjonction -> exclusion                                {% id %}
           | disjonction _ ("OR"|"||") _ exclusion      {% (d) => "(" + d[0] + ")" + " OR " + "(" + d[4] + ")" %}

exclusion -> conjonction                                {% id %}
          | exclusion "XOR" conjonction                 {% (d) => "(" + d[0] + ")" + " XOR " + "(" + d[4] + ")" %}


conjonction -> negation                                 {% id %}
             | conjonction _ ("AND"|"&&") _ negation    {% (d) => "(" + d[0] + ")" + " AND " + "(" + d[4] + ")" %}

negation -> condition                                   {% id %}
          | ("NOT"|"!") _ condition                     {% (d) => "NOT (" + d[2] + ")" %}
          | ("NOT"|"!") _ "(" _ condition _ ")"         {% (d) => "NOT (" + d[4] + ")" %}


condition -> expression                                 {% id %}
           | condition _ "<" _ expression               {% (d) => "(" + d[0] + ")" + "<"  + "(" + d[4] + ")" %}
           | condition _ "<=" _ expression              {% (d) => "(" + d[0] + ")" + "<=" + "(" + d[4] + ")" %}
           | condition _ ">" _ expression               {% (d) => "(" + d[0] + ")" + ">"  + "(" + d[4] + ")" %}
           | condition _ ">=" _ expression              {% (d) => "(" + d[0] + ")" + ">=" + "(" + d[4] + ")" %}
           | condition _ ("="|"==") _ expression        {% (d) => "(" + d[0] + ")" + "="  + "(" + d[4] + ")" %}
           | condition _ ("!="|"<>") _ expression       {% (d) => "(" + d[0] + ")" + "<>" + "(" + d[4] + ")" %}

parenthesed_expression -> "(" _ expression _ ")"        {% (d) => "(" + d[2] + ")" %}

expression -> term                                      {% id %}
            | "MAX" _ parenthesed_term_list             {% (d) => "GREATEST" + d[2] %}
            | "MIN" _ parenthesed_term_list             {% (d) => "LEAST" + d[2] %}
            | "SUM" _ parenthesed_term_list             {% (d) => "SUM" + d[2] %}
            | "AVG" _ parenthesed_term_list             {% (d) => "AVG" + d[2] %}
            | "MEAN" _ parenthesed_term_list            {% (d) => "MEAN" + d[2] %}
            | "FLOOR" _ parenthesed_term                {% (d) => "FLOOR" + d[2] %}
            | "CEIL" _ parenthesed_term                 {% (d) => "CEIL" + d[2] %}
            | "ROUND" _ parenthesed_term                {% (d) => "ROUND" + d[2] %}

parenthesed_term -> "(" _ term _ ")"                    {% (d) => "(" + d[2] + ")" %}

parenthesed_term_list -> "(" _ term_list _ ")"          {% (d) => "(" + d[2] + ")" %}

term_list -> term                                       {% id %}
          | term_list _ "," _ term                      {% (d) => d[0] + ", " + d[4] %}

arithmetic_expression -> term                           {% id %}

term -> term _ "+" _ factor                             {% (d) => d[0] + "+" + d[4] %}
      | term _ "-" _ factor                             {% (d) => d[0] + "-" + d[4] %}
      | factor                                          {% id %}

factor -> factor _ "*" _ power                          {% (d) => d[0] + "*" + d[4] %}
        | factor _ "/" _ power                          {% (d) => d[0] + "/" + d[4] %}
        | factor _ "%" _ power                          {% (d) => d[0] + "%" + d[4] %}
        | factor _ "mod" _ power                        {% (d) => d[0] + "%" + d[4] %}
        | power                                         {% id %}

power -> power _ "^" _ number                           {% (d) => d[0] + "^" + d[4] %}
       | number                                         {% id %}

number -> decimal                                       {% (d) => d[0].toString() %}
        | invariant                                     {% (d) => d[0].toString() + ".val" %}# {% (d) => PhoegLangResult.create({constraints: d[0].toString() + ".val", invariants: [d[0].toString()]}) %}
        | parenthesed_expression                        {% id %}

invariant -> dqstring | sqstring                        {% id %}


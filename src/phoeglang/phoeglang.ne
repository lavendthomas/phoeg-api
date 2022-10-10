@preprocessor typescript

@builtin "whitespace.ne" # `_` means arbitrary amount of whitespace
@builtin "number.ne"     # `int`, `decimal`, and `percentage` number primitives
@builtin "string.ne"     # `dqstring` and `sqstring` primitives

@{%
import { Data } from "dataclass";

let temp_table = 0;             // Increased for each temporary table.

export class PhoegLangResult extends Data {
        constraints: string = ""
        invariants: string[] = []

        merge(other: PhoegLangResult, constraints: string): PhoegLangResult {
                return PhoegLangResult.create({
                        constraints: constraints,
                        invariants: this.invariants.concat(other.invariants)
                });
        }

        toString(): string {
                return this.constraints;
        }
}
%}

main -> statement                                       {% id %}

statement -> disjonction                                {% id %}

disjonction -> exclusion                                {% id %}
           | disjonction _ ("OR"|"||") _ exclusion      {% (d) => d[0].merge(d[4], `(${d[0]}) OR (${d[4]})`) %}

exclusion -> conjonction                                {% id %}
          | exclusion "XOR" conjonction                 {% (d) => d[0].merge(d[4], `(${d[0]}) XOR (${d[4]})`) %}


conjonction -> negation                                 {% id %}
             | conjonction _ ("AND"|"&&") _ negation    {% (d) => d[0].merge(d[4], `(${d[0]}) AND (${d[4]})`) %}

negation -> condition                                   {% id %}
          | ("NOT"|"!") _ condition                     {% (d) => d[2].copy({constraints: `NOT (${d[2]})`}) %}
          | ("NOT"|"!") _ "(" _ condition _ ")"         {% (d) => d[4].copy({constraints: `NOT (${d[4]})`}) %}


condition -> expression                                 {% id %}
           | condition _ "<" _ expression               {% (d) => d[0].merge(d[4], `(${d[0]}) <  (${d[4]})`) %}
           | condition _ "<=" _ expression              {% (d) => d[0].merge(d[4], `(${d[0]}) <= (${d[4]})`) %}
           | condition _ ">" _ expression               {% (d) => d[0].merge(d[4], `(${d[0]}) >  (${d[4]})`) %}
           | condition _ ">=" _ expression              {% (d) => d[0].merge(d[4], `(${d[0]}) >= (${d[4]})`) %}
           | condition _ ("="|"==") _ expression        {% (d) => d[0].merge(d[4], `(${d[0]}) =  (${d[4]})`) %}
           | condition _ ("!="|"<>") _ expression       {% (d) => d[0].merge(d[4], `(${d[0]}) <> (${d[4]})`) %}

parenthesed_expression -> "(" _ expression _ ")"        {% (d) => d[2].copy({constraints: `(${d[2]})`}) %}

expression -> term                                      {% id %}
            | "MAX" _ parenthesed_term_list             {% (d) => d[2].copy({constraints: `GREATEST ${d[2]}`}) %}
            | "MIN" _ parenthesed_term_list             {% (d) => d[2].copy({constraints: `LEAST ${d[2]}`}) %}
            | "SUM" _ parenthesed_term_list             {% (d) => d[2].copy({constraints: `SUM ${d[2]}`}) %}
            | "AVG" _ parenthesed_term_list             {% (d) => d[2].copy({constraints: `AVG ${d[2]}`}) %}
            | "MEAN" _ parenthesed_term_list            {% (d) => d[2].copy({constraints: `MEAN ${d[2]}`}) %}
            | "FLOOR" _ parenthesed_term                {% (d) => d[2].copy({constraints: `FLOOR ${d[2]}`}) %}
            | "CEIL" _ parenthesed_term                 {% (d) => d[2].copy({constraints: `CEIL ${d[2]}`}) %}
            | "ROUND" _ parenthesed_term                {% (d) => d[2].copy({constraints: `ROUND ${d[2]}`}) %}

parenthesed_term -> "(" _ term _ ")"                    {% (d) =>  d[2].copy({constraints: `(${d[2]})`}) %}

parenthesed_term_list -> "(" _ term_list _ ")"          {% (d) => d[2].copy({constraints: `(${d[2]})`}) %}

term_list -> term                                       {% id %}
          | term_list _ "," _ term                      {% (d) => d[0].merge(d[4], `${d[0]}, ${d[4]}`) %}

arithmetic_expression -> term                           {% id %}

term -> term _ "+" _ factor                             {% (d) => d[0].merge(d[4], `${d[0]} + ${d[4]}`) %}
      | term _ "-" _ factor                             {% (d) => d[0].merge(d[4], `${d[0]} - ${d[4]}`) %}
      | factor                                          {% id %}

factor -> factor _ "*" _ power                          {% (d) => d[0].merge(d[4], `${d[0]} * ${d[4]}`) %}
        | factor _ "/" _ power                          {% (d) => d[0].merge(d[4], `${d[0]} / ${d[4]}`) %}
        | factor _ "%" _ power                          {% (d) => d[0].merge(d[4], `${d[0]} % ${d[4]}`) %}
        | factor _ "mod" _ power                        {% (d) => d[0].merge(d[4], `${d[0]} % ${d[4]}`) %}
        | power                                         {% id %}

power -> power _ "^" _ number                           {% (d) => d[0].merge(d[4], `${d[0]} ^ ${d[4]}`) %}
       | number                                         {% id %}

number -> decimal                                       {% (d) => PhoegLangResult.create({constraints: `${d[0]}`}) %}
        | invariant                                     {% (d) => PhoegLangResult.create({
                                                                        constraints: `${d[0]}.val`, 
                                                                        invariants: [`${d[0]}`]}) %}
        | parenthesed_expression                        {% id %}

invariant -> invariant_char:+                           {% (d) => d[0].join("") %}

invariant_char -> [_a-z]                                {% id %}


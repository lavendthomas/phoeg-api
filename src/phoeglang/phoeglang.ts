// Generated automatically by nearley, version 2.20.1
// http://github.com/Hardmath123/nearley
// Bypasses TS6133. Allow declared but unused functions.
// @ts-ignore
function id(d: any[]): any { return d[0]; }

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

interface NearleyToken {
  value: any;
  [key: string]: any;
};

interface NearleyLexer {
  reset: (chunk: string, info: any) => void;
  next: () => NearleyToken | undefined;
  save: () => any;
  formatError: (token: never) => string;
  has: (tokenType: string) => boolean;
};

interface NearleyRule {
  name: string;
  symbols: NearleySymbol[];
  postprocess?: (d: any[], loc?: number, reject?: {}) => any;
};

type NearleySymbol = string | { literal: any } | { test: (token: any) => boolean };

interface Grammar {
  Lexer: NearleyLexer | undefined;
  ParserRules: NearleyRule[];
  ParserStart: string;
};

const grammar: Grammar = {
  Lexer: undefined,
  ParserRules: [
    {"name": "_$ebnf$1", "symbols": []},
    {"name": "_$ebnf$1", "symbols": ["_$ebnf$1", "wschar"], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "_", "symbols": ["_$ebnf$1"], "postprocess": function(d) {return null;}},
    {"name": "__$ebnf$1", "symbols": ["wschar"]},
    {"name": "__$ebnf$1", "symbols": ["__$ebnf$1", "wschar"], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "__", "symbols": ["__$ebnf$1"], "postprocess": function(d) {return null;}},
    {"name": "wschar", "symbols": [/[ \t\n\v\f]/], "postprocess": id},
    {"name": "unsigned_int$ebnf$1", "symbols": [/[0-9]/]},
    {"name": "unsigned_int$ebnf$1", "symbols": ["unsigned_int$ebnf$1", /[0-9]/], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "unsigned_int", "symbols": ["unsigned_int$ebnf$1"], "postprocess": 
        function(d) {
            return parseInt(d[0].join(""));
        }
        },
    {"name": "int$ebnf$1$subexpression$1", "symbols": [{"literal":"-"}]},
    {"name": "int$ebnf$1$subexpression$1", "symbols": [{"literal":"+"}]},
    {"name": "int$ebnf$1", "symbols": ["int$ebnf$1$subexpression$1"], "postprocess": id},
    {"name": "int$ebnf$1", "symbols": [], "postprocess": () => null},
    {"name": "int$ebnf$2", "symbols": [/[0-9]/]},
    {"name": "int$ebnf$2", "symbols": ["int$ebnf$2", /[0-9]/], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "int", "symbols": ["int$ebnf$1", "int$ebnf$2"], "postprocess": 
        function(d) {
            if (d[0]) {
                return parseInt(d[0][0]+d[1].join(""));
            } else {
                return parseInt(d[1].join(""));
            }
        }
        },
    {"name": "unsigned_decimal$ebnf$1", "symbols": [/[0-9]/]},
    {"name": "unsigned_decimal$ebnf$1", "symbols": ["unsigned_decimal$ebnf$1", /[0-9]/], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "unsigned_decimal$ebnf$2$subexpression$1$ebnf$1", "symbols": [/[0-9]/]},
    {"name": "unsigned_decimal$ebnf$2$subexpression$1$ebnf$1", "symbols": ["unsigned_decimal$ebnf$2$subexpression$1$ebnf$1", /[0-9]/], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "unsigned_decimal$ebnf$2$subexpression$1", "symbols": [{"literal":"."}, "unsigned_decimal$ebnf$2$subexpression$1$ebnf$1"]},
    {"name": "unsigned_decimal$ebnf$2", "symbols": ["unsigned_decimal$ebnf$2$subexpression$1"], "postprocess": id},
    {"name": "unsigned_decimal$ebnf$2", "symbols": [], "postprocess": () => null},
    {"name": "unsigned_decimal", "symbols": ["unsigned_decimal$ebnf$1", "unsigned_decimal$ebnf$2"], "postprocess": 
        function(d) {
            return parseFloat(
                d[0].join("") +
                (d[1] ? "."+d[1][1].join("") : "")
            );
        }
        },
    {"name": "decimal$ebnf$1", "symbols": [{"literal":"-"}], "postprocess": id},
    {"name": "decimal$ebnf$1", "symbols": [], "postprocess": () => null},
    {"name": "decimal$ebnf$2", "symbols": [/[0-9]/]},
    {"name": "decimal$ebnf$2", "symbols": ["decimal$ebnf$2", /[0-9]/], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "decimal$ebnf$3$subexpression$1$ebnf$1", "symbols": [/[0-9]/]},
    {"name": "decimal$ebnf$3$subexpression$1$ebnf$1", "symbols": ["decimal$ebnf$3$subexpression$1$ebnf$1", /[0-9]/], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "decimal$ebnf$3$subexpression$1", "symbols": [{"literal":"."}, "decimal$ebnf$3$subexpression$1$ebnf$1"]},
    {"name": "decimal$ebnf$3", "symbols": ["decimal$ebnf$3$subexpression$1"], "postprocess": id},
    {"name": "decimal$ebnf$3", "symbols": [], "postprocess": () => null},
    {"name": "decimal", "symbols": ["decimal$ebnf$1", "decimal$ebnf$2", "decimal$ebnf$3"], "postprocess": 
        function(d) {
            return parseFloat(
                (d[0] || "") +
                d[1].join("") +
                (d[2] ? "."+d[2][1].join("") : "")
            );
        }
        },
    {"name": "percentage", "symbols": ["decimal", {"literal":"%"}], "postprocess": 
        function(d) {
            return d[0]/100;
        }
        },
    {"name": "jsonfloat$ebnf$1", "symbols": [{"literal":"-"}], "postprocess": id},
    {"name": "jsonfloat$ebnf$1", "symbols": [], "postprocess": () => null},
    {"name": "jsonfloat$ebnf$2", "symbols": [/[0-9]/]},
    {"name": "jsonfloat$ebnf$2", "symbols": ["jsonfloat$ebnf$2", /[0-9]/], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "jsonfloat$ebnf$3$subexpression$1$ebnf$1", "symbols": [/[0-9]/]},
    {"name": "jsonfloat$ebnf$3$subexpression$1$ebnf$1", "symbols": ["jsonfloat$ebnf$3$subexpression$1$ebnf$1", /[0-9]/], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "jsonfloat$ebnf$3$subexpression$1", "symbols": [{"literal":"."}, "jsonfloat$ebnf$3$subexpression$1$ebnf$1"]},
    {"name": "jsonfloat$ebnf$3", "symbols": ["jsonfloat$ebnf$3$subexpression$1"], "postprocess": id},
    {"name": "jsonfloat$ebnf$3", "symbols": [], "postprocess": () => null},
    {"name": "jsonfloat$ebnf$4$subexpression$1$ebnf$1", "symbols": [/[+-]/], "postprocess": id},
    {"name": "jsonfloat$ebnf$4$subexpression$1$ebnf$1", "symbols": [], "postprocess": () => null},
    {"name": "jsonfloat$ebnf$4$subexpression$1$ebnf$2", "symbols": [/[0-9]/]},
    {"name": "jsonfloat$ebnf$4$subexpression$1$ebnf$2", "symbols": ["jsonfloat$ebnf$4$subexpression$1$ebnf$2", /[0-9]/], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "jsonfloat$ebnf$4$subexpression$1", "symbols": [/[eE]/, "jsonfloat$ebnf$4$subexpression$1$ebnf$1", "jsonfloat$ebnf$4$subexpression$1$ebnf$2"]},
    {"name": "jsonfloat$ebnf$4", "symbols": ["jsonfloat$ebnf$4$subexpression$1"], "postprocess": id},
    {"name": "jsonfloat$ebnf$4", "symbols": [], "postprocess": () => null},
    {"name": "jsonfloat", "symbols": ["jsonfloat$ebnf$1", "jsonfloat$ebnf$2", "jsonfloat$ebnf$3", "jsonfloat$ebnf$4"], "postprocess": 
        function(d) {
            return parseFloat(
                (d[0] || "") +
                d[1].join("") +
                (d[2] ? "."+d[2][1].join("") : "") +
                (d[3] ? "e" + (d[3][1] || "+") + d[3][2].join("") : "")
            );
        }
        },
    {"name": "dqstring$ebnf$1", "symbols": []},
    {"name": "dqstring$ebnf$1", "symbols": ["dqstring$ebnf$1", "dstrchar"], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "dqstring", "symbols": [{"literal":"\""}, "dqstring$ebnf$1", {"literal":"\""}], "postprocess": function(d) {return d[1].join(""); }},
    {"name": "sqstring$ebnf$1", "symbols": []},
    {"name": "sqstring$ebnf$1", "symbols": ["sqstring$ebnf$1", "sstrchar"], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "sqstring", "symbols": [{"literal":"'"}, "sqstring$ebnf$1", {"literal":"'"}], "postprocess": function(d) {return d[1].join(""); }},
    {"name": "btstring$ebnf$1", "symbols": []},
    {"name": "btstring$ebnf$1", "symbols": ["btstring$ebnf$1", /[^`]/], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "btstring", "symbols": [{"literal":"`"}, "btstring$ebnf$1", {"literal":"`"}], "postprocess": function(d) {return d[1].join(""); }},
    {"name": "dstrchar", "symbols": [/[^\\"\n]/], "postprocess": id},
    {"name": "dstrchar", "symbols": [{"literal":"\\"}, "strescape"], "postprocess": 
        function(d) {
            return JSON.parse("\""+d.join("")+"\"");
        }
        },
    {"name": "sstrchar", "symbols": [/[^\\'\n]/], "postprocess": id},
    {"name": "sstrchar", "symbols": [{"literal":"\\"}, "strescape"], "postprocess": function(d) { return JSON.parse("\""+d.join("")+"\""); }},
    {"name": "sstrchar$string$1", "symbols": [{"literal":"\\"}, {"literal":"'"}], "postprocess": (d) => d.join('')},
    {"name": "sstrchar", "symbols": ["sstrchar$string$1"], "postprocess": function(d) {return "'"; }},
    {"name": "strescape", "symbols": [/["\\/bfnrt]/], "postprocess": id},
    {"name": "strescape", "symbols": [{"literal":"u"}, /[a-fA-F0-9]/, /[a-fA-F0-9]/, /[a-fA-F0-9]/, /[a-fA-F0-9]/], "postprocess": 
        function(d) {
            return d.join("");
        }
        },
    {"name": "main", "symbols": ["statement"], "postprocess": id},
    {"name": "statement", "symbols": ["disjonction"], "postprocess": id},
    {"name": "disjonction", "symbols": ["exclusion"], "postprocess": id},
    {"name": "disjonction$subexpression$1$string$1", "symbols": [{"literal":"O"}, {"literal":"R"}], "postprocess": (d) => d.join('')},
    {"name": "disjonction$subexpression$1", "symbols": ["disjonction$subexpression$1$string$1"]},
    {"name": "disjonction$subexpression$1$string$2", "symbols": [{"literal":"|"}, {"literal":"|"}], "postprocess": (d) => d.join('')},
    {"name": "disjonction$subexpression$1", "symbols": ["disjonction$subexpression$1$string$2"]},
    {"name": "disjonction", "symbols": ["disjonction", "_", "disjonction$subexpression$1", "_", "exclusion"], "postprocess": (d) => d[0].merge(d[4], `(${d[0]}) OR (${d[4]})`)},
    {"name": "exclusion", "symbols": ["conjonction"], "postprocess": id},
    {"name": "exclusion$string$1", "symbols": [{"literal":"X"}, {"literal":"O"}, {"literal":"R"}], "postprocess": (d) => d.join('')},
    {"name": "exclusion", "symbols": ["exclusion", "exclusion$string$1", "conjonction"], "postprocess": (d) => d[0].merge(d[4], `(${d[0]}) XOR (${d[4]})`)},
    {"name": "conjonction", "symbols": ["negation"], "postprocess": id},
    {"name": "conjonction$subexpression$1$string$1", "symbols": [{"literal":"A"}, {"literal":"N"}, {"literal":"D"}], "postprocess": (d) => d.join('')},
    {"name": "conjonction$subexpression$1", "symbols": ["conjonction$subexpression$1$string$1"]},
    {"name": "conjonction$subexpression$1$string$2", "symbols": [{"literal":"&"}, {"literal":"&"}], "postprocess": (d) => d.join('')},
    {"name": "conjonction$subexpression$1", "symbols": ["conjonction$subexpression$1$string$2"]},
    {"name": "conjonction", "symbols": ["conjonction", "_", "conjonction$subexpression$1", "_", "negation"], "postprocess": (d) => d[0].merge(d[4], `(${d[0]}) AND (${d[4]})`)},
    {"name": "negation", "symbols": ["condition"], "postprocess": id},
    {"name": "negation$subexpression$1$string$1", "symbols": [{"literal":"N"}, {"literal":"O"}, {"literal":"T"}], "postprocess": (d) => d.join('')},
    {"name": "negation$subexpression$1", "symbols": ["negation$subexpression$1$string$1"]},
    {"name": "negation$subexpression$1", "symbols": [{"literal":"!"}]},
    {"name": "negation", "symbols": ["negation$subexpression$1", "_", "condition"], "postprocess": (d) => d[2].copy({constraints: `NOT (${d[2]})`})},
    {"name": "negation$subexpression$2$string$1", "symbols": [{"literal":"N"}, {"literal":"O"}, {"literal":"T"}], "postprocess": (d) => d.join('')},
    {"name": "negation$subexpression$2", "symbols": ["negation$subexpression$2$string$1"]},
    {"name": "negation$subexpression$2", "symbols": [{"literal":"!"}]},
    {"name": "negation", "symbols": ["negation$subexpression$2", "_", {"literal":"("}, "_", "condition", "_", {"literal":")"}], "postprocess": (d) => d[4].copy({constraints: `NOT (${d[4]})`})},
    {"name": "condition", "symbols": ["expression"], "postprocess": id},
    {"name": "condition", "symbols": ["condition", "_", {"literal":"<"}, "_", "expression"], "postprocess": (d) => d[0].merge(d[4], `(${d[0]}) <  (${d[4]})`)},
    {"name": "condition$string$1", "symbols": [{"literal":"<"}, {"literal":"="}], "postprocess": (d) => d.join('')},
    {"name": "condition", "symbols": ["condition", "_", "condition$string$1", "_", "expression"], "postprocess": (d) => d[0].merge(d[4], `(${d[0]}) <= (${d[4]})`)},
    {"name": "condition", "symbols": ["condition", "_", {"literal":">"}, "_", "expression"], "postprocess": (d) => d[0].merge(d[4], `(${d[0]}) >  (${d[4]})`)},
    {"name": "condition$string$2", "symbols": [{"literal":">"}, {"literal":"="}], "postprocess": (d) => d.join('')},
    {"name": "condition", "symbols": ["condition", "_", "condition$string$2", "_", "expression"], "postprocess": (d) => d[0].merge(d[4], `(${d[0]}) >= (${d[4]})`)},
    {"name": "condition$subexpression$1", "symbols": [{"literal":"="}]},
    {"name": "condition$subexpression$1$string$1", "symbols": [{"literal":"="}, {"literal":"="}], "postprocess": (d) => d.join('')},
    {"name": "condition$subexpression$1", "symbols": ["condition$subexpression$1$string$1"]},
    {"name": "condition", "symbols": ["condition", "_", "condition$subexpression$1", "_", "expression"], "postprocess": (d) => d[0].merge(d[4], `(${d[0]}) =  (${d[4]})`)},
    {"name": "condition$subexpression$2$string$1", "symbols": [{"literal":"!"}, {"literal":"="}], "postprocess": (d) => d.join('')},
    {"name": "condition$subexpression$2", "symbols": ["condition$subexpression$2$string$1"]},
    {"name": "condition$subexpression$2$string$2", "symbols": [{"literal":"<"}, {"literal":">"}], "postprocess": (d) => d.join('')},
    {"name": "condition$subexpression$2", "symbols": ["condition$subexpression$2$string$2"]},
    {"name": "condition", "symbols": ["condition", "_", "condition$subexpression$2", "_", "expression"], "postprocess": (d) => d[0].merge(d[4], `(${d[0]}) <> (${d[4]})`)},
    {"name": "parenthesed_expression", "symbols": [{"literal":"("}, "_", "expression", "_", {"literal":")"}], "postprocess": (d) => d[2].copy({constraints: `(${d[2]})`})},
    {"name": "expression", "symbols": ["term"], "postprocess": id},
    {"name": "expression$string$1", "symbols": [{"literal":"M"}, {"literal":"A"}, {"literal":"X"}], "postprocess": (d) => d.join('')},
    {"name": "expression", "symbols": ["expression$string$1", "_", "parenthesed_term_list"], "postprocess": (d) => d[2].copy({constraints: `GREATEST ${d[2]}`})},
    {"name": "expression$string$2", "symbols": [{"literal":"M"}, {"literal":"I"}, {"literal":"N"}], "postprocess": (d) => d.join('')},
    {"name": "expression", "symbols": ["expression$string$2", "_", "parenthesed_term_list"], "postprocess": (d) => d[2].copy({constraints: `LEAST ${d[2]}`})},
    {"name": "expression$string$3", "symbols": [{"literal":"S"}, {"literal":"U"}, {"literal":"M"}], "postprocess": (d) => d.join('')},
    {"name": "expression", "symbols": ["expression$string$3", "_", "parenthesed_term_list"], "postprocess": (d) => d[2].copy({constraints: `SUM ${d[2]}`})},
    {"name": "expression$string$4", "symbols": [{"literal":"A"}, {"literal":"V"}, {"literal":"G"}], "postprocess": (d) => d.join('')},
    {"name": "expression", "symbols": ["expression$string$4", "_", "parenthesed_term_list"], "postprocess": (d) => d[2].copy({constraints: `AVG ${d[2]}`})},
    {"name": "expression$string$5", "symbols": [{"literal":"M"}, {"literal":"E"}, {"literal":"A"}, {"literal":"N"}], "postprocess": (d) => d.join('')},
    {"name": "expression", "symbols": ["expression$string$5", "_", "parenthesed_term_list"], "postprocess": (d) => d[2].copy({constraints: `MEAN ${d[2]}`})},
    {"name": "expression$string$6", "symbols": [{"literal":"F"}, {"literal":"L"}, {"literal":"O"}, {"literal":"O"}, {"literal":"R"}], "postprocess": (d) => d.join('')},
    {"name": "expression", "symbols": ["expression$string$6", "_", "parenthesed_term"], "postprocess": (d) => d[2].copy({constraints: `FLOOR ${d[2]}`})},
    {"name": "expression$string$7", "symbols": [{"literal":"C"}, {"literal":"E"}, {"literal":"I"}, {"literal":"L"}], "postprocess": (d) => d.join('')},
    {"name": "expression", "symbols": ["expression$string$7", "_", "parenthesed_term"], "postprocess": (d) => d[2].copy({constraints: `CEIL ${d[2]}`})},
    {"name": "expression$string$8", "symbols": [{"literal":"R"}, {"literal":"O"}, {"literal":"U"}, {"literal":"N"}, {"literal":"D"}], "postprocess": (d) => d.join('')},
    {"name": "expression", "symbols": ["expression$string$8", "_", "parenthesed_term"], "postprocess": (d) => d[2].copy({constraints: `ROUND ${d[2]}`})},
    {"name": "parenthesed_term", "symbols": [{"literal":"("}, "_", "term", "_", {"literal":")"}], "postprocess": (d) =>  d[2].copy({constraints: `(${d[2]})`})},
    {"name": "parenthesed_term_list", "symbols": [{"literal":"("}, "_", "term_list", "_", {"literal":")"}], "postprocess": (d) => d[2].copy({constraints: `(${d[2]})`})},
    {"name": "term_list", "symbols": ["term"], "postprocess": id},
    {"name": "term_list", "symbols": ["term_list", "_", {"literal":","}, "_", "term"], "postprocess": (d) => d[0].merge(d[4], `${d[0]}, ${d[4]}`)},
    {"name": "arithmetic_expression", "symbols": ["term"], "postprocess": id},
    {"name": "term", "symbols": ["term", "_", {"literal":"+"}, "_", "factor"], "postprocess": (d) => d[0].merge(d[4], `${d[0]} + ${d[4]}`)},
    {"name": "term", "symbols": ["term", "_", {"literal":"-"}, "_", "factor"], "postprocess": (d) => d[0].merge(d[4], `${d[0]} - ${d[4]}`)},
    {"name": "term", "symbols": ["factor"], "postprocess": id},
    {"name": "factor", "symbols": ["factor", "_", {"literal":"*"}, "_", "power"], "postprocess": (d) => d[0].merge(d[4], `${d[0]} * ${d[4]}`)},
    {"name": "factor", "symbols": ["factor", "_", {"literal":"/"}, "_", "power"], "postprocess": (d) => d[0].merge(d[4], `${d[0]} / ${d[4]}`)},
    {"name": "factor", "symbols": ["factor", "_", {"literal":"%"}, "_", "power"], "postprocess": (d) => d[0].merge(d[4], `${d[0]} % ${d[4]}`)},
    {"name": "factor$string$1", "symbols": [{"literal":"m"}, {"literal":"o"}, {"literal":"d"}], "postprocess": (d) => d.join('')},
    {"name": "factor", "symbols": ["factor", "_", "factor$string$1", "_", "power"], "postprocess": (d) => d[0].merge(d[4], `${d[0]} % ${d[4]}`)},
    {"name": "factor", "symbols": ["power"], "postprocess": id},
    {"name": "power", "symbols": ["power", "_", {"literal":"^"}, "_", "number"], "postprocess": (d) => d[0].merge(d[4], `${d[0]} ^ ${d[4]}`)},
    {"name": "power", "symbols": ["number"], "postprocess": id},
    {"name": "number", "symbols": ["decimal"], "postprocess": (d) => PhoegLangResult.create({constraints: `${d[0]}`})},
    {"name": "number", "symbols": ["invariant"], "postprocess":  (d) => PhoegLangResult.create({
        constraints: `${d[0]}.val`, 
        invariants: [`${d[0]}`]}) },
    {"name": "number", "symbols": ["parenthesed_expression"], "postprocess": id},
    {"name": "invariant$ebnf$1", "symbols": ["invariant_char"]},
    {"name": "invariant$ebnf$1", "symbols": ["invariant$ebnf$1", "invariant_char"], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "invariant", "symbols": ["invariant$ebnf$1"], "postprocess": (d) => d[0].join("")},
    {"name": "invariant_char", "symbols": [/[_a-z]/], "postprocess": id}
  ],
  ParserStart: "main",
};

export default grammar;

import { Static, StaticArray, TLiteral, TUnion, Type } from "@sinclair/typebox";
import {
  ACCEPTABLE_INVARIANTS,
  INVARIANTS,
  InvariantTypes,
} from "../invariants";

export type Invariant = typeof ACCEPTABLE_INVARIANTS[number];

export type InvariantConstraint = {
  name: Invariant;
  minimum_bound: number;
  maximum_bound: number;
};

export type InvariantConstraints = InvariantConstraint[];

/**
 * Return a JSON Schema definition
 */
export function phoegDefinitions(): any {
  return {
    definitions: {
      invariants: {
        type: "string",
        enum: ACCEPTABLE_INVARIANTS,
      },
    },
  };
}

export function graphQueryArgsFn() {
  return {
    type: "object",
    title: "Phoeg Request",
    properties: {
      order: {
        minimum: 1,
        maximum: 10,
        default: 8,
        title: "Graph Order",
        description:
          "This setting affects the number of vertices of the graphs that are displayed in the polytope.",
        type: "integer",
      },
      x_invariant: {
        title: "Invariant on the X axis",
        description: "The invariant to use for the x-axis.",
        type: "string",
        enum: ACCEPTABLE_INVARIANTS,
        default: "av_col",
      },
      y_invariant: {
        title: "Invariant on the Y axis",
        description: "The invariant to use for the y-axis.",
        type: "string",
        enum: ACCEPTABLE_INVARIANTS,
        default: "num_col",
      },
      add_colouring: {
        title: "Add colouring?",
        description:
          "The invariant selected in the following box will be used to colour the points in the graph.",
        $ref: "#/definitions/colour",
      },
      constraints: {
        title: "Constraints",
        description: "Add additional constraints to the query.",
        type: "array",
        items: {
          type: "object",
          properties: {
            name: {
              description: "The invariant to use for the constraint.",
              title: "Invariant",
              type: "string",
              enum: ACCEPTABLE_INVARIANTS,
            },
            minimum_bound: {
              title: "Minimum Bound",
              type: "number",
            },
            maximum_bound: {
              title: "Maximum Bound",
              type: "number",
            },
          },
        },
      },
    },
    required: ["order", "x_invariant", "y_invariant", "add_colouring"],
    definitions: {
      colour: {
        title: "colour",
        type: "object",
        properties: {
          "Add colouring?": {
            type: "string",
            enum: ["No", "Yes"],
            default: "No",
          },
        },
        required: ["Add colouring?"],
        dependencies: {
          "Add colouring?": {
            oneOf: [
              {
                properties: {
                  "Add colouring?": {
                    enum: ["No"],
                  },
                },
              },
              {
                properties: {
                  "Add colouring?": {
                    enum: ["Yes"],
                  },
                  "The invariant to use for the colouring.": {
                    type: "string",
                    enum: ACCEPTABLE_INVARIANTS,
                    default: ACCEPTABLE_INVARIANTS[2],
                  },
                },
                required: ["The invariant to use for the colouring."],
              },
            ],
          },
        },
      },
    },
  };
}

export const polytopeQueryArgs = Type.Object({
  order: Type.Integer({
    minimum: 1,
    maximum: 10,
    default: 8,
    description: "Maximum size of the graphs.",
  }),
  orders: Type.Optional(
    Type.Array(
      Type.Integer({
        minimum: 1,
        maximum: 10,
        default: 8,
        description: "List of orders to compute concave hulls for.",
      })
    )
  ),
  x_invariant: Type.String({
    pattern: ACCEPTABLE_INVARIANTS.join("|"),
    examples: ACCEPTABLE_INVARIANTS,
    title: "X Invariant Name",
  }),
  y_invariant: Type.String({
    pattern: ACCEPTABLE_INVARIANTS.join("|"),
    examples: ACCEPTABLE_INVARIANTS,
    title: "Y Invariant Name",
  }),
  colour: Type.Optional(
    Type.String({
      pattern: ACCEPTABLE_INVARIANTS.join("|"),
      examples: ACCEPTABLE_INVARIANTS,
      title: "Colour Invariant Name",
    })
  ),
  constraints: Type.Optional(
    Type.Array(
      Type.Object({
        name: Type.String({
          pattern: ACCEPTABLE_INVARIANTS.join("|"),
          examples: ACCEPTABLE_INVARIANTS,
          title: "Invariant Name",
        }),
        minimum_bound: Type.Optional(Type.Number({ title: "Minimum Bound" })),
        maximum_bound: Type.Optional(Type.Number({ title: "Maximum Bound" })),
      }),
      {
        description:
          "Name of each invariant to analyse. The first two will be used on the axis. Acceptable values are: " +
          ACCEPTABLE_INVARIANTS.join(", ") +
          ".",
      }
    )
  ),
});

export const graphsQueryArgs = Type.Object({
  order: Type.Integer({
    minimum: 1,
    maximum: 10,
    default: 8,
    description: "Maximum size of the graphs.",
  }),
  invariants: Type.Array(
    Type.Object({
      name: Type.String({
        pattern: ACCEPTABLE_INVARIANTS.join("|"),
        examples: ACCEPTABLE_INVARIANTS,
        title: "Invariant Name",
      }),
      minimum_bound: Type.Optional(Type.Number({ title: "Minimum Bound" })),
      maximum_bound: Type.Optional(Type.Number({ title: "Maximum Bound" })),
    }),
    {
      description:
        "Name of each invariant to analyse. The first two will be used on the axis. Acceptable values are: " +
        ACCEPTABLE_INVARIANTS.join(", ") +
        ".",
    }
  ),
  constraints: Type.Optional(
    Type.Array(
      Type.Object({
        name: Type.String({
          pattern: ACCEPTABLE_INVARIANTS.join("|"),
          examples: ACCEPTABLE_INVARIANTS,
          title: "Invariant Name",
        }),
        minimum_bound: Type.Optional(Type.Number({ title: "Minimum Bound" })),
        maximum_bound: Type.Optional(Type.Number({ title: "Maximum Bound" })),
      }),
      {
        description:
          "Name of each invariant to analyse. The first two will be used on the axis. Acceptable values are: " +
          ACCEPTABLE_INVARIANTS.join(", ") +
          ".",
      }
    )
  ),
});

export type IGraphsQueryArgs = Static<typeof graphsQueryArgs>;
export type IPolytopeQueryArgs = Static<typeof polytopeQueryArgs>;

export interface IGraphsQueryResults {
  sig: string[];
  m: number[];
  invariant: number[];
  chi: number[];
}

export const pointsPhoegLangQueryArgs = Type.Object({
  order: Type.Integer({
    minimum: 1,
    maximum: 10,
    default: 8,
    description: "Maximum size of the graphs.",
  }),
});

export type IPointsPhoegLangQueryArgs = Static<typeof pointsPhoegLangQueryArgs>;

export const pointsPhoegLangBody = Type.Optional(
  Type.Object({
    query: Type.String(),
  })
);

export type IPointsPhoegLangBody = Static<typeof pointsPhoegLangBody>;

export function part_select_signature(): string {
  return `WITH data AS (
SELECT
    n.signature AS sig,\n`;
}

export function part_select_count(): string {
  return `WITH data AS (
SELECT
    COUNT(*) as mult,\n`;
}

export function part_select(): string {
  return `WITH data AS (
SELECT\n`;
}

export function part_from(): string {
  return `    FROM num_vertices n\n`;
}

export function part_where_val(): string {
  return `    WHERE n.val = $1\n`;
}

export function part_select_json_build_array(): string {
  return `
)
SELECT json_build_object(
    'sig',array_to_json(array_agg(sig)),\n`;
}

export function part_json_build_object(): string {
  return `
)
SELECT json_build_object(\n`;
}

export function part_compute_polytope(invariants: string[]): string {
  const invariantX = invariants[0];
  const invariantY = invariants[1];
  return `
),
polytable as (
    -- Build the convex hull and output it as json
    SELECT st_asgeojson(ST_ConvexHull(ST_Collect(ST_Point(${invariantX}, ${invariantY})))) as poly
    FROM data
),
points as (
    -- We split the list of points of the convex hull as a table with a row per
    -- point of the convex hull. The function json_array_elements splits a json
    -- array into rows.
    select poly::json->'type' as tp, json_array_elements(
        -- Since the arrays are different based on the type of convex hull
        -- (point, line or polygon), we format it so we have an array of points
        -- (which are also arrays)
        -- thing::json->'key' casts 'thing' into json and extracts the value
        -- for the key. Also works on arrays with indices.
        case (poly::json->'type')::text
            -- If we have a point, make it an array containing a single point.
        when '"Point"' then json_build_array(poly::json->'coordinates')
            -- A line is already an array of points.
        when '"LineString"' then poly::json->'coordinates'
            -- A polygon is an array containing an array of points so we
            -- extract this array.
        when '"Polygon"' then (poly::json->'coordinates')::json->0
        end
    ) as xy
    from polytable
),
formatted as (
    -- Format each row as a json dict with keys x and y
    select tp::text as tp, json_build_object('x', xy::json->0, 'y', xy::json->1) as xy
    from points
)
select json_build_object('type', tp::json, 'coordinates', (
        case tp::text
        when '"Point"' then json_agg(xy)->0
        else json_agg(xy)
        end
    ))
from formatted
group by tp;
`;
}

export function part_from_data(): string {
  return `)
FROM data;`;
}

export function part_invariants_to_json(
  invariants: StaticArray<TUnion<TLiteral<string>[]>>
): string {
  let res = "";
  invariants.concat(["mult"]).forEach((invariant, index) => {
    res += `    '${invariant}',array_to_json(array_agg(${invariant}))`;
    if (index < invariants.length) {
      // Add , except for the last invariant
      res += ",";
    }
    res += "\n";
  });
  return res;
}

export function condition(
  invariant_name: string,
  min_bound?: number,
  max_bound?: number
): string {
  if (min_bound === undefined && max_bound === undefined) {
    return "";
  }
  let raw_query = "";
  if (
    INVARIANTS.filter((i) => i.tablename === invariant_name)[0].datatype ===
    InvariantTypes.booleans
  ) {
    if (min_bound == 0 && max_bound == 0) {
      raw_query = `    AND ${invariant_name}.val = false\n`;
    } else if (min_bound == 1 && max_bound == 1) {
      raw_query = `    AND ${invariant_name}.val = true\n`;
    } else {
      console.warn(
        "Boolean invariant with non-zero min/max bounds not supported"
      );
    }
  } else {
    raw_query += `    AND ${invariant_name}.val >= ${min_bound}\n`;
    raw_query += `    AND ${invariant_name}.val <= ${max_bound}\n`;
  }
  return raw_query;
}

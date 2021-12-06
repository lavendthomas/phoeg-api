-- Almost identical to graphs-json.sql but with an aggregation
WITH data AS (
    SELECT m.val as m, invariant.val AS invariant, chi.val as chi, COUNT(*) as mult
    FROM num_vertices n
    JOIN num_edges m USING (signature)
    JOIN %I invariant USING (signature)
    JOIN chromatic_number chi USING (signature)
    WHERE n.val = $1
    GROUP BY m, invariant, chi
    ORDER BY m, invariant, chi
)
-- Same as points.sql but uses json functions :
-- row_to_json converts a row into a json dict
-- array_agg builds an array from the rows
-- array_to_json builds a json array
SELECT json_build_object(
    'm',array_to_json(array_agg(m)),
    'invariant',array_to_json(array_agg(invariant)),
    'chi',array_to_json(array_agg(chi)),
    'mult',array_to_json(array_agg(mult))
)
FROM data;
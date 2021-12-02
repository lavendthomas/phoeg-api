WITH data AS (
    SELECT
        n.signature AS sig,
        m.val AS m,
        numcol.val AS numcol,
        chi.val AS chi
    FROM num_vertices n
    JOIN num_edges m USING(signature)
    JOIN num_col numcol USING (signature)
    JOIN chromatic_number chi USING (signature)
    WHERE n.val = 8
    ORDER BY m, numcol, chi
)
-- Same as graphs.sql but uses json functions :
-- row_to_json converts a row into a json dict
-- array_agg builds an array from the rows
-- array_to_json builds a json array
SELECT array_to_json(array_agg(row_to_json(data)))
FROM data;

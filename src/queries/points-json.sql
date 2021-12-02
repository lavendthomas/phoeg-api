-- Almost identical to graphs-json.sql but with an aggregation
WITH data AS (
    SELECT m.val as m, numcol.val AS numcol, chi.val as chi, COUNT(*) as mult
    FROM num_vertices n
    JOIN num_edges m USING (signature)
    JOIN num_col numcol USING (signature)
    JOIN chromatic_number chi USING (signature)
    WHERE n.val = 8
    GROUP BY m, numcol, chi
    ORDER BY m, numcol, chi
)
SELECT array_to_json(array_agg(row_to_json(data)))
FROM data;

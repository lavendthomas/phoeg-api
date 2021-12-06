WITH data AS (
    SELECT
        n.signature AS sig,
        m.val AS m,
        invariant.val AS invariant,
        chi.val AS chi
    FROM num_vertices n
    JOIN num_edges m USING(signature)
    JOIN %I invariant USING (signature)
    JOIN chromatic_number chi USING (signature)
    WHERE n.val = $1


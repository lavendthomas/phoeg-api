SELECT
-- sig = signature of the graph (graph6 format)
-- m = size of the graph
-- numcol = number of non-equivalent colorings
-- chi = chromatic number
    n.signature AS n,
    m.val AS m,
    numcol.val AS numcol,
    chi.val AS chi
FROM num_vertices n
JOIN num_edges m USING(signature)
JOIN num_col numcol USING (signature)
JOIN chromatic_number chi USING (signature)
WHERE n.val = $1
ORDER BY m, numcol, chi

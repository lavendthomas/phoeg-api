-- Same as graphs.sql but with an aggregate to count multiplicities
SELECT m.val as m, numcol.val AS numcol, chi.val as chi, COUNT(*) as mult
FROM num_vertices n
JOIN num_edges m USING(signature)
JOIN num_col numcol USING(signature)
JOIN chromatic_number chi USING(signature)
WHERE n.val = $1  -- first parameter : n.val
GROUP BY m, numcol, chi
ORDER BY m, numcol, chi;

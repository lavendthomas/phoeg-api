WITH tmp AS (
    -- n = order
    -- m = size
    -- sig = Name of the graph (graph6 format)
    -- numcol = Number of non-equivalent colorings
    -- chi = Chromatic number
  SELECT n.val AS n, m.val AS m, n.signature as sig, numcol.val AS numcol,
chi.val as chi,
    -- We group the graphs by order and size before sorting them based on their
    -- value of numcol. In each group, the graphs receive a rank based on their
    -- position in the sorted list. The first one (or firsts if equality) have
    -- rank 1, second has rank 2, ...
    RANK() OVER (
        PARTITION BY n.val, m.val
        ORDER by numcol.val DESC
    ) AS pos
    FROM num_vertices n
    -- USING means compare columns named 'signature' in both tables and keep
    -- only this column once (so no duplicated column)
    JOIN num_edges m USING (signature)
    JOIN num_col numcol USING (signature)
    JOIN chromatic_number chi USING (signature)
    -- The real queries use 9 but 8 is faster if you want to try
    WHERE n.val <= 8
)
SELECT sig, n, m, numcol, chi
FROM tmp
-- We keep only the graphs who have the best value of numcol : the extremal
-- ones
WHERE pos = 1
ORDER BY n, m, numcol;

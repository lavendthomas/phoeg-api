WITH ord AS (
-- Same as extremals.sql, we start by ranking the graphs
  SELECT n.val AS n, m.val AS m, n.signature as sig, eci.val AS eci, diam.val as diam, d.val as d,
    RANK() OVER (
        PARTITION BY n.val, m.val
        ORDER by eci.val DESC
    ) AS pos
    FROM num_vertices n
    JOIN num_edges m USING (signature)
    JOIN eci eci USING (signature)
    JOIN diam diam USING (signature)
    JOIN dnm d USING (signature)
    WHERE n.val <= 5
),
data AS (
    -- We filter to only have the extremals
    SELECT n, m, sig, eci, diam, d
    FROM ord
    WHERE pos = 1
)
-- We do the same as with m but this time with n. This way, we have a dict with
-- values of n as keys and the values are dicts with values of m as keys and
-- the extremals as values.
SELECT json_object_agg(n, graphs)
FROM (
    -- We aggregate for each value of n, the values of m. We build a dict with
    -- the values of m as keys and the previously built json as values. The
    -- value n is still in its own column.
    SELECT n, json_object_agg(m, graphs) as graphs
    FROM (
        -- We build a table containing only n, m and a json dict for each row
        -- json_build_object builds a dict by alternating keys and values. The
        -- first argument will be a key, the second a value, the third a key,
        -- the fourth a value and so on.
        SELECT n, m, array_to_json(array_agg(json_build_object('sig', sig, 'eci', eci, 'diam', diam, 'd', d))) AS graphs
        FROM data
        GROUP BY n, m
        ORDER BY n, m
    ) g
    GROUP BY n
) g;

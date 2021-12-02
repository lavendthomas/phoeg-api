-- First, we take all the graphs
with tmp as
(
    SELECT m.val as m, numcol.val AS numcol
    FROM num_vertices n
    JOIN num_edges m USING(signature)
    JOIN num_col numcol USING(signature)
    WHERE n.val = $1
    GROUP BY m, numcol
    ORDER BY m, numcol
)
-- The following are from postgis (plugin to postgresql):
-- ST_POINT converts into a point
-- ST_Collect builds a set of points
-- ST_ConvexHull computes the convex hull
-- ST_AsText Displays the convex hull in human readable format
SELECT ST_AsText(ST_ConvexHull(ST_Collect(ST_Point(numcol, m)))) FROM tmp;

-- This is complex due to the formatting.
with tmp as
(
    -- Select the points to consider for the convex hull
    SELECT m.val as m, avcol.val AS avcol
    FROM num_edges m
    JOIN num_vertices n USING (signature)
    JOIN av_col avcol USING (signature)
    WHERE n.val = 8
    GROUP BY m.val, avcol.val
    ORDER BY m.val, avcol.val
),
polytable as (
    -- Build the convex hull and output it as json
    SELECT st_asgeojson(ST_ConvexHull(ST_Collect(ST_Point(avcol, m)))) as poly
    FROM tmp
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

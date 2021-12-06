    ORDER BY m, invariant, chi
)
-- Same as graphs.sql but uses json functions :
-- row_to_json converts a row into a json dict
-- array_agg builds an array from the rows
-- array_to_json builds a json array
SELECT json_build_object(
    'sig',array_to_json(array_agg(sig)),
    'm',array_to_json(array_agg(m)),
    'invariant',array_to_json(array_agg(invariant)),
    'chi',array_to_json(array_agg(chi))
)
FROM data;
exports.selectProperties = (sort, order) => {
  return `SELECT properties.property_id, properties.name AS property_name, properties.location, properties.location, properties.price_per_night, CONCAT(users.first_name, ' ', users.surname) AS host, COALESCE(COUNT(favourites.favourite_id), 0) AS favourite_count
FROM properties
LEFT JOIN favourites on properties.property_id = favourites.property_id
LEFT JOIN users ON properties.host_id = users.user_id
WHERE (CAST($1 AS DECIMAL) IS NULL OR properties.price_per_night <= CAST($1 AS DECIMAL))
AND (CAST($2 AS DECIMAL) IS NULL OR properties.price_per_night >= CAST($2 AS DECIMAL))
AND (CAST($3 AS INT) IS NULL OR properties.host_id = CAST($3 AS INT))
GROUP BY properties.property_id, users.first_name, users.surname, users.user_id
ORDER BY ${sort} ${order};`;
};

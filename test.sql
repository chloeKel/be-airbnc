SELECT p.property_id, p.name, p.location, p.price_per_night, f.favourite_id, true AS favourited, i.image_url AS image, i.alt_tag AS alt_tag
FROM favourites f
INNER JOIN properties p 
    ON f.property_id = p.property_id
INNER JOIN (
    SELECT DISTINCT ON (property_id) property_id, image_url, alt_tag
    FROM images
    ORDER BY property_id, image_id ASC
) i 
    ON p.property_id = i.property_id
WHERE f.guest_id = 2;

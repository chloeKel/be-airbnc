exports.selectProperties = (sort, order) => {
  return `SELECT properties.property_id, properties.name AS property_name, properties.location, properties.price_per_night, 
  CONCAT(users.first_name, ' ', users.surname) AS host, COALESCE(COUNT(favourites.favourite_id), 0) AS favourite_count, 
(SELECT image_url FROM images 
WHERE images.property_id = properties.property_id 
ORDER BY image_id ASC LIMIT 1) AS image
FROM properties
LEFT JOIN favourites on properties.property_id = favourites.property_id
LEFT JOIN images ON properties.property_id = images.property_id
LEFT JOIN users ON properties.host_id = users.user_id
WHERE (CAST($1 AS DECIMAL) IS NULL OR properties.price_per_night <= CAST($1 AS DECIMAL))
AND (CAST($2 AS DECIMAL) IS NULL OR properties.price_per_night >= CAST($2 AS DECIMAL))
AND (CAST($3 AS INT) IS NULL OR properties.host_id = CAST($3 AS INT))
GROUP BY properties.property_id, users.first_name, users.surname, users.user_id
ORDER BY ${sort} ${order};`;
};

exports.addFavourite = `INSERT INTO favourites (guest_id, property_id) VALUES ($1, $2) RETURNING *;`;

exports.deleteFavourite = "DELETE FROM favourites WHERE favourite_id = $1;";

exports.selectSingleProperty = `SELECT properties.property_id, properties.name AS property_name, 
properties.location, properties.price_per_night, properties.description, 
CONCAT(users.first_name, ' ', users.surname) AS host, users.avatar AS host_avatar, COALESCE(COUNT(favourites.favourite_id), 0) AS favourite_count, 
ARRAY(SELECT image_url FROM images WHERE images.property_id = properties.property_id) AS images,
CASE WHEN CAST($2 AS INT) IS NULL THEN NULL
ELSE EXISTS (SELECT * FROM favourites WHERE guest_id = CAST($2 AS INT) AND property_id = CAST($1 AS INT)) 
END AS favourited
FROM properties
LEFT JOIN favourites on properties.property_id = favourites.property_id 
LEFT JOIN images ON properties.property_id = images.property_id
LEFT JOIN users ON properties.host_id = users.user_id
WHERE (CAST($1 AS INT) IS NULL OR properties.property_id = CAST($1 AS INT))
GROUP BY properties.property_id, users.first_name, users.surname, users.user_id`;

exports.selectReviews = `SELECT reviews.review_id, reviews.comment, reviews.rating, reviews.created_at, 
CONCAT(users.first_name, ' ', users.surname) AS guest, users.avatar AS guest_avatar
FROM reviews
LEFT JOIN users on users.user_id = reviews.guest_id
WHERE reviews.property_id = $1
ORDER BY reviews.created_at DESC;`;

exports.addReview = `INSERT INTO reviews (
rating, comment, guest_id, property_id) 
VALUES ($1, $2, $3, $4) RETURNING *;`;

exports.deleteReview = "DELETE FROM reviews WHERE review_id = $1;";

exports.selectUser = `SELECT user_id, first_name, surname, email, phone_number, avatar, created_at 
FROM users 
WHERE user_id = $1;`;

exports.patchUser = `UPDATE users 
SET first_name = COALESCE($1, first_name), 
surname = COALESCE($2, surname), 
email = COALESCE($3, email), 
phone_number = COALESCE($4, phone_number), 
avatar = COALESCE($5, avatar) 
WHERE user_id = $6 RETURNING *;`;

exports.checkPropertyExists = "SELECT * FROM properties WHERE property_id = $1;";

exports.selectBookings = `SELECT booking_id, check_in_date, check_out_date, created_at 
FROM bookings WHERE property_id = $1 
ORDER BY check_out_date DESC;`;

exports.selectProperties = (guest_id = null, host_id = null, minprice = null, maxprice = null, sort = "favourite_count", order = "desc", property_id = null) => {
  let query = `SELECT p.*, (SELECT COUNT(*) FROM favourites f WHERE f.property_id = p.property_id) AS favourite_count, ROUND(AVG(r.rating), 1) AS average_rating`;

  if (guest_id) query += `, fav_alias.favourited, fav_alias.favourite_id`;

  query += ` FROM properties p LEFT JOIN favourites f ON p.property_id = f.property_id 
  LEFT JOIN reviews r ON r.property_id = p.property_id`;

  if (guest_id)
    query += ` LEFT JOIN (SELECT p.property_id, f.favourite_id,
    CASE WHEN f.favourite_id IS NOT NULL THEN TRUE ELSE FALSE END AS favourited
    FROM properties p
    LEFT JOIN favourites f 
        ON p.property_id = f.property_id
        AND (f.guest_id = (CAST(${guest_id} AS INT)) OR (CAST(${guest_id} AS INT)) IS NULL)
) AS fav_alias ON p.property_id = fav_alias.property_id`;

  const conditions = [];

  if (minprice) conditions.push(`(CAST(${minprice} AS INT) IS NULL OR p.price_per_night >= CAST(${minprice} AS INT))`);
  if (maxprice) conditions.push(`(CAST(${maxprice} AS INT) IS NULL OR p.price_per_night <= CAST(${maxprice} AS INT))`);
  if (host_id) conditions.push(`p.host_id = (CAST(${host_id} AS INT))`);
  if (property_id) conditions.push(`p.property_id = (CAST(${property_id} AS INT))`);

  if (conditions.length > 0) query += ` WHERE ` + conditions.join(" AND ");

  if (guest_id) {
    query += ` GROUP BY p.property_id, fav_alias.favourited, fav_alias.favourite_id`;
  } else {
    query += ` GROUP BY p.property_id`;
  }

  if (!property_id) query += ` ORDER BY ${sort} ${order};`;
  return query;
};

exports.selectImages = (property_id) => {
  let query = `SELECT p.property_id, ARRAY_AGG(i.image_url ORDER BY i.image_id) FILTER (WHERE i.image_url IS NOT NULL) AS images
FROM properties p 
LEFT JOIN images i ON p.property_id = i.property_id`;

  if (property_id) query += ` WHERE p.property_id = (CAST(${property_id} AS INT))`;

  query += ` GROUP BY p.property_id;`;

  return query;
};

exports.selectHost = `SELECT p.property_id, CONCAT(u.first_name, ' ', u.surname) AS host, u.avatar AS host_avatar 
FROM properties p 
LEFT JOIN users u ON p.host_id = u.user_id 
WHERE p.property_id = (CAST($1 AS INT))  
GROUP BY p.property_id, u.first_name, u.surname, u.avatar;`;

exports.selectFavourites = `SELECT p.property_id, p.name, p.location, p.price_per_night, f.favourite_id, true AS favourited, i.image_url AS image, i.alt_tag AS alt_tag
FROM favourites f
INNER JOIN properties p 
    ON f.property_id = p.property_id
INNER JOIN (
    SELECT DISTINCT ON (property_id) property_id, image_url, alt_tag
    FROM images
    ORDER BY property_id, image_id ASC
) i 
    ON p.property_id = i.property_id
WHERE f.guest_id = (CAST($1 AS INT));`;

exports.addFavourite = `INSERT INTO favourites (guest_id, property_id) VALUES ((CAST($1 AS INT)), (CAST($2 AS INT))) RETURNING *;`;

exports.deleteFavourite = "DELETE FROM favourites WHERE favourite_id = (CAST($1 AS INT));";

exports.selectReviews = `SELECT r.review_id, r.comment, r.rating, r.created_at, 
CONCAT(u.first_name, ' ', u.surname) AS guest, u.avatar AS guest_avatar
FROM reviews r
LEFT JOIN users u on u.user_id = r.guest_id
WHERE r.property_id = (CAST($1 AS INT))
ORDER BY r.created_at DESC;`;

exports.selectAvgRating = `SELECT property_id, ROUND(AVG(rating), 1) AS average_rating
FROM reviews
WHERE property_id = (CAST($1 AS INT))
GROUP BY property_id;`;

exports.addReview = `INSERT INTO reviews (
rating, comment, guest_id, property_id) 
VALUES ((CAST($1 AS DECIMAL)), $2, (CAST($3 AS INT)), (CAST($4 AS INT))) RETURNING *;`;

exports.deleteReview = "DELETE FROM reviews WHERE review_id = $1;";

exports.selectUser = `SELECT user_id, first_name, surname, email, phone_number, role, avatar, created_at 
FROM users 
WHERE user_id = (CAST($1 AS INT));`;

exports.amendUser = `UPDATE users 
SET first_name = COALESCE($1, first_name), 
surname = COALESCE($2, surname), 
email = COALESCE($3, email), 
phone_number = COALESCE($4, phone_number), 
avatar = COALESCE($5, avatar) 
WHERE user_id = (CAST($6 AS INT)) RETURNING *;`;

exports.checkExists = (column, row) => `SELECT * FROM ${column} WHERE ${row} = $1;`;

exports.selectBookings = `SELECT booking_id, check_in_date, check_out_date, created_at 
FROM bookings WHERE property_id = (CAST($1 AS INT))
ORDER BY check_out_date DESC;`;

exports.addBooking = `INSERT INTO bookings (check_in_date, check_out_date, guest_id, property_id) VALUES ($1, $2, (CAST($3 AS INT)), (CAST($4 AS INT))) RETURNING booking_id;`;

exports.amendBooking = `UPDATE bookings 
SET check_in_date = COALESCE($1, check_in_date), 
check_out_date = COALESCE($2, check_out_date) 
WHERE booking_id = (CAST($3 AS INT)) RETURNING *;`;

exports.deleteBooking = "DELETE FROM bookings WHERE booking_id = (CAST($1 AS INT));";

exports.selectUserBookings = `SELECT b.booking_id, b.check_in_date, b.check_out_date, b.property_id, p.name AS property_name, CONCAT(u.first_name, ' ', u.surname) AS host,
    (SELECT image_url FROM images 
     WHERE images.property_id = b.property_id 
     ORDER BY image_id ASC LIMIT 1) AS image
FROM bookings b
LEFT JOIN properties p ON p.property_id = b.property_id
LEFT JOIN users u ON u.user_id = p.host_id
WHERE guest_id = (CAST($1 AS INT))
ORDER BY b.check_in_date ASC;`;

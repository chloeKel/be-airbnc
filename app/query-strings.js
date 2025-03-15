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

exports.selectFavourites = `SELECT * FROM FAVOURITES WHERE guest_id = $1;`;

exports.addFavourite = `INSERT INTO favourites (guest_id, property_id) VALUES ($1, $2) RETURNING *;`;

exports.deleteFavourite = "DELETE FROM favourites WHERE favourite_id = $1;";

exports.selectReviews = `SELECT reviews.review_id, reviews.comment, reviews.rating, reviews.created_at, 
CONCAT(users.first_name, ' ', users.surname) AS guest, users.avatar AS guest_avatar
FROM reviews
LEFT JOIN users on users.user_id = reviews.guest_id
WHERE reviews.property_id = $1
ORDER BY reviews.created_at DESC;`;

exports.selectAvgRating = `SELECT property_id, ROUND(AVG(rating), 1) AS average_rating
FROM reviews
WHERE property_id = $1
GROUP BY property_id;`;

exports.addReview = `INSERT INTO reviews (
rating, comment, guest_id, property_id) 
VALUES ($1, $2, $3, $4) RETURNING *;`;

exports.deleteReview = "DELETE FROM reviews WHERE review_id = $1;";

exports.selectUser = `SELECT user_id, first_name, surname, email, phone_number, role, avatar, created_at 
FROM users 
WHERE user_id = $1;`;

exports.amendUser = `UPDATE users 
SET first_name = COALESCE($1, first_name), 
surname = COALESCE($2, surname), 
email = COALESCE($3, email), 
phone_number = COALESCE($4, phone_number), 
avatar = COALESCE($5, avatar) 
WHERE user_id = $6 RETURNING *;`;

exports.checkExists = (column, row) => `SELECT * FROM ${column} WHERE ${row} = $1;`;

exports.selectBookings = `SELECT booking_id, check_in_date, check_out_date, created_at 
FROM bookings WHERE property_id = $1 
ORDER BY check_out_date DESC;`;

exports.addBooking = `INSERT INTO bookings (check_in_date, check_out_date, guest_id, property_id) VALUES ($1, $2, $3, $4) RETURNING booking_id;`;

exports.amendBooking = `UPDATE bookings 
SET check_in_date = COALESCE($1, check_in_date), 
check_out_date = COALESCE($2, check_out_date) 
WHERE booking_id = $3 RETURNING *;`;

exports.deleteBooking = "DELETE FROM bookings WHERE booking_id = $1;";

exports.selectUserBookings = `SELECT bookings.booking_id, bookings.check_in_date, bookings.check_out_date, bookings.property_id, properties.name AS property_name, CONCAT(users.first_name, ' ', users.surname) AS host,
    (SELECT image_url FROM images 
     WHERE images.property_id = bookings.property_id 
     ORDER BY image_id ASC LIMIT 1) AS image
FROM bookings
LEFT JOIN properties ON properties.property_id = bookings.property_id
LEFT JOIN users ON users.user_id = properties.host_id
WHERE guest_id = $1
ORDER BY bookings.check_in_date ASC;`;

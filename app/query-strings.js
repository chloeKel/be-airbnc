exports.properties = "SELECT property_id, name, location, price_per_night, host_id FROM properties;";
exports.favourites = "SELECT property_id, COUNT(favourite_id) AS favourite_count FROM favourites GROUP BY property_id;";
exports.allUsers = "SELECT * FROM users;";

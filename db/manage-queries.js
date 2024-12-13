const db = require("./connection");
const format = require("pg-format");
const { formatData, mapData } = require("../utils");
const { propertyTypesData, usersData, propertiesData, favouritesData, reviewsData, imagesData, bookingsData } = require("./data/test/index");

exports.dropTables = `DROP TABLE IF EXISTS
    bookings, images, reviews, favourites, properties, users, property_types CASCADE;`;

const create = {
  propertyTypes: `CREATE TABLE property_types (
     property_type VARCHAR NOT NULL PRIMARY KEY,
     description TEXT NOT NULL
   );`,
  users: `CREATE TABLE users (
     user_id SERIAL PRIMARY KEY,
     first_name VARCHAR NOT NULL,
     surname VARCHAR NOT NULL,
     email VARCHAR NOT NULL,
     phone_number VARCHAR,
     role VARCHAR CHECK (role IN ('host', 'guest')),
     avatar VARCHAR,
     created_at TIMESTAMP default CURRENT_TIMESTAMP
   );`,
  properties: `CREATE TABLE properties (
     property_id SERIAL PRIMARY KEY,
     host_id INT NOT NULL REFERENCES users(user_id),
     name VARCHAR NOT NULL,
     location VARCHAR NOT NULL,
     property_type VARCHAR NOT NULL REFERENCES property_types(property_type),
     price_per_night DECIMAL NOT NULL,
     description TEXT
   );`,
  favourites: `CREATE TABLE favourites (
     favourite_id SERIAL PRIMARY KEY,
     guest_id INT NOT NULL REFERENCES users(user_id),
     property_id INT NOT NULL REFERENCES properties(property_id)
   );`,
  reviews: `CREATE TABLE reviews (
     review_id SERIAL PRIMARY KEY,
     property_id INT NOT NULL REFERENCES properties(property_id),
     guest_id INT NOT NULL REFERENCES users(user_id),
     rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
     comment TEXT,
     created_at TIMESTAMP default CURRENT_TIMESTAMP
   );`,
  images: `CREATE TABLE images (
   image_id SERIAL PRIMARY KEY, 
   property_id INT NOT NULL REFERENCES properties(property_id),
   image_url VARCHAR NOT NULL,
   alt_tag VARCHAR NOT NULL
   );`,
  bookings: `CREATE EXTENSION IF NOT EXISTS btree_gist; 
  CREATE TABLE bookings (
  booking_id SERIAL PRIMARY KEY,
  property_id INT NOT NULL REFERENCES properties(property_id),
  guest_id INT NOT NULL REFERENCES users(user_id),
  check_in_date DATE NOT NULL CHECK (check_in_date >= CURRENT_DATE),
  check_out_date DATE NOT NULL CHECK (check_out_date > check_in_date),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT unique_booking_dates 
  EXCLUDE USING gist (
  property_id WITH =,
  daterange(check_in_date, check_out_date, '[]') WITH &&)
);`,
};

exports.tables = [create.propertyTypes, create.users, create.properties, create.favourites, create.reviews, create.images, create.bookings];

exports.insertPropertyTypes = format("INSERT INTO property_types (property_type, description) VALUES %L;", formatData(propertyTypesData));

exports.insertUsers = format("INSERT INTO users (first_name, surname, email, phone_number, role, avatar) VALUES %L RETURNING *;", formatData(usersData));

exports.usersKey = (user) => `${user.first_name} ${user.surname}`;

exports.insertProperties = async (usersRef) => {
  const queryString = "INSERT INTO properties (name, property_type, location, price_per_night, description, host_id) VALUES %L RETURNING *;";
  const propertiesWithHostId = mapData(propertiesData, usersRef, "host_id", "host_name");
  const values = formatData(propertiesWithHostId);
  return format(queryString, values);
};

exports.propertiesKey = (prop) => prop.name;

exports.insertFavourites = async (usersRef, propsRef) => {
  const queryString = "INSERT INTO favourites (guest_id, property_id) VALUES %L;";
  const withGuestId = mapData(favouritesData, usersRef, "guest_id", "guest_name");
  const withGuestAndPropId = mapData(withGuestId, propsRef, "property_id", "property_name");
  const values = formatData(withGuestAndPropId);
  return format(queryString, values);
};

exports.insertReviews = async (usersRef, propsRef) => {
  const queryString = "INSERT INTO reviews (rating, comment, guest_id, property_id) VALUES %L;";
  const withGuestId = mapData(reviewsData, usersRef, "guest_id", "guest_name");
  const withGuestAndPropId = mapData(withGuestId, propsRef, "property_id", "property_name");
  const values = formatData(withGuestAndPropId);
  return format(queryString, values);
};

exports.insertImages = async (propsRef) => {
  const queryString = "INSERT INTO images (image_url, alt_tag, property_id) VALUES %L;";
  const withPropertyId = mapData(imagesData, propsRef, "property_id", "property_name");
  const values = formatData(withPropertyId);
  return format(queryString, values);
};

exports.insertBookings = async (usersRef, propsRef) => {
  const queryString = "INSERT INTO bookings (check_in_date, check_out_date, guest_id, property_id) VALUES %L;";
  const withGuestId = mapData(bookingsData, usersRef, "guest_id", "guest_name");
  const withGuestAndPropId = mapData(withGuestId, propsRef, "property_id", "property_name");
  const values = formatData(withGuestAndPropId);
  return format(queryString, values);
};

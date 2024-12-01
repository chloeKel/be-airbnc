const db = require("./connection");
const format = require("pg-format");
const { formatData, mapData } = require("./db-utils");
const { propertyTypesData, usersData, propertiesData, favouritesData, reviewsData } = require("./data/test/index");

const dropTables = `DROP TABLE IF EXISTS
    property_types, users, properties, favourites, reviews CASCADE`;

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
};

const tables = [create.propertyTypes, create.users, create.properties, create.favourites, create.reviews];

const insertPropertyTypes = format("INSERT INTO property_types (property_type, description) VALUES %L RETURNING *;", formatData(propertyTypesData));

const insertUsers = format("INSERT INTO users (first_name, surname, email, phone_number, role, avatar) VALUES %L RETURNING *;", formatData(usersData));

const usersKey = (user) => `${user.first_name} ${user.surname}`;

const insertProperties = async (usersRef) => {
  const queryString = "INSERT INTO properties (name, property_type, location, price_per_night, description, host_id) VALUES %L RETURNING *;";
  const propertiesWithHostId = mapData(propertiesData, usersRef, "host_id", "host_name");
  const values = formatData(propertiesWithHostId);
  return db.query(format(queryString, values));
};

const propertiesKey = (prop) => prop.name;

const insertFavourites = async (usersRef, propsRef) => {
  const queryString = "INSERT INTO favourites (guest_id, property_id) VALUES %L RETURNING *";
  const WithGuestId = mapData(favouritesData, usersRef, "guest_id", "guest_name");
  const withGuestAndPropId = mapData(WithGuestId, propsRef, "property_id", "property_name");
  const values = formatData(withGuestAndPropId);
  return db.query(format(queryString, values));
};

const insertReviews = async (usersRef, propsRef) => {
  const queryString = "INSERT INTO reviews (rating, comment, guest_id, property_id) VALUES %L RETURNING *";
  const withGuestId = mapData(reviewsData, usersRef, "guest_id", "guest_name");
  const withGuestAndPropId = mapData(withGuestId, propsRef, "property_id", "property_name");
  const values = formatData(withGuestAndPropId);
  return db.query(format(queryString, values));
};

module.exports = { dropTables, tables, insertPropertyTypes, insertUsers, usersKey, insertProperties, propertiesKey, insertFavourites, insertReviews };

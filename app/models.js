const format = require("pg-format");
const db = require("../db/connection");
const { selectProperties, addFavourite } = require("./query-strings");

exports.fetchProperties = async (maxprice, minprice, sort = "favourite_count", order = "desc", host_id) => {
  const validSortRegex = /favourite_count|price_per_night/gi;
  const validOrderRegex = /asc|desc/gi;
  if (!sort.match(validSortRegex) && !order.match(validOrderRegex)) {
    return Promise.reject({ status: 400, msg: "Invalid sorting criteria" });
  }
  const queryString = selectProperties(sort, order);
  const properties = await db.query(queryString, [maxprice, minprice, host_id]);
  return properties.rows;
};

exports.insertFavourite = async (guest_id, property_id) => {
  const favourite = await db.query(addFavourite, [guest_id, property_id]);
  return favourite.rows[0];
};

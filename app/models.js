const format = require("pg-format");
const db = require("../db/connection");
const { selectProperties, addFavourite, deleteFavourite, selectSingleProperty, selectReviews, addReview, deleteReview } = require("./query-strings");

exports.fetchProperties = async (maxprice, minprice, sort = "favourite_count", order = "desc", host_id) => {
  const validSortRegex = /favourite_count|price_per_night/gi;
  const validOrderRegex = /asc|desc/gi;
  if (!sort.match(validSortRegex) && !order.match(validOrderRegex)) return Promise.reject({ status: 400, msg: "Invalid sorting criteria" });
  const queryString = selectProperties(sort, order);
  const { rows } = await db.query(queryString, [maxprice, minprice, host_id]);
  return rows;
};

exports.insertFavourite = async (guest_id, property_id) => {
  const { rows } = await db.query(addFavourite, [guest_id, property_id]);
  return rows[0];
};

exports.removeFavourite = async (id) => {
  const { rowCount } = await db.query(deleteFavourite, [id]);
  if (rowCount === 0) return Promise.reject({ status: 400, msg: "Favourite does not exist" });
};

exports.fetchSingleProperty = async (property_id, user_id) => {
  const property = await db.query(selectSingleProperty, [property_id, user_id]);
  if (property.rowCount === 0) return Promise.reject({ status: 400, msg: "Property does not exist" });
  const { favourited } = property.rows[0];
  if (favourited === null) delete property.rows[0].favourited;
  return property.rows[0];
};

exports.fetchReviews = async (id) => {
  const reviews = await db.query(selectReviews, [id]);
  if (reviews.rowCount === 0) return Promise.reject({ status: 400, msg: "Property does not exist" });
  return reviews.rows;
};

exports.insertReview = async (rating, comment, guest_id, id) => {
  const { rows } = await db.query(addReview, [rating, comment, guest_id, id]);
  return rows[0];
};

exports.removeReview = async (id) => {
  const { rowCount } = await db.query(deleteReview, [id]);
  if (rowCount === 0) return Promise.reject({ status: 400, msg: "Review does not exist" });
};

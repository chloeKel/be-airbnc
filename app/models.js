const format = require("pg-format");
const db = require("../db/connection");
const { selectProperties, addFavourite, deleteFavourite, selectSingleProperty, selectReviews, addReview, deleteReview, selectUser, patchUser, checkPropertyExists, selectBookings } = require("./query-strings");

exports.fetchProperties = async (maxprice, minprice, sort = "favourite_count", order = "desc", host_id) => {
  const validSortRegex = /favourite_count|price_per_night/gi;
  const validOrderRegex = /asc|desc/gi;
  if (!sort.match(validSortRegex) && !order.match(validOrderRegex)) return Promise.reject({ status: 400, msg: "Invalid sorting criteria" });
  const queryString = selectProperties(sort, order);
  const { rows } = await db.query(queryString, [maxprice, minprice, host_id]);
  rows.forEach((row) => {
    if (row.image === null) delete row.image;
  });
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

exports.fetchUser = async (id) => {
  const user = await db.query(selectUser, [id]);
  if (user.rowCount === 0) return Promise.reject({ status: 400, msg: "User does not exist" });
  return user.rows[0];
};

exports.editUser = async (first_name, surname, email, phone_number, avatar, id) => {
  const user = await db.query(patchUser, [first_name, surname, email, phone_number, avatar, id]);
  if (user.rowCount === 0) return Promise.reject({ status: 400, msg: "User does not exist" });
  return user.rows[0];
};

exports.fetchBookings = async (id) => {
  const { rowCount } = await db.query(checkPropertyExists, [id]);
  if (rowCount === 0) return Promise.reject({ status: 404, msg: "Property does not exist" });
  const bookings = await db.query(selectBookings, [id]);
  const response = { bookings: bookings.rows, property_id: id };
  if (bookings.rowCount === 0) response.msg = "No bookings for this property";
  return response;
};

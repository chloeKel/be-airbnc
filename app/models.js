const db = require("../db/connection");
const { selectProperties, addFavourite, deleteFavourite, selectSingleProperty, selectReviews, addReview, deleteReview, selectUser, amendUser, checkExists, selectBookings, addBooking, amendBooking, deleteBooking, selectUserBookings } = require("./query-strings");

exports.fetchProperties = async (maxprice, minprice, sort = "favourite_count", order = "desc", host_id) => {
  const validSortRegex = /favourite_count|price_per_night/gi;
  const validOrderRegex = /asc|desc/gi;
  if (!sort.match(validSortRegex) && !order.match(validOrderRegex)) return Promise.reject({ status: 400, msg: "Invalid sorting criteria" });
  const queryString = selectProperties(sort, order);
  const properties = await db.query(queryString, [maxprice, minprice, host_id]);
  properties.rows.forEach((row) => {
    if (row.image === null) delete row.image;
  });
  return properties.rows;
};

exports.insertFavourite = async (guest_id, property_id) => {
  const { rows } = await db.query(addFavourite, [guest_id, property_id]);
  return rows[0];
};

exports.removeFavourite = async (id) => {
  await db.query(deleteFavourite, [id]);
};

exports.fetchSingleProperty = async (property_id, user_id) => {
  const property = await db.query(selectSingleProperty, [property_id, user_id]);
  if (property.rowCount === 0) return Promise.reject({ status: 404, msg: "Oops! This property doesn't exist. Head back to explore more! 🏡✨" });
  const { favourited } = property.rows[0];
  if (favourited === null) delete property.rows[0].favourited;
  return property.rows[0];
};

exports.fetchReviews = async (id) => {
  const checkPropertiesExist = checkExists("properties", "property_id");
  const { rowCount } = await db.query(checkPropertiesExist, [id]);
  if (rowCount === 0) return Promise.reject({ status: 404, msg: "Oops! This property doesn't exist. Head back to explore more! 🏡✨" });
  const { rows } = await db.query(selectReviews, [id]);
  return rows;
};

exports.insertReview = async (rating, comment, guest_id, id) => {
  const { rows } = await db.query(addReview, [rating, comment, guest_id, id]);
  return rows[0];
};

exports.removeReview = async (id) => {
  await db.query(deleteReview, [id]);
};

exports.fetchUser = async (id) => {
  const user = await db.query(selectUser, [id]);
  if (user.rowCount === 0) return Promise.reject({ status: 404, msg: "Oops! This user doesn't exist. Head back to explore more! 🏡✨" });
  return user.rows[0];
};

exports.editUser = async (first_name, surname, email, phone_number, avatar, id) => {
  const user = await db.query(amendUser, [first_name, surname, email, phone_number, avatar, id]);
  return user.rows[0];
};

exports.fetchBookings = async (id) => {
  const checkPropertiesExist = checkExists("properties", "property_id");
  const { rowCount } = await db.query(checkPropertiesExist, [id]);
  if (rowCount === 0) return Promise.reject({ status: 404, msg: "Oops! This property doesn't exist. Head back to explore more! 🏡✨" });
  const bookings = await db.query(selectBookings, [id]);
  const response = { bookings: bookings.rows, property_id: id };
  return response;
};

exports.insertBooking = async (check_in_date, check_out_date, guest_id, property_id) => {
  const { rows } = await db.query(addBooking, [check_in_date, check_out_date, guest_id, property_id]);
  rows[0].msg = "Booking Successful! 🎉";
  return rows[0];
};

exports.editBooking = async (check_in_date, check_out_date, booking_id) => {
  const booking = await db.query(amendBooking, [check_in_date, check_out_date, booking_id]);
  return booking.rows[0];
};

exports.removeBooking = async (id) => {
  await db.query(deleteBooking, [id]);
};

exports.fetchUserBookings = async (id) => {
  const checkUserExists = checkExists("users", "user_id");
  const { rowCount } = await db.query(checkUserExists, [id]);
  if (rowCount === 0) return Promise.reject({ status: 404, msg: "You're almost there! Log in to unlock your bookings and more. Your next adventure is just a click away! ✨🏡" });
  const bookings = await db.query(selectUserBookings, [id]);
  return bookings.rows;
};

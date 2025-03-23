const db = require("../db/connection");
const {
  selectProperties,
  addFavourite,
  deleteFavourite,
  selectReviews,
  addReview,
  deleteReview,
  selectUser,
  amendUser,
  checkExists,
  selectBookings,
  addBooking,
  amendBooking,
  deleteBooking,
  selectUserBookings,
  selectFavourites,
  selectAvgRating,
  selectImages,
  selectHost,
} = require("./query-strings");

exports.fetchProperties = async (guest_id, host_id, minprice, maxprice, sort, order) => {
  const validNums = /\d/g;
  const validSort = /favourite_count|price_per_night/gi;
  const validOrder = /asc|desc/gi;
  if ((guest_id && !guest_id.match(validNums)) || (host_id && !host_id.match(validNums)) || (minprice && !minprice.match(validNums)) || (maxprice && !maxprice.match(validNums))) {
    return Promise.reject({ status: 400, msg: "Oops! One or more inputs are invalid. Numeric input required" });
  }

  if ((sort && !sort.match(validSort)) || (order && !order.match(validOrder))) {
    return Promise.reject({ status: 400, msg: "Invalid sorting criteria" });
  }

  const checkUserExists = checkExists("users", "user_id");

  const { rowCount: guestRowCount } = await db.query(checkUserExists, [guest_id]);
  const { rowCount: hostRowCount } = await db.query(checkUserExists, [host_id]);

  if ((guest_id && guestRowCount === 0) || (host_id && hostRowCount === 0)) {
    return Promise.reject({ status: 404, msg: "Oops! This user doesn't exist. Head back to explore more! 🏡✨" });
  }

  const { rows: properties } = await db.query(selectProperties(guest_id, host_id, minprice, maxprice, sort, order));
  const { rows: images } = await db.query(selectImages());

  const imageRef = images.reduce((acc, img) => {
    acc[img.property_id] = img.images;
    return acc;
  }, {});

  const propsWithImages = properties.map(({ property_id, ...rest }) => {
    return {
      ...rest,
      property_id,
      images: imageRef[property_id],
    };
  });

  return propsWithImages;
};

exports.fetchSingleProperty = async (property_id, user_id) => {
  const validNums = /\d/g;
  if ((user_id && !user_id.match(validNums)) || (property_id && !property_id.match(validNums))) {
    return Promise.reject({ status: 400, msg: "Oops! One or more inputs are invalid. Numeric input required" });
  }

  const checkUserExists = checkExists("users", "user_id");
  const checkPropExists = checkExists("properties", "property_id");

  const { rowCount: userRowCount } = await db.query(checkUserExists, [user_id]);
  const { rowCount: propRowCount } = await db.query(checkPropExists, [property_id]);

  if (user_id && userRowCount === 0) {
    return Promise.reject({ status: 404, msg: "Oops! This user doesn't exist. Head back to explore more! 🏡✨" });
  }

  if (property_id && propRowCount === 0) {
    return Promise.reject({ status: 404, msg: "Oops! This property doesn't exist. Head back to explore more! 🏡✨" });
  }

  const { rows } = await db.query(selectProperties(user_id, null, null, null, null, null, property_id));

  const { rows: images } = await db.query(selectImages(property_id));

  const { rows: host } = await db.query(selectHost, [property_id]);

  const property = rows[0];
  property.images = images[0].images;
  property.host = host[0].host;
  property.host_avatar = host[0].host_avatar;

  return property;
};

exports.fetchFavourites = async (guest_id) => {
  const { rows } = await db.query(selectFavourites, [guest_id]);
  return rows;
};

exports.insertFavourite = async (guest_id, property_id) => {
  const { rows } = await db.query(addFavourite, [guest_id, property_id]);
  return rows[0];
};

exports.removeFavourite = async (favourite_id) => {
  const { rowCount } = await db.query(deleteFavourite, [favourite_id]);
  if (rowCount > 0) return { msg: "Favourite deleted successfully", favourite_id };
};

exports.fetchReviews = async (property_id) => {
  const checkPropertiesExist = checkExists("properties", "property_id");
  const { rowCount } = await db.query(checkPropertiesExist, [property_id]);
  if (rowCount === 0) {
    return Promise.reject({ status: 404, msg: "Oops! This property doesn't exist. Head back to explore more! 🏡✨" });
  }
  const { rows } = await db.query(selectReviews, [property_id]);
  return rows;
};

exports.fetchAvgRating = async (property_id) => {
  const response = await db.query(selectAvgRating, [property_id]);
  if (response.rowCount === 0) {
    return { property_id: id, average_rating: 0 };
  }
  return response.rows;
};

exports.insertReview = async (rating, comment, guest_id, property_id) => {
  const { rows } = await db.query(addReview, [rating, comment, guest_id, property_id]);
  return rows[0];
};

exports.removeReview = async (review_id) => {
  await db.query(deleteReview, [review_id]);
};

exports.fetchUser = async (user_id) => {
  const user = await db.query(selectUser, [user_id]);
  if (user.rowCount === 0) {
    return Promise.reject({ status: 404, msg: "Oops! This user doesn't exist. Head back to explore more! 🏡✨" });
  }
  return user.rows[0];
};

exports.editUser = async (first_name, surname, email, phone_number, avatar, user_id) => {
  const user = await db.query(amendUser, [first_name, surname, email, phone_number, avatar, user_id]);
  return user.rows[0];
};

exports.fetchBookings = async (property_id) => {
  const checkPropertiesExist = checkExists("properties", "property_id");
  const { rowCount } = await db.query(checkPropertiesExist, [property_id]);
  if (rowCount === 0) {
    return Promise.reject({ status: 404, msg: "Oops! This property doesn't exist. Head back to explore more! 🏡✨" });
  }
  const bookings = await db.query(selectBookings, [property_id]);
  const response = { bookings: bookings.rows, property_id: property_id };
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

exports.removeBooking = async (booking_id) => {
  await db.query(deleteBooking, [booking_id]);
};

exports.fetchUserBookings = async (user_id) => {
  const checkUserExists = checkExists("users", "user_id");
  const { rowCount } = await db.query(checkUserExists, [user_id]);
  if (rowCount === 0) {
    return Promise.reject({ status: 404, msg: "You're almost there! Log in to unlock your bookings and more. Your next adventure is just a click away! ✨🏡" });
  }
  const bookings = await db.query(selectUserBookings, [user_id]);
  return bookings.rows;
};

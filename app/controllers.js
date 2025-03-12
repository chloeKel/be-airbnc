const { fetchProperties, insertFavourite, removeFavourite, fetchSingleProperty, fetchReviews, insertReview, removeReview, fetchUser, editUser, fetchBookings, insertBooking, editBooking, removeBooking, fetchUserBookings, fetchFavourites, fetchAvgRating } = require("./models");

exports.getProperties = async (req, res, next) => {
  try {
    const { user_id, maxprice, minprice, sort, order, host_id } = req.query;
    const properties = await fetchProperties(user_id, maxprice, minprice, sort, order, host_id);
    res.send({ properties });
    return properties;
  } catch (error) {
    next(error);
  }
};

exports.getFavourites = async (req, res, next) => {
  try {
    const { id } = req.params;
    const favourites = await fetchFavourites(id);
    res.send({ favourites });
  } catch (error) {
    next(error);
  }
};

exports.postFavourite = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { guest_id } = req.body;
    const favourite = await insertFavourite(guest_id, id);
    res.status(201).send({ msg: "Property favourited successfully", favourite_id: favourite.favourite_id });
  } catch (error) {
    next(error);
  }
};

exports.deleteFavourite = async (req, res, next) => {
  try {
    const { id } = req.params;
    await removeFavourite(id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

exports.getSingleProperty = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { user_id } = req.query;
    const property = await fetchSingleProperty(id, user_id);
    res.send({ property });
  } catch (error) {
    next(error);
  }
};

exports.getReviews = async (req, res, next) => {
  try {
    const { id } = req.params;
    const reviews = await fetchReviews(id);
    if (reviews.length === 0) {
      return res.status(204).send({ reviews, average_rating: 0 });
    } else {
      const response = await fetchAvgRating(id);
      const avg = response.reduce((acc, row) => {
        acc["average_rating"] = row.average_rating;
        return acc;
      }, {});
      res.send({ reviews, average_rating: Number(avg.average_rating) });
    }
  } catch (error) {
    next(error);
  }
};

exports.postReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rating, comment, guest_id } = req.body;
    const review = await insertReview(rating, comment, guest_id, id);
    res.status(201).send(review);
  } catch (error) {
    next(error);
  }
};

exports.deleteReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    await removeReview(id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

exports.getUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await fetchUser(id);
    res.send({ user });
  } catch (error) {
    next(error);
  }
};

exports.patchUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { first_name, surname, email, phone_number, avatar } = req.body;
    const user = await editUser(first_name, surname, email, phone_number, avatar, id);
    res.send(user);
  } catch (error) {
    next(error);
  }
};

exports.getBookings = async (req, res, next) => {
  try {
    const { id } = req.params;
    const bookings = await fetchBookings(id);
    res.send(bookings);
  } catch (error) {
    next(error);
  }
};

exports.postBooking = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { check_in_date, check_out_date, guest_id } = req.body;
    const booking = await insertBooking(check_in_date, check_out_date, guest_id, id);
    res.status(201).send(booking);
  } catch (error) {
    next(error);
  }
};

exports.patchBooking = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { check_in_date, check_out_date } = req.body;
    const booking = await editBooking(check_in_date, check_out_date, id);
    res.send(booking);
  } catch (error) {
    next(error);
  }
};

exports.deleteBooking = async (req, res, next) => {
  try {
    const { id } = req.params;
    await removeBooking(id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

exports.getUserBookings = async (req, res, next) => {
  try {
    const { id } = req.params;
    const bookings = await fetchUserBookings(id);
    res.send({ bookings });
  } catch (error) {
    next(error);
  }
};

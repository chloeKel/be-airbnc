const express = require("express");
const cors = require("cors");
const app = express();
const { getProperties, postFavourite, deleteFavourite, getSingleProperty, getReviews, postReview, deleteReview, getUser, patchUser, getBookings, postBooking, patchBooking, deleteBooking, getUserBookings, getFavourites } = require("./controllers");
const { handlePathNotFound, handleMethodNotAllowed, handleBadRequests } = require("./errors");

app.use(cors());
app.use(express.json());

app.route("/api/properties").get(getProperties).all(handleMethodNotAllowed);

app.route("/api/properties/:id/favourite").post(postFavourite).all(handleMethodNotAllowed);

app.route("/api/favourites/:id").get(getFavourites).delete(deleteFavourite).all(handleMethodNotAllowed);

app.route("/api/properties/:id").get(getSingleProperty).all(handleMethodNotAllowed);

app.route("/api/properties/:id/reviews").get(getReviews).post(postReview).all(handleMethodNotAllowed);

app.route("/api/reviews/:id").delete(deleteReview).all(handleMethodNotAllowed);

app.route("/api/users/:id").get(getUser).patch(patchUser).all(handleMethodNotAllowed);

app.route("/api/properties/:id/bookings").get(getBookings).all(handleMethodNotAllowed);

app.route("/api/properties/:id/booking").post(postBooking).all(handleMethodNotAllowed);

app.route("/api/bookings/:id").patch(patchBooking).delete(deleteBooking).all(handleMethodNotAllowed);

app.route("/api/users/:id/bookings").get(getUserBookings).all(handleMethodNotAllowed);

app.all("/*", handlePathNotFound);
app.use(handleBadRequests);

module.exports = app;

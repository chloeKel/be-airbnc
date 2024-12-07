const express = require("express");
const app = express();
const { getProperties, postFavourite, deleteFavourite, getSingleProperty } = require("./controllers");
const { handlePathNotFound, handleMethodNotAllowed, handleBadRequests } = require("./errors");

app.use(express.json());

app.route("/api/properties").get(getProperties).all(handleMethodNotAllowed);

app.route("/api/properties/:id/favourite").post(postFavourite).all(handleMethodNotAllowed);

app.route("/api/favourites/:id").delete(deleteFavourite).all(handleMethodNotAllowed);

app.route("/api/properties/:id").get(getSingleProperty).all(handleMethodNotAllowed);

app.all("/*", handlePathNotFound);
app.use(handleBadRequests);

module.exports = app;

const express = require("express");
const app = express();
const { getProperties, postFavourite } = require("./controllers");
const { handlePathNotFound, handleMethodNotAllowed, handleBadRequests } = require("./errors");

app.use(express.json());

app.route("/api/properties").get(getProperties).all(handleMethodNotAllowed);

app.route("/api/properties/:id/favourite").post(postFavourite).all(handleMethodNotAllowed);

app.all("/*", handlePathNotFound);
app.use(handleBadRequests);

module.exports = app;

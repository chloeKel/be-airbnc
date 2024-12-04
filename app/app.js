const express = require("express");
const app = express();
const { getProperties } = require("./controllers");
const { handlePathNotFound, handleMethodNotAllowed, handleBadRequests, handleCustomErrors } = require("./errors");

app.use(express.json());
app.route("/api/properties").get(getProperties).all(handleMethodNotAllowed);
app.all("/*", handlePathNotFound);
app.use(handleCustomErrors);
app.use(handleBadRequests);

module.exports = app;

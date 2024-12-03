const express = require("express");
const app = express();
const { getProperties } = require("./controllers");
const { handlePathNotFound, handleMethodNotAllowed, handleBadRequests } = require("./errors");

app.use(express.json());
app.route("/api/properties").get(getProperties).all(handleMethodNotAllowed);
app.use("/api/properties", handleBadRequests);
app.all("/*", handlePathNotFound);

module.exports = app;

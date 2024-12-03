const db = require("./connection");
const { seed } = require("./seed");

seed().then(() => db.end());

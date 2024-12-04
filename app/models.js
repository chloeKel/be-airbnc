const format = require("pg-format");
const db = require("../db/connection");
const { selectProperties } = require("./query-strings");

exports.fetchProperties = async (maxprice, minprice) => {
  const properties = await db.query(selectProperties, [maxprice, minprice]);
  return properties.rows;
};

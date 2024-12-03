const format = require("pg-format");
const db = require("../db/connection");
const { selectProperties } = require("./query-strings");

exports.fetchProperties = async (maxprice) => {
  const properties = await db.query(selectProperties, [maxprice]);
  return properties.rows;
};

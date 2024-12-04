const format = require("pg-format");
const db = require("../db/connection");
const { selectProperties } = require("./query-strings");
const { validateColumns } = require("../utils");

exports.fetchProperties = async (maxprice, minprice, sort = "favourite_count", order = "desc", host_id) => {
  await validateColumns("sort", sort);
  await validateColumns("order", order);
  const queryString = selectProperties(sort, order);
  const properties = await db.query(queryString, [maxprice, minprice, host_id]);
  return properties.rows;
};

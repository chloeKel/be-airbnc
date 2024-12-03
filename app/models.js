const db = require("../db/connection");
const { selectProperties } = require("./query-strings");

exports.fetchProperties = async () => {
  const properties = await db.query(selectProperties);
  return properties.rows;
};

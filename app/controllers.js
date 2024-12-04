const { fetchProperties } = require("./models");

exports.getProperties = async (req, res, next) => {
  try {
    const { maxprice, minprice, sort, order, host_id } = req.query;
    const properties = await fetchProperties(maxprice, minprice, sort, order, host_id);
    res.send({ properties });
  } catch (error) {
    next(error);
  }
};

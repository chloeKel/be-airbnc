const { fetchProperties } = require("./models");

exports.getProperties = async (req, res, next) => {
  try {
    const { maxprice, minprice } = req.query;
    const properties = await fetchProperties(maxprice, minprice);
    res.send({ properties });
  } catch (error) {
    next(error);
  }
};

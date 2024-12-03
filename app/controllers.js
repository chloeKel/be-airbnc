const { fetchProperties } = require("./models");

exports.getProperties = async (req, res, next) => {
  try {
    const { maxprice } = req.query;
    const properties = await fetchProperties(maxprice);
    res.send({ properties });
  } catch (error) {
    next(error);
  }
};

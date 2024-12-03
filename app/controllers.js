const { fetchProperties } = require("./models");

exports.getProperties = async (req, res, next) => {
  try {
    const properties = await fetchProperties();
    res.send({ properties });
  } catch (error) {
    next(error);
  }
};

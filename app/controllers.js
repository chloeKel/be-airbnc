const { fetchProperties } = require("./models");

exports.getProperties = async (req, res) => {
  try {
    const data = await fetchProperties();
    const properties = data.map(({ property_id, name, location, price_per_night, host }) => {
      return { property_id, property_name: name, location, price_per_night, host };
    });
    res.send({ properties });
  } catch (error) {
    next(error);
  }
};

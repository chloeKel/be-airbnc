const { fetchProperties, insertFavourite, removeFavourite, fetchSingleProperty } = require("./models");

exports.getProperties = async (req, res, next) => {
  try {
    const { maxprice, minprice, sort, order, host_id } = req.query;
    const properties = await fetchProperties(maxprice, minprice, sort, order, host_id);
    res.send({ properties });
    return properties;
  } catch (error) {
    next(error);
  }
};

exports.postFavourite = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { guest_id } = req.body;
    const favourite = await insertFavourite(guest_id, id);
    res.status(201).send({ msg: "Property favourited successfully", favourite_id: favourite.favourite_id });
  } catch (error) {
    next(error);
  }
};

exports.deleteFavourite = async (req, res, next) => {
  try {
    const { id } = req.params;
    await removeFavourite(id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

exports.getSingleProperty = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { user_id } = req.query;
    const property = await fetchSingleProperty(id, user_id);
    res.send({ property });
  } catch (error) {
    next(error);
  }
};

const db = require("./connection");
const { createRef } = require("../utils");
const { dropTables, create, insertPropertyTypes, insertUsers, usersKey, insertProperties, propertiesKey, insertFavourites, insertReviews } = require("./manage-queries");

exports.seed = async () => {
  try {
    await db.query(dropTables);

    await db.query(create.propertyTypes);
    await db.query(create.users);
    await db.query(create.properties);
    await db.query(create.favourites);
    await db.query(create.reviews);

    await db.query(insertPropertyTypes);
    const users = await db.query(insertUsers);
    const usersRef = createRef(users.rows, usersKey, "user_id");
    const properties = await insertProperties(usersRef);
    const propsRef = createRef(properties.rows, propertiesKey, "property_id");
    await insertFavourites(usersRef, propsRef);
    await insertReviews(usersRef, propsRef);
  } catch (error) {
    throw error;
  }
};

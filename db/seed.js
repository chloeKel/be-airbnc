const db = require("./connection");
const { createRef } = require("../utils");
const { dropTables, tables, insertPropertyTypes, insertUsers, usersKey, insertProperties, propertiesKey, insertFavourites, insertReviews } = require("./manage-queries");

exports.seed = async () => {
  try {
    await db.query(dropTables);

    for (const table of tables) {
      await db.query(table);
    }

    await db.query(insertPropertyTypes);

    const users = await db.query(insertUsers);
    const usersRef = createRef(users.rows, usersKey, "user_id");

    const insertPropertiesQuery = await insertProperties(usersRef);
    const properties = await db.query(insertPropertiesQuery);
    const propsRef = createRef(properties.rows, propertiesKey, "property_id");

    const insertFavouritesQuery = await insertFavourites(usersRef, propsRef);
    await db.query(insertFavouritesQuery);

    const insertReviewsQuery = await insertReviews(usersRef, propsRef);
    await db.query(insertReviewsQuery);
  } catch (error) {
    throw error;
  }
};

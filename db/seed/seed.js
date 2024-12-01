const db = require("../connection");
const { createRef } = require("../db-utils");
const { dropTables, tables, insertPropertyTypes, insertUsers, usersKey, insertProperties, propertiesKey, insertFavourites, insertReviews } = require("./manage-queries");

const seed = async () => {
  try {
    await db.query(dropTables);

    for (const table of tables) {
      await db.query(table);
    }
    await db.query(insertPropertyTypes);
    const users = await db.query(insertUsers);
    const usersRef = createRef(users.rows, usersKey, "user_id");
    const properties = await insertProperties(usersRef);
    const propsRef = createRef(properties.rows, propertiesKey, "property_id");
    await insertFavourites(usersRef, propsRef);
    await insertReviews(usersRef, propsRef);

    await db.end();
  } catch (error) {
    throw new Error(`Error seeding database: ${error}`);
  }
};

seed();

const db = require("./connection");
const { createRef } = require("../utils");
const { dropTables, create, insertPropertyTypes, insertUsers, usersKey, insertProperties, propertiesKey, insertFavourites, insertReviews } = require("./manage-queries");

const seed = async () => {
  try {
    await db.query(dropTables);
    console.log("dropped tables");

    await db.query(create.propertyTypes);
    console.log("created property types");
    await db.query(create.users);
    console.log("created users");
    await db.query(create.properties);
    console.log("created properties");
    await db.query(create.favourites);
    console.log("created favourites");
    await db.query(create.reviews);
    console.log("created reviews");

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

seed();

module.exports = seed;

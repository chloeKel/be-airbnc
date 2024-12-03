const db = require("../db/connection");
const { usersKey } = require("../db/manage-queries");
const { createRef } = require("../utils");
const { properties, favourites, allUsers } = require("./query-strings");

exports.fetchProperties = async () => {
  const props = await db.query(properties);
  const faves = await db.query(favourites);
  const users = await db.query(allUsers);

  const propsWithFaves = props.rows.map((item) => {
    const fave = faves.rows.find((fave) => fave.property_id === item.property_id);
    const usersRef = createRef(users.rows, usersKey, "user_id");
    item.favourites = fave ? Number(fave.favourite_count) : 0;
    item.host = Object.keys(usersRef).find((name) => usersRef[name] === item.host_id);
    return item;
  });
  return propsWithFaves.sort((a, b) => b.favourites - a.favourites);
};

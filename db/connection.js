const { Pool } = require("pg");

const path = `${__dirname}/../.env.test`;
//const ENV = process.env.NODE_ENV;
// const path = `${__dirname}/../.env.${ENV}`;

require("dotenv").config({ path });

if (!process.env.PGDATABASE) {
  throw new Error("PGDATABASE not set");
}

const db = new Pool();

console.log("connected to:", process.env.PGDATABASE);
module.exports = db;

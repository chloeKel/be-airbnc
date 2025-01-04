// const { Pool } = require("pg");

// const path = `${__dirname}/../.env.test`;

// require("dotenv").config({ path });

// if (!process.env.PGDATABASE) {
//   throw new Error("PGDATABASE not set");
// }

// const db = new Pool();

// module.exports = db;

const { Pool } = require("pg");

const path = `${__dirname}/../.env.test`;
//const ENV = process.env.NODE_ENV;
// const path = `${__dirname}/../.env.${ENV}`;

const ENV = process.env.NODE_ENV || "development";
if (!process.env.PGDATABASE && !process.env.DATABASE_URL) {
  throw new Error("PGDATABASE or DATABASE_URL not set");
}

const config = {};

if (ENV === "production") {
  config.connectionString = process.env.DATABASE_URL;
  config.max = 2;
}

require("dotenv").config({ path });

if (!process.env.PGDATABASE) {
  throw new Error("PGDATABASE not set");
}

const db = new Pool();

module.exports = db;

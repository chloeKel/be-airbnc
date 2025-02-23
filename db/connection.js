const { Pool } = require("pg");

const ENV = process.env.NODE_ENV || "development";
const path = `${__dirname}/../.env.${ENV}`;
require("dotenv").config({ path });

if (!process.env.PGDATABASE && !process.env.DATABASE_URL) {
  throw new Error("PGDATABASE or DATABASE_URL not set");
}

const config = {};

if (ENV === "production") {
  config.connectionString = process.env.DATABASE_URL;
  config.max = 2;
  config.ssl = {
    rejectUnauthorized: false,
  };
  config.host = process.env.DATABASE_HOST || "0.0.0.0";
}

const db = new Pool(config);

module.exports = db;

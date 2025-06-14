import pkg from "pg";
const { Pool } = pkg;

const pgPool = new Pool({
  connectionString: process.env.PG_CONNECTION_STRING,
  ssl: {
    rejectUnauthorized: false,
  },
});

export default pgPool;
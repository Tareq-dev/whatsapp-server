const mysql = require("mysql2");
const dotenv = require("dotenv");

dotenv.config();
const db = mysql.createPool({
  host: process.env.host,
  user: process.env.user,
  password: process.env.password,
  database: process.env.database,
  port: 3306,
});

// For pool initialization, see above
db.getConnection(function (err, conn) {
  if (err) throw err;
  console.log("Successfully connect to the database.");

  db.releaseConnection(conn);
});

module.exports = db;

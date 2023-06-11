const mysql = require("mysql2");
const dotenv = require("dotenv");

dotenv.config();
// const db = mysql.createPool({
//   host: "127.0.0.1",
//   user: "root",
//   password: "",
//   database: "whatsbulk",
// });
const db = mysql.createPool({
  host: process.env.host,
  user: process.env.user,
  password: process.env.password,
  database: process.env.database,
  port: 3306,
});

// db.getConnection(function (err, conn) {
//   conn.release();
//   if (err) {
//     console.log(err);
//   }
//   console.log("Successfully connect to the database.");
//   // db.releaseConnection(conn);
//   console.log(conn);
// });

db.getConnection(function (err, connection) {
  if (err) {
    console.log(err);
  } // not connected!

  // Use the connection
  connection.query(
    "SELECT email FROM register",
    function (error, results, fields) {
      // When done with the connection, release it.
      console.log("Successfully connect to the database.");
      connection.release();

      // Handle error after the release.
      if (error) throw error;

      // Don't use the connection here, it has been returned to the pool.
    }
  );
});

module.exports = db;

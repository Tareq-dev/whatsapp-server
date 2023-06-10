const db = require("../config/db.js");

module.exports.makeAdmin = async (req, res) => {
  const email = req.params.email;

  // Update the user role to "admin" in the database
  db.query(
    "UPDATE register SET role = ? WHERE  email = ?",
    ["admin", email],
    (error, results) => {
      if (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
      } else {
        res.send("User has been made an admin");
      }
    }
  );
};

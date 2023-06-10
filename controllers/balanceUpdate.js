const db = require("../config/db.js");

module.exports.balanceUpdate = async (req, res) => {
  const message = req.params.message;
  const email = req.params.email;
  console.log(message, email);
  // Update the user role to "admin" in the database
  db.query(
    "UPDATE register SET message = ? WHERE  email = ?",
    [message, email],
    (error, results) => {
      console.log(error, results);
      if (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
      } else {
        res.send("Balance updated Successfully");
      }
    }
  );
};

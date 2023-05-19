const db = require("../config/db.js");

module.exports.user = async (req, res) => {
  const email = req.query.email;
  const q = "SELECT * FROM register WHERE email = ?";
  db.query(q, [email], (error, data) => {
    const result = {
      email: data[0].email,
      message: data[0].message,
    };
    res.send(result);
  });
};

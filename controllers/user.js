const db = require("../config/db.js");

module.exports.user = async (req, res) => {
  const email = req.params?.email;
  const q = "SELECT * FROM register WHERE email = ?";
  db.query(q, [email], (error, data) => {
    const result = {
      email: data[0]?.email,
      message: data[0]?.message,
      role: data[0]?.role,
    };
    res.send(result);
  });
};

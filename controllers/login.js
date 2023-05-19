const db = require("../config/db.js");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

module.exports.login = async (req, res) => {
  const q = "SELECT * FROM register WHERE email = ?";
  try {
    db.query(q, [req.body.email], (error, data) => {
      if (error) return res.json(error);

      if (data.length === 0)
        return res.status(404).json({ status: 0, message: "User not found!" });

      // CHECK PASSWORD
      const salt = bcrypt.genSaltSync(10);
      const hashedPassword = bcrypt.hashSync(req.body.password, salt);
      const isPasswordCorrect = bcrypt.compareSync(
        req.body.password,
        data[0].password
      );
      9;
      if (!isPasswordCorrect) {
        return res.status(400).json({ status: 0, message: "Wrong Password!" });
      }

      const token = jwt.sign({ id: data[0].id }, "jwtkey");
      const { password, ...rest } = data[0];

      res
        .cookie("access_token", token, {
          httpOnly: true,
        })
        .status(200)
        .json({ status: 1, data: rest, message: "Login successful!" });
    });
  } catch (error) {
    console.log(error);
  }
};

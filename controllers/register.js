const db = require("../config/db.js");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

module.exports.register = async (req, res, next) => {
  try {
    const q = "SELECT * FROM register WHERE email = ?";
    db.query(q, [req.body.email], (error, data) => {
      if (error) return res.json(error);
      if (data.length)
        return res
          .status(422)
          .json({ status: 0, message: "User already exists!" });
      // Hash the password and create a user
      const salt = bcrypt.genSaltSync(10);
      const hashedPassword = bcrypt.hashSync(req.body.password, salt);
      // return false;
      const q = "INSERT INTO register (email, message, password) VALUES (?)";
      const values = [req.body.email, req.body.message, hashedPassword];
      db.query(q, [values], (error, data) => {
        // console.log("data", data);
        if (error) return res.json(error);
        const query = "SELECT * FROM register WHERE id = ?";
        db.query(query, [data.insertId], (error, signInData) => {
          if (error) return res.json(error);
          const token = jwt.sign({ id: signInData[0].id }, "jwtkey");
          const { password, ...rest } = signInData[0];
          return res
            .cookie("access_token", token, {
              httpOnly: true,
            })
            .status(200)
            .json({ status: 1, data: rest, message: "User has been created!" });
        });
      });
    });
  } catch (error) {
    next(error);
  }
};

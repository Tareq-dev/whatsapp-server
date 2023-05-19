const nodemailer = require("nodemailer");
const db = require("../config/db");
const randomstring = require("randomstring");
const bcrypt = require("bcryptjs");

const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.email,
    pass: process.env.email_pass,
  },
});
const resetPasswordMessage = (req, res) => {
  const { email } = req.body;
  const token = randomstring.generate();

  const resetLink = `http://localhost:3000/reset/${token}`;

  const mailOptions = {
    from: "tarequl.islalm@gmail.com",
    to: `${email}`,
    subject: "Password Reset Request",
    html: `<p>You requested a password reset for your account. Click the link below to reset your password:</p><p><a href="${resetLink}">${resetLink}</a></p>`,
  };
  db.query(
    "SELECT * FROM register where email = ? limit 1",
    email,
    function (err, data) {
      if (err) {
        return res.status(400).json({ message: err });
      }
      if (data.length > 0) {
        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            console.log(error);
          }
          if (info.response) {
            console.log("Email sent: " + info.response);
          }
        });
        db.query(`DELETE FROM password_reset  where email=${db.escape(email)}`);
        db.query(
          `INSERT INTO password_reset (email, token) VALUES(${db.escape(
            email
          )},'${token}')`
        );

        return res
          .status(200)
          .json({ status: 1, message: "Mail sent Successfuly" });
      }
      return res.status(201).json({ status: 0, message: "Email not exist" });
    }
  );
};

const resetPasswordReq = (req, res) => {
  const data = req.body.resetData;
  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync(data?.newPassword, salt);
  db.query(`DELETE FROM password_reset where email=' ${data?.email}'`);
  const query = `SELECT * FROM register WHERE email = ?`;

  db.query(query, [data.email], (error, result) => {
    if (error) {
      console.log(error);
    } else {
      db.query(
        `UPDATE register SET password = '${hash}' where id=' ${result[0].id}'`
      );
      res
        .status(200)
        .json({ status: 1, message: "Password reset successfully" });
    }
  });
};

module.exports = { resetPasswordMessage, resetPasswordReq };

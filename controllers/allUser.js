const db = require("../config/db.js");

module.exports.allUser = async (req, res) => {
  const query = "SELECT * FROM register";
  db.query(query, (error, results) => {
    if (error) {
      console.error("Error executing query: ", error);
      return;
    }
    const extractedData = results.map((user) => {
      return {
        email: user.email,
        message: user.message,
        role: user.role,
      };
    });
    res.status(200).json({ success: true, data: extractedData });
  });
};

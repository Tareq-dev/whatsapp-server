const db = require("../config/db.js");

module.exports.session = async (req, res) => {
  const { user_number } = req.params;

  const q = "SELECT * FROM sessions WHERE user_number = ?";
  db.query(q, [user_number], (error, data) => {
    const result = {
      sessionId: data[0]?.sessionId,
    };
    res.send(result);
  });
};

const { client } = require("../config/whatsapp_config");

module.exports.logout = async (req, res) => {
  const { role } = req.body;
  if (role === "admin") {
    res.status(200).json({ status: 1, message: "Logout successful!" });
  } else {
    await client.logout();
    res.status(200).json({ status: 1, message: "Logout successful!" });
  }
};

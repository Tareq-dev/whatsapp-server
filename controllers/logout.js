const { client } = require("../config/whatsapp_config");

module.exports.logout = async (req, res) => {
  res.status(200).json({ status: 1, message: "Logout successful!" });
  await client.logout();
};

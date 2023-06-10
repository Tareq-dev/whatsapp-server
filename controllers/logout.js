const { client } = require("../config/whatsapp_config");

module.exports.logout = async (req, res) => {
  // await client.logout();
  res
    .clearCookie("access_token")
    .status(200)
    .json({ status: 1, message: "Logout successful!" });
};

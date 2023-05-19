module.exports.logout = async (req, res) => {
  res
    .clearCookie("access_token")
    .status(200)
    .json({ status: 1, message: "Logout successful!" });
};

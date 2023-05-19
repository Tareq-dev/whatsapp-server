const express = require("express");
const { register } = require("../controllers/register");
const { login } = require("../controllers/login");
const { sendMessage } = require("../controllers/sendMessage");
const { sendMedia } = require("../controllers/sendMedia");
const { logout } = require("../controllers/logout");
const { user } = require("../controllers/user");
const { resetPasswordMessage, resetPasswordReq } = require("../controllers/resetPass");
const router = express.Router();

router.get("/user", user);
router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.post("/send-message", sendMessage);
router.post("/send-media", sendMedia);
router.post("/reset", resetPasswordMessage);
router.post("/reset-password", resetPasswordReq);

module.exports = router;

const { Client, LocalAuth, MessageMedia } = require("whatsapp-web.js");

//adding no-sandbox for railway deploy
const client = new Client({
  authStrategy: new LocalAuth(),
  webVersionCache: {
    type: "remote",
    remotePath:
      "https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2332.15.html",
  },
  puppeteer: {
    args: ["--no-sandbox"],
  },
});
module.exports = { client, MessageMedia, LocalAuth };

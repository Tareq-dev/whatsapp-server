const { Client, LocalAuth, MessageMedia } = require("whatsapp-web.js");

const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    args: ["--no-sandbox"],
  },
});

module.exports = { client, MessageMedia, LocalAuth };

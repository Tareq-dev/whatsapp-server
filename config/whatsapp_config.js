const { Client, LocalAuth, MessageMedia } = require("whatsapp-web.js");

const client = new Client({ authStrategy: new LocalAuth() });

module.exports = { client, MessageMedia, LocalAuth };

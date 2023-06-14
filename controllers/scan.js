const { client } = require("../config/whatsapp_config.js");

module.exports.scan = async (req, res) => {
  client.on("qr", (qr) => {
    console.log(qr);
    if (qr) {
      res.send({ qr: qr });
    }
  });
};

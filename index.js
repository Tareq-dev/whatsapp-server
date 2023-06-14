const express = require("express");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");
const fileUpload = require("express-fileupload");
const router = require("./routes/routes.js");
const { client } = require("./config/whatsapp_config.js");
const { ably } = require("./config/realtimeAbly.js");

// http://localhost:3000
//https://whatsbulk-self.vercel.app
// url
app.use(
  cors({
    origin: "https://whatsbulk-self.vercel.app",
    credentials: true,
  })
);

app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(fileUpload());
app.use("/api", router);

const port = process.env.PORT || 5000;

const channel = ably.channels.get("scan");
const channel1 = ably.channels.get("my-whatapp");
const channel2 = ably.channels.get("session");
const channel3 = ably.channels.get("user");

client.on("qr", (qr) => {
  // console.log(qr);
  channel.publish("qr", qr);
});

client.on("ready", () => {
  console.log("client is ready");
  const user = {
    user_number: client.info.me.user,
    user_name: client.info.pushname,
  };

  channel1.publish("client-ready", "Client is ready!");
  channel3.publish("user", user);
});

client.initialize();

app.get("/", (req, res) => {
  res.send("Hello World of whatsbulk");
});

app.listen(port, () => {
  console.log(`listening on port ${port}`);
});

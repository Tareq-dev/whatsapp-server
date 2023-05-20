const express = require("express");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");
const Ably = require("ably");
const fileUpload = require("express-fileupload");
const router = require("./routes/routes.js");
const { client } = require("./config/whatsapp_config.js");
// http://localhost:3000
//https://whatsbulk-self.vercel.app
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(fileUpload());
app.use("/api", router);

const port = process.env.PORT || 5000;

const ably = new Ably.Realtime(
  "VSU5GA.7M4Y5Q:4Tok9TlkaNq5T8u5dKnJ42pu3oZrH0GYqKpkNPVqsHE"
);
const channel = ably.channels.get("scan");
const channel1 = ably.channels.get("my-whatapp");
const channel2 = ably.channels.get("loading-messages");
const channel3 = ably.channels.get("user");

client.on("qr", (qr) => {
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
  res.send("Hello World of ph");
});

app.listen(port, () => {
  console.log(`listening on port ${port}`);
});

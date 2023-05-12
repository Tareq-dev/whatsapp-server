const express = require("express");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");
const Ably = require("ably");

const { Client, LocalAuth } = require("whatsapp-web.js");
const fileUpload = require("express-fileupload");

app.use(cors());
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(fileUpload());

const port = process.env.PORT || 5000;

const client = new Client({ authStrategy: new LocalAuth() });

const ably = new Ably.Realtime(
  "VSU5GA.7M4Y5Q:4Tok9TlkaNq5T8u5dKnJ42pu3oZrH0GYqKpkNPVqsHE"
);
const channel1 = ably.channels.get("my-whatapp");

app.get("/scan", (req, res) => {
  res.send({
    data: {
      id: 1,
      name: "tareq",
    },
  });
  // client.on("qr", (qr) => {
  //   res.send({ QCode: qr });
  // });
});

client.on("ready", () => {
  console.log("client is ready");
  channel1.publish("client-ready", "Client is ready!");
});

client.initialize();

app.get("/", (req, res) => {
  res.send("Hello World of ph");
});

app.listen(port, () => {
  console.log(`listening on port ${port}`);
});

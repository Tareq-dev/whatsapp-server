const express = require("express");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");
const fileUpload = require("express-fileupload");
const router = require("./routes/routes.js");
const { client } = require("./config/whatsapp_config.js");
// const { Client, LocalAuth } = require("whatsapp-web.js");
const { ably } = require("./config/realtimeAbly.js");
const db = require("./config/db.js");
// http://localhost:3000
//https://whatsbulk-self.vercel.app
// url
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

// const client = new Client({
//   authStrategy: new LocalAuth(),
//   puppeteer: {
//     args: ["--no-sandbox"],
//   },
// });
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

  const query = "SELECT sessionId FROM sessions WHERE user_number = ?";
  db.query(query, [user.user_number], (err, results) => {
    if (err) {
      console.error(
        "Error retrieving session ID from the sessions table:",
        err
      );
      return;
    }

    // If the session ID doesn't exist for the user, insert it
    if (results.length === 0) {
      const sessionId = generateRandomCode();
      const insertQuery =
        "INSERT INTO sessions (sessionId, user_number) VALUES (?, ?)";
      db.query(
        insertQuery,
        [sessionId, user.user_number],
        (err, insertResult) => {
          if (err) {
            console.error(
              "Error inserting session ID into the sessions table:",
              err
            );
            return;
          }
          console.log("sessionId inserted successfully");
        }
      );
    }
  });

  channel1.publish("client-ready", "Client is ready!");
  channel3.publish("user", user);
});

client.initialize();
const generateRandomCode = () => {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let randomCode = "";

  for (let i = 0; i < 6; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    randomCode += characters[randomIndex];
  }

  return randomCode;
};

app.get("/", (req, res) => {
  res.send("Hello World of whatsbulk");
});

app.listen(port, () => {
  console.log(`listening on port ${port}`);
});

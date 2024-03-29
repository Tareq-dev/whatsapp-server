const db = require("../config/db.js");
const csv = require("csv-express");
const { client, MessageMedia } = require("../config/whatsapp_config.js");
const { ably, msgCount } = require("../config/realtimeAbly.js");
const channel2 = ably.channels.get("loading-messages");

const makingCsv = (Registered, Unregistered, res) => {
  const csvData = [
    ["Mobile No", "Status", "Reason"],
    ...Registered.map((r) => r.split(",")),
    ...Unregistered.map((r) => r.split(",")),
  ];
  const fileName = `${client.info.me.user}-${client.info.pushname}.csv`;
  res.attachment(fileName);
  res.csv(csvData);
};
const checkRegisteredNumber = async function (number) {
  const isRegistered = await client.isRegisteredUser(number);
  return isRegistered;
};
const sendMessageWithMediaByCount = (res, email, chatId, media, text, csv) => {
  db.query(
    "SELECT message FROM register WHERE email = ?",
    [email],
    (err, results) => {
      if (err) {
        console.error("Error retrieving message count:", err);
        return;
      }

      const messageCount = Number(results[0].message);
      const updatedBalance = messageCount - 1;
      try {
        if (messageCount > 0) {
          client.sendMessage(chatId, media, {
            caption: text,
          });

          db.query(
            "UPDATE register SET message = ? WHERE email = ?",
            [updatedBalance, email],
            (err) => {
              if (err) {
                console.error("Error updating message count:", err);
                return;
              }
            }
          );
          if (!csv) {
            res.status(200).json({
              success: 1,
              message: "Message sent successfully",
            });
          }
          const balance = {
            updatedBalance,
          };
          msgCount.publish("messageCount", balance);
        } else {
          return res.send({
            success: 0,
            message: "You do not have enough balance",
          });
        }
      } catch (error) {
        console.log(error);
      }
    }
  );
};

module.exports.sendMedia = async (req, res, next) => {
  const number = req.body.whatsappNumber;
  const text = req.body.message;
  const email = req.body.email;
  const CSVData = JSON.parse(req.body.CSVData);
  const files = req.files.file;
  try {
    // Single number send media
    if (number && text && files) {
      const isRegisteredNumber = await checkRegisteredNumber(number);

      if (isRegisteredNumber) {
        const chatId = number + "@c.us";
        const media = new MessageMedia(
          files.mimetype,
          files.data.toString("base64"),
          files.name
        );
        sendMessageWithMediaByCount(res, email, chatId, media, text);
        // await client.sendMessage(chatId, media, {
        //   caption: text,
        // });
      } else {
        return res.send({ status: 201 });
      }
    }
    //Multiple Number csv
    if (!number && CSVData && text && files) {
      const filteredNullData = CSVData.filter((value) => value !== null);
      async function sendMessageWithDelay(num) {
        return new Promise((resolve) => {
          setTimeout(() => {
            const message = `Sending message to ${num}`;
            channel2.publish("loading-messages", message);
            resolve();
          }, 2000);
        });
      }

      async function sendLoadingMessages() {
        channel2.publish("loading-messages", "Sending messages...");
        for (let i = 0; i < filteredNullData.length; i++) {
          await sendMessageWithDelay(filteredNullData[i]);
        }
        channel2.publish("loading-messages", "All messages sent!");
      }

      function showLoadingMessage() {
        const intervalId = setInterval(() => {
          process.stdout.write(".");
        }, 700);

        return () => {
          clearInterval(intervalId);
        };
      }

      const stopLoadingMessage = showLoadingMessage();
      sendLoadingMessages().then(() => {
        stopLoadingMessage();
      });

      async function sendMessage() {
        const results = await Promise.all(
          filteredNullData.map(checkRegisteredNumber)
        );
        const unregisteredNumbers = filteredNullData.filter(
          (number, index) => !results[index]
        );
        const registeredNumbers = filteredNullData.filter(
          (number, index) => results[index]
        );

        const Unregistered = unregisteredNumbers.map(
          (num, index) =>
            `${num}, Fail, This mobile number is not registered in whatsapp`
        );
        const Registered = registeredNumbers.map(
          (num, index) => `${num}, Sent`
        );
        makingCsv(Registered, Unregistered, res);

        for (const phoneNumber of registeredNumbers) {
          // const sanitized_number = phoneNumber
          //   .toString()
          //   .replace(/[- )(]/g, "");
          const chatId = phoneNumber + "@c.us";
          const media = new MessageMedia(
            files.mimetype,
            files.data.toString("base64"),
            files.name
          );
          const csv = true;
          sendMessageWithMediaByCount(res, email, chatId, media, text, csv);
          await new Promise((resolve) => setTimeout(resolve, 2000));
        }
      }
      sendMessage();
    }
  } catch (error) {
    return res.send({ error: "Please provide country code and valid number" });
  }
};

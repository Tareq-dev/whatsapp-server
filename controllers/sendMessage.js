const db = require("../config/db.js");

const csv = require("csv-express");
const { client } = require("../config/whatsapp_config.js");
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

const sendMessageByCount = (res, email, serializedNum, messageText, csv) => {
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

      if (messageCount > 0) {
        client.sendMessage(serializedNum, messageText);

        db.query(
          "UPDATE register SET message = ? WHERE email = ?",
          [updatedBalance, email],
          (err) => {
            if (err) {
              console.error("Error updating message count:", err);
              return;
            }

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
          }
        );
      } else {
        res.send({
          success: 0,
          message: "You do not have enough balance",
        });
      }
    }
  );
};

const checkRegisteredNumber = async function (number) {
  const isRegistered = await client.isRegisteredUser(number);
  return isRegistered;
};

module.exports.sendMessage = async (req, res, next) => {
  const whatsappNumber = req.body.whatsappNumber;
  const messageText = req.body.message;
  const email = req.body.email;
  const csvData = JSON.parse(req.body.CSVData);
  try {
    function getNumberId(number) {
      if (!number.endsWith("@c.us")) {
        number += "@c.us";
      }
      return number;
    }
    const formattedNumber = getNumberId(whatsappNumber);

    // Single number
    if (whatsappNumber && messageText) {
      const isRegisteredNumber = await checkRegisteredNumber(formattedNumber);
      if (isRegisteredNumber) {
        const sanitizedNumber = whatsappNumber
          .toString()
          .replace(/[- )(]/g, "");
        const numberDetails = await client.getNumberId(sanitizedNumber);
        if (numberDetails) {
          const serializedNum = numberDetails._serialized;
          sendMessageByCount(res, email, serializedNum, messageText);
        }
      } else {
        res.send({ status: 201 });
      }
    }

    // Multiple Numbers
    if (!whatsappNumber && csvData && messageText) {
      async function sendMessageWithDelay(number) {
        return new Promise((resolve) => {
          setTimeout(() => {
            const message = `Sending message to ${number}`;
            channel2.publish("loading-messages", message);
            resolve();
          }, 2000);
        });
      }

      async function sendLoadingMessages() {
        channel2.publish("loading-messages", "Sending messages...");
        for (let i = 0; i < csvData.length; i++) {
          await sendMessageWithDelay(csvData[i]);
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
        const results = await Promise.all(csvData.map(checkRegisteredNumber));
        const unregisteredNumbers = csvData.filter(
          (number, index) => !results[index]
        );
        const registeredNumbers = csvData.filter(
          (number, index) => results[index]
        );

        const unregisteredStatuses = unregisteredNumbers.map(
          (num) =>
            `${num}, Fail, This mobile number is not registered in WhatsApp`
        );
        const registeredStatuses = registeredNumbers.map(
          (num) => `${num}, Sent`
        );
        const csv = true;

        for (const phoneNumber of registeredNumbers) {
          const numberDetails = await client.getNumberId(phoneNumber);
          const serializedNum = numberDetails._serialized;
          sendMessageByCount(res, email, serializedNum, messageText, csv);
          await new Promise((resolve) => setTimeout(resolve, 2000));
        }
        if (csv) {
          makingCsv(registeredStatuses, unregisteredStatuses, res);
        }
      }

      sendMessage();
    }
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

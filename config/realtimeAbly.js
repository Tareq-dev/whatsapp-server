const Ably = require("ably");

const ably = new Ably.Realtime(
  "VSU5GA.7M4Y5Q:4Tok9TlkaNq5T8u5dKnJ42pu3oZrH0GYqKpkNPVqsHE"
);
const msgCount = ably.channels.get("messageCount");

module.exports = { ably, msgCount };

const mongoose = require("mongoose");

const MessageSchema = mongoose.Schema({
  name: String,
  author: String,
  when: Date,
  type: String,
  message: String
});

const Message = mongoose.model("Message", MessageSchema);
module.exports = Message;

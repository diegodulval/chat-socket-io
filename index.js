const express = require("express");
const mongoose = require("mongoose");

const app = express();

mongoose.Promise = global.Promise;

app.use(express.static("public"));
app.set("view engine", "ejs");

app.get("/", (req, res) => res.render("home"));

mongoose
  .connect("mongodb://localhost/chat-socketio")
  .then(() => app.listen(3000, () => console.log("Chat running...")));

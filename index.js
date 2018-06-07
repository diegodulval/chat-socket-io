const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const session = require("express-session");

const app = express();

app.use(
  session({
    secret: "socketio",
    resave: true,
    saveUninitialized: true,
    cookie: {
      maxAge: 10 * 60 * 1000
    }
  })
);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("view engine", "ejs");

app.get("/", (req, res) => res.render("home"));
app.post("/", (req, res) => {
  req.session.user = {
    name: req.body.name
  };
  res.render("room");
});

app.get("/room", (req, res) => {
  if (!req.session.user) {
    res.redirect("/");
  } else {
    res.render("room", {
      name: req.session.user.name
    });
  }
});

mongoose.Promise = global.Promise;
mongoose
  .connect("mongodb://localhost/chat-socketio")
  .then(() => app.listen(3000, () => console.log("Chat running...")));

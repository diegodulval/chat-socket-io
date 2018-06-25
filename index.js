const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const session = require("express-session");
const app = express();
const http = require("http").Server(app);
const io = require("socket.io")(http);

const Room = require("./models/room");

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

io.on("connection", socket => {
  //Initial rooms
  Room.find({}, (err, rooms) => {
    socket.emit("roomList", rooms);
  });
  //Add new room
  socket.on("addRoom", roomName => {
    console.log("addRoom", roomName);
    const room = new Room({
      name: roomName
    });
    room.save().then(() => {
      io.emit("newRoom", room);
    });
  });

  socket.on("join", roomId => {
    socket.join(roomId);
  });

  socket.on("sendMsg", msg => {
    console.log(msg);
  });
});

mongoose.Promise = global.Promise;
mongoose
  .connect("mongodb://localhost/chat-socketio")
  .then(() => http.listen(3000, () => console.log("Chat running...")));

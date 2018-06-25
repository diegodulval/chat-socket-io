const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const session = require("express-session");
const sharedSession = require("express-socket.io-session");
const app = express();
const http = require("http").Server(app);
const io = require("socket.io")(http);

const Room = require("./models/room");
const Message = require("./models/message");

const expressSession = session({
  secret: "socketio",
  resave: true,
  saveUninitialized: true,
  cookie: {
    maxAge: 10 * 60 * 1000
  }
});
app.use(expressSession);
io.use(sharedSession(expressSession, { autoSave: true }));

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
    Message.find({ room: roomId }).then(msgs => {
      socket.emit("msgsList", msgs);
    });
  });

  socket.on("sendMsg", data => {
    const message = new Message({
      author: socket.handshake.session.user.name,
      when: new Date(),
      type: "text",
      message: data.msg,
      room: data.room
    });

    message.save().then(() => {
      io.to(data.room).emit("newMsg", message);
    });
  });
});

mongoose.Promise = global.Promise;
mongoose
  .connect("mongodb://localhost/chat-socketio")
  .then(() => http.listen(3000, () => console.log("Chat running...")));

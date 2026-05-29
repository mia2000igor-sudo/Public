const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const multer = require("multer");
const fs = require("fs");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));
app.use(express.json());

if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
}

app.use("/uploads", express.static("uploads"));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads");
  },

  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  }
});

const upload = multer({ storage });

function loadDB() {
  return JSON.parse(
    fs.readFileSync("db.json")
  );
}

function saveDB(data) {
  fs.writeFileSync(
    "db.json",
    JSON.stringify(data, null, 2)
  );
}

app.post(
  "/upload",
  upload.single("avatar"),
  (req, res) => {

    res.json({
      image: "/uploads/" + req.file.filename
    });

  }
);

app.post("/register", (req, res) => {

  const db = loadDB();

  const {
    username,
    password,
    avatar
  } = req.body;

  const exists = db.users.find(
    u => u.username === username
  );

  if (exists) {
    return res.json({
      error: "User already exists"
    });
  }

  db.users.push({
    username,
    password,
    avatar,
    status: "Hello 😄",
    friends: [],
    requests: []
  });

  saveDB(db);

  res.json({
    success: true
  });

});

app.post("/login", (req, res) => {

  const db = loadDB();

  const {
    username,
    password
  } = req.body;

  const user = db.users.find(
    u =>
      u.username === username &&
      u.password === password
  );

  if (!user) {
    return res.json({
      error: "Wrong login"
    });
  }

  res.json(user);

});

app.get("/users", (req, res) => {

  const db = loadDB();

  res.json(db.users);

});

app.post("/add-friend", (req, res) => {

  const db = loadDB();

  const {
    from,
    to
  } = req.body;

  const user = db.users.find(
    u => u.username === to
  );

  if (!user) {
    return res.json({
      error: "User not found"
    });
  }

  if (!user.requests.includes(from)) {
    user.requests.push(from);
  }

  saveDB(db);

  res.json({
    success: true
  });

});

app.post("/accept-friend", (req, res) => {

  const db = loadDB();

  const {
    user,
    friend
  } = req.body;

  const u1 = db.users.find(
    u => u.username === user
  );

  const u2 = db.users.find(
    u => u.username === friend
  );

  if (!u1 || !u2) {
    return res.json({
      error: "Users not found"
    });
  }

  if (!u1.friends.includes(friend)) {
    u1.friends.push(friend);
  }

  if (!u2.friends.includes(user)) {
    u2.friends.push(user);
  }

  u1.requests =
    u1.requests.filter(
      r => r !== friend
    );

  saveDB(db);

  res.json({
    success: true
  });

});

app.get("/messages", (req, res) => {

  const db = loadDB();

  res.json(db.messages);

});

app.post("/send-message", (req, res) => {

  const db = loadDB();

  const {
    from,
    to,
    text
  } = req.body;

  db.messages.push({
    from,
    to,
    text
  });

  saveDB(db);

  io.emit("newMessage");

  res.json({
    success: true
  });

});

io.on("connection", socket => {

  console.log("User connected");

});

server.listen(
  process.env.PORT || 3000,
  () => {

    console.log(
      "Server started"
    );

  }
);

const { mongoose } = require("./utils/db");
require("dotenv").config();
const express = require("express");
const anime = require("./routes/anime");
const manga = require("./routes/manga");
const tools = require("./routes/tools");

const app = express();
app.use(require("cors")());

app.use(express.json());

app.use("/anime", anime);
app.use("/manga", manga);
app.use("/tools", tools);

const jwt = require("jsonwebtoken");
const { log } = require("./utils/logs");
const { getEnglishEpisode } = require("./utils/episodes");
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token == null) return res.sendStatus(401);

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    console.log(err);
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

mongoose.connection.on("open", () => {});
app.listen(4000, log("Server", "API Listening on port 4000"));

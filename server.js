const { mongoose } = require("./utils/db");
require("dotenv").config();
const express = require("express");
const anime = require("./routes/anime");
const manga = require("./routes/manga");
const CryptoJS = require("crypto-js");
const axios = require("axios");
const { load } = require("cheerio");

const app = express();

app.use(express.json());

app.use("/anime", anime);
app.use("/manga", manga);

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
//getEnglishEpisode("naruto-677-episode-12352").then((e) => console.log(e));

mongoose.connection.on("open", () => {});
app.listen(4000, log("Server", "API Listening on port 3000"));

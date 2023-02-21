const { mongoose } = require("../utils/db");
require("dotenv").config();
const express = require("express");
const serverless = require("serverless-http");
const router = express.Router();

const anime = require("../routes/anime");
const manga = require("../routes/manga");

app.use(express.json());

router.use("/anime", anime);
router.use("/manga", manga);

app.use("/.netlify/functions/api", router);

mongoose.connection.on("open", () => {});
module.exports.handler = serverless(app);

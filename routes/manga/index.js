const express = require("express");
const { mongoose, MangaModal, getMangaById } = require("../../utils/db");
const router = express.Router();

router.get("/", (req, res) => {
  res.sendStatus(404);
});

router.get("/:id", async (req, res) => {
  const id = req.params.id;
  if (!isNumeric(id)) return res.sendStatus(404);
  const manga = await getMangaById(id);
  if (manga) return res.send(manga);
  else return res.sendStatus(404);
});

router.get("/search/:animeName", (req, res) => {
  const { animeName } = req.params;
  MangaModal.find({
    keywords: {
      $elemMatch: { $in: new RegExp(animeName, "ig") },
    },
  })
    .then((result) => {
      if (result == null) return res.send([]);
      return res.send(result);
    })
    .catch((err) => res.send([]));
});

function isNumeric(str) {
  if (typeof str != "string") return false; // we only process strings!
  return (
    !isNaN(str) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
    !isNaN(parseFloat(str))
  ); // ...and ensure strings of whitespace fail
}

module.exports = router;

const express = require("express");
const {
  mongoose,
  AnimeModal,
  getAnimeById,
  getTopAnimes,
  getLatestEpisodes,
} = require("../../utils/db");
const { getArabicEpisode, getEnglishEpisode } = require("../../utils/episodes");
const router = express.Router();

router.get("/", (req, res) => {
  res.sendStatus(404);
});

router.get("/top", async (req, res) => {
  return await getTopAnimes();
});

router.get("/latest", async (req, res) => {
  return await getLatestEpisodes();
});

router.get("/search/:animeName", (req, res) => {
  const { animeName } = req.params;
  AnimeModal.find({
    justInfo: false,
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

router.get("/episode/:animeId/:episodeId", async (req, res) => {
  const { animeId, episodeId } = req.params;
  const anime = await getAnimeById(animeId);
  if (anime) {
    const episodes = anime.episodes;
    const episode = episodes.find(
      (x) => x.id == episodeId || x.enId == episodeId
    );
    if (!episode) return res.sendStatus(404);

    // TODO: Fetch episode links for now return static dat
    let ep = null;
    if (episode.id == episodeId) {
      ep = await getArabicEpisode(anime.as_id, episodeId);
    } else {
      ep = await getEnglishEpisode(episodeId);
    }
    return res.send(ep);
  } else return res.sendStatus(404);
});

router.get("/:id", async (req, res) => {
  const id = req.params.id;
  if (!isNumeric(id)) return res.sendStatus(404);
  const anime = await getAnimeById(id);
  if (anime) return res.send(anime);
  else return res.sendStatus(404);
});

function isNumeric(str) {
  if (typeof str != "string") return false; // we only process strings!
  return (
    !isNaN(str) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
    !isNaN(parseFloat(str))
  ); // ...and ensure strings of whitespace fail
}

module.exports = router;

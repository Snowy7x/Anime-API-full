const express = require("express");
const router = express.Router();
const {
  mongoose,
  AnimeModal,
  getAnimeById,
  getTopAnimes,
  getLatestEpisodes,
  ScheduleModal,
  FavoritesModal,
  getFavorites,
} = require("../../utils/db");
const { getArabicEpisode, getEnglishEpisode } = require("../../utils/episodes");

router.get("/", (req, res) => {
  res.sendStatus(404);
});

router.get("/schedule", async (req, res) => {
  const schedule = await ScheduleModal.findOne();
  res.send(schedule.toJSON());
});

router.get("/top", async (req, res) => {
  const { limit, offset } = req.query;
  let top = await getTopAnimes();
  if (limit > 0) top = top.slice(offset ?? 0, (offset ?? 0) + limit);

  res.send(top);
});

router.get("/latest", async (req, res) => {
  const { limit, offset } = req.query;
  let latest = await getLatestEpisodes();
  latest = latest.reverse();
  if (limit) latest = latest.slice(offset ?? 0, (offset ?? 0) + limit);
  res.send(latest);
});

router.get("/search/:animeName", (req, res) => {
  const { animeName } = req.params;
  const { limit, offset } = req.query;
  AnimeModal.find({
    justInfo: false,
    keywords: {
      $elemMatch: { $in: new RegExp(animeName, "ig") },
    },
  })
    .then((result) => {
      if (result == null) return res.send([]);
      if (limit) result = result.slice(offset ?? 0, offset ?? 0 + limit);

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

router.get("/fav/:userId", async (req, res) => {
  const { userId } = req.params;
  let favs = await getFavorites(userId);
  return res.send(favs);
});

router.post("/search", async (req, res) => {
  const { query, filters, limit, offset } = req.body;
  console.log(query, filters, limit, offset);
  await AnimeModal.find({
    justInfo: false,
    keywords: {
      $elemMatch: { $in: new RegExp(query, "ig") },
    },
    ...filters,
  }).then((result) => {
    if (result == null) return res.send([]);
    if (limit) result = result.slice(offset ?? 0, (offset ?? 0) + limit);
    return res.send(result);
  });
});

router.post("/addfav", async (req, res) => {
  const { userId, animeId } = req.body;
  if (!userId) return res.status(404).send("user not found");
  if (!animeId) return res.status(404).send("anime not found");

  const tryFind = await FavoritesModal.findOne({
    userId: userId,
    id: animeId,
  }).catch((E) => null);
  if (tryFind && tryFind?.name.length > 0) {
    const favs = await FavoritesModal.find({ userId: userId }).catch(() => []);
    return res.status(200).send(favs);
  }

  const anime = await AnimeModal.findOne({ id: animeId }).catch(() => null);
  if (!anime) return res.status(404).send("anime not found");

  let fav = new FavoritesModal({
    userId: userId,
    id: animeId,
    name: anime.name,
    coverUrl: anime.coverUrl,
    score: anime.score,
    year: anime.year,
    type: anime.type,
    status: anime.status,
    genres_ar: anime.genres_ar,
    genres_en: anime.genres_en,
  });
  await fav.save();

  const favs = await FavoritesModal.find({ userId: userId }).catch(() => []);
  return res.status(200).send(favs);
});

router.post("/removefav", async (req, res) => {
  const { userId, animeId } = req.body;
  if (!userId) return res.status(404).send("user not found");
  if (!animeId) return res.status(404).send("anime not found");

  const tryFind = await FavoritesModal.findOneAndRemove({
    userId: userId,
    id: animeId,
  }).catch((E) => null);
  if (tryFind) {
    const favs = await FavoritesModal.find({ userId: userId }).catch(() => []);
    return res.status(200).send(favs);
  } else {
    return res.status(404).send("Anime not in the list");
  }
});

function isNumeric(str) {
  if (typeof str != "string") return false; // we only process strings!
  return (
    !isNaN(str) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
    !isNaN(parseFloat(str))
  ); // ...and ensure strings of whitespace fail
}

module.exports = router;

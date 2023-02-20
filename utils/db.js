const { mongoose, Schema, Types, model } = require("mongoose");
const { log, error } = require("./logs");
const AutoIncrementFactory = require("mongoose-sequence");
require("dotenv").config();

const AutoIncrement = AutoIncrementFactory(mongoose);

const uri = process.env.DB_URL;
mongoose.set("strictQuery", false);
mongoose.connect(uri, {
  autoIndex: true,
});

mongoose.connection.on("error", (err) => {
  error("Database", err.message);
});

mongoose.connection.on("open", () => {
  log("Database", "Connected");
});

const T_Schema = new Schema({
  name: { type: String, default: null },
  id: { type: Number, default: null },
});

const EpisodeDetails = new Schema({
  id: { type: Number, default: null },
  enId: { type: String, default: null },
  name: { type: String, default: null },
  number: { type: String, default: null },
  thumbnailUrl: { type: String, default: null },
  urls: { type: [String], default: [] },
});

const Relation = new Schema({
  id: { type: Number, default: null },
  mal_id: { type: Number, default: null },
  ani_id: { type: Number, default: null },
  as_id: { type: Number, default: null },
  coverUrl: { type: String, default: null },
  rating: { type: Number, default: null },
  type: { type: String, default: null },
});

const Recommendation = new Schema({
  id: { type: Number, default: null },
  mal_id: { type: Number, default: null },
  ani_id: { type: Number, default: null },
  as_id: { type: Number, default: null },
  name: { type: String, default: null },
  coverUrl: { type: String, default: null },
});

const Adaption = new Schema({
  id: { type: Number, default: null },
  mal_id: { type: Number, default: null },
  ani_id: { type: Number, default: null },
  name: { type: String, default: null },
  coverUrl: { type: String, default: null },
  type: { type: String, default: null },
});

const AnimeSchema = new Schema({
  id: { type: Number, default: null, sparse: true },
  mal_id: { type: Number, default: null },
  ani_id: { type: Number, default: null },
  as_id: { type: Number, default: null },
  justInfo: { type: Boolean, default: false },
  adaption: { type: Adaption, default: null },

  name: { type: String, default: null },
  description_ar: { type: String, default: null },
  description_en: { type: String, default: null },
  coverUrl: { type: String, default: null },
  bannerUr: { type: String, default: null },
  trailer: { type: String, default: null },
  source: { type: String, default: null },
  duration: { type: String, default: null },

  score: { type: Number, default: null },
  scored_by: { type: Number, default: null },
  year: { type: Number, default: null },

  type: { type: String, default: null },
  Rated: { type: String, default: null },
  season: { type: String, default: null },
  status: { type: String, default: null },
  keywords: { type: [String], default: [] },

  genres_ar: [T_Schema],
  genres_en: [T_Schema],
  studios: [T_Schema],
  episodes: [EpisodeDetails],
  relations: [Relation],
  recommended: [Recommendation],
});

AnimeSchema.plugin(AutoIncrement, { inc_field: "id" });
const MangaSchema = new Schema({
  id: { type: Number, default: null, sparse: true },
  mal_id: { type: Number, default: null },
  ani_id: { type: Number, default: null },

  name: { type: String, default: null },
  description_ar: { type: String, default: null },
  description_en: { type: String, default: null },
  coverUrl: { type: String, default: null },
  bannerUrl: { type: String, default: null },
  source: { type: String, default: null },

  score: { type: Number, default: null },
  scored_by: { type: Number, default: null },
  year: { type: Number, default: null },

  type: { type: String, default: null },
  status: { type: String, default: null },
  keywords: { type: [String], default: [] },

  genres_ar: [T_Schema],
  genres_en: [T_Schema],
  studios: [T_Schema],
  chapters: [EpisodeDetails],
  relations: [Relation],
  recommended: [Recommendation],
});

const LatestEpisodeSchema = new Schema({
  id: { type: Number, default: null, sparse: true },
  mal_id: { type: Number, default: null },
  ani_id: { type: Number, default: null },
  epId: { type: Number, default: null },
  epIdEn: { type: String, default: null },

  epNumber: { type: String, default: null },
  name: { type: String, default: null },
  description_ar: { type: String, default: null },
  description_en: { type: String, default: null },
  coverUrl: { type: String, default: null },

  score: { type: Number, default: null },
  scored_by: { type: Number, default: null },

  type: { type: String, default: null },
  status: { type: String, default: null },

  genres_ar: [T_Schema],
  genres_en: [T_Schema],
});

const topAnimeSchema = new Schema({
  id: { type: Number, default: null, sparse: true },
  mal_id: { type: Number, default: null },
  ani_id: { type: Number, default: null },

  name: { type: String, default: null },
  description_ar: { type: String, default: null },
  description_en: { type: String, default: null },
  coverUrl: { type: String, default: null },

  rank: { type: Number, default: null },
  score: { type: Number, default: null },
  scored_by: { type: Number, default: null },

  type: { type: String, default: null },
  status: { type: String, default: null },

  genres_ar: [T_Schema],
  genres_en: [T_Schema],
});

const AnimeModal = model("Anime", AnimeSchema);
const MangaModal = model("Manga", MangaSchema);
const LatestEpisodeModal = model("LatestEpisode", LatestEpisodeSchema);
const topAnimeModal = model("topAnime", topAnimeSchema);
// Functions:

/**
 *
 * @param {string | number} id
 * @returns {Promise<AnimeModal>}
 */
async function getAnimeById(id) {
  return await AnimeModal.findOne({ id: id }).catch((err) => null);
}

/**
 *
 * @param {string | number} id
 * @returns {Promise<MangaModal>}
 */
async function getMangaById(id) {
  await MangaModal.findOne({ id: id }).catch((err) => null);
}

async function getTopAnimes() {
  return await topAnimeModal.find({});
}

async function getLatestEpisodes() {
  return await LatestEpisodeModal.find({});
}

module.exports = {
  mongoose,
  AnimeModal,
  AnimeSchema,
  MangaModal,
  getAnimeById,
  getMangaById,
  getTopAnimes,
  getLatestEpisodes,
};

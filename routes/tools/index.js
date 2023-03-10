const express = require("express");
const router = express.Router();
const fetch = require("node-fetch");
router.get("/proxy", async (req, res) => {
  let { url } = req.query;
  if (!url) return res.status(404).json({ success: false });
  url = decodeURIComponent(url.toString());
  return await fetch(url, {
    headers: { range: req.headers.range },
  })
    .then(async (response) => {
      console.log(response);
      if (!response.ok)
        return res.status(404).json({ success: false, data: response });
      res.set(await getFetchHeader(response.headers));
      response.body.pipe(res.status(206));
      response.body.on("error", () => {});
    })
    .catch((err) => {
      console.log("Could not fetch, trying again", err.message);
      fetch(url.toString(), {
        headers: { range: req.headers.range },
      })
        .then(async (response) => {
          console.log("Fetching", response);
          if (!response.ok)
            return res.status(404).json({ success: false, data: response });
          res.set(await getFetchHeader(response.headers));
          response.body.pipe(res.status(206));
          response.body.on("error", () => {});
        })
        .catch((err) => {
          console.log("Could not fetch, sorry", err.message);
          res.status(404).json({ success: false, data: err.message });
        });
    });
});

const getFetchHeader = async (headers) => {
  const data = {};
  for (let [key, value] of headers) {
    data[key] = value;
  }
  return data;
};

module.exports = router;

const { scrapeSource } = require("./rapid-cloud.js");
const axios = require("axios");
const { load } = require("cheerio");
const { log } = require("./logs.js");
const RNCryptor = require("rncryptor-node");

const zoroBase = "https://zoro.to";

const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.0.0 Safari/537.36";
const headerOption = {
  "User-Agent": USER_AGENT,
  "X-Requested-With": "XMLHttpRequest",
};
/**
 *
 * @param {number} animeId
 * @param {number} episodeId
 * @returns {Promise<{link: string, label: string}[]>}
 */
async function getArabicEpisode(animeId, episodeId) {
  // TODO: Get Arabic Episode
  let servers = [];
  let i = 0;
  while (servers.length <= 0 && i < 5) {
    i++;
    let episode = await axios
      .post(
        "https://anslayer.com/anime/public/episodes/get-episodes-new",
        new URLSearchParams({
          inf: '{"a": "mrg+e9GTkHaj8WXD7Cz3+Wbc1E4xYrvHLqW1vRF8xSo2B4K7Y5B7wcjHaoL1haW8Ynp3gYuGBRWFY/XaoEzVRcM/g8pJtaAT3FgwZh+KajpmkenxL0V/ghBXTwctGtEQFUO/UAJVGx2QClCE6gKSTQ==", "b": "102.185.179.127"}',
          json: `{"anime_id":${animeId},"episode_id":"${episodeId}"}`,
        }),
        {
          headers: {
            "Client-Id": "android-app2",
            "Client-Secret": "7befba6263cc14c90d2f1d6da2c5cf9b251bfbbd",
            Accept: "application/json, application/*+json",
            Host: "anslayer.com",
            "User-Agent": "okhttp/3.12.12",
          },
        }
      )
      .then(function (response) {
        return {
          code: 200,
          data: response.data.response.data[0],
        };
      })
      .catch(function (error) {
        log("Episode links", error.message);
        return {
          code: 400,
          data: error.message,
        };
      });
    if (episode.code !== 200) {
      return [];
    }
    const urls = episode.data.episode_urls;
    if (!urls || urls.length === 0) return [];

    const normal_servers = await axios
      .post(
        "https://anslayer.com/la/public/api/fw",
        new URLSearchParams({
          n: urls[1].episode_url.replace(
            "https://anslayer.com/la/public/api/f2?n=",
            ""
          ),
          inf: '{"a": "mrg+e9GTkHaj8WXD7Cz3+Wbc1E4xYrvHLqW1vRF8xSo2B4K7Y5B7wcjHaoL1haW8Ynp3gYuGBRWFY/XaoEzVRcM/g8pJtaAT3FgwZh+KajpmkenxL0V/ghBXTwctGtEQFUO/UAJVGx2QClCE6gKSTQ==", "b": "102.185.179.127"}',
        }),
        {
          headers: {
            "User-Agent": "okhttp/3.12.12",
            Host: "anslayer.com",
          },
        }
      )
      .then((re) => re.data)
      .catch((e) => log("Backup fetch", e.message));
    servers.push(
      ...normal_servers.map((s) => ({
        type: "normal",
        link: s,
      }))
    );

    const url_ = new URL(urls[0].episode_url);
    const params_ = url_.searchParams;

    const og_urls = await axios
      .post(
        "https://anslayer.com/anime/public/v-qs.php",
        new URLSearchParams({
          f: params_.get("f"),
          e: params_.get("e"),
          inf: '{"a": "mrg+e9GTkHaj8WXD7Cz3+Wbc1E4xYrvHLqW1vRF8xSo2B4K7Y5B7wcjHaoL1haW8Ynp3gYuGBRWFY/XaoEzVRcM/g8pJtaAT3FgwZh+KajpmkenxL0V/ghBXTwctGtEQFUO/UAJVGx2QClCE6gKSTQ==", "b": "102.185.179.127"}',
        }),
        {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Linux; Android 4.4.2; Nexus 4 Build/KOT49H) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/34.0.1847.114 Mobile Safari/537.36",
            Host: "anslayer.com",
          },
        }
      )
      .then((re) => {
        let decrypted = RNCryptor.Decrypt(
          re.data,
          "android-app9>E>VBa=X%;[5BX~=Q~K"
        );
        let js = JSON.parse(decrypted.toString());
        for (let i in js) {
          let link = js[i].file;
          js[i].label = link.includes("h.mp4")
            ? "1080p"
            : link.includes("m.mp4")
            ? "720p"
            : link.includes("s.mp4")
            ? "480p"
            : "av";
          js[i].file = js[i].file;
          ///"http://www.snowyanime.com:4000/tools/proxy?url=" +
          ///encodeURIComponent(js[i].file);
        }
        return js;
      })
      .catch((err) => {
        console.log(err);
      });
    servers.push({
      type: "backup",
      link: {
        host: "www.snowyanime.com",
        url: "http://www.snowyanime.com:4000/tools/proxy",
        type: -1,
        urls: og_urls,
      },
    });
  }
  /*   for (let s of normal_servers) {
    let c = await axios.post(s).catch((err) => {
      return null;
    });
    if (c === null) continue;
    let i = Decoder.decode(s, c.data);
    if (i) {
      let json = JSON.parse(i);
      if (json.urls.length >= 1) {
        servers.push(json);
      }
    }
  } */

  /*   if (servers.length <= 0) {
    return;
    const url_ = new URL(urls[0].episode_url);
    const params_ = url_.searchParams;
    const og_urls = await axios
      .post(
        "https://anslayer.com/anime/public/v-qs.php",
        new URLSearchParams({
          f: params_.get("f"),
          e: params_.get("e"),
          inf: '{"a": "mrg+e9GTkHaj8WXD7Cz3+Wbc1E4xYrvHLqW1vRF8xSo2B4K7Y5B7wcjHaoL1haW8Ynp3gYuGBRWFY/XaoEzVRcM/g8pJtaAT3FgwZh+KajpmkenxL0V/ghBXTwctGtEQFUO/UAJVGx2QClCE6gKSTQ==", "b": "102.185.179.127"}',
        }),
        {
          headers: {
            "User-Agent": "okhttp/3.12.12",
            Host: "anslayer.com",
          },
        }
      )
      .then((re) => {
        let decrypted = RNCryptor.Decrypt(
          re.data,
          "android-app9>E>VBa=X%;[5BX~=Q~K"
        );
        let js = JSON.parse(decrypted.toString());
        for (let i in js) {
          let link = js[i].file;
          js[i].label = link.includes("h.mp4")
            ? "1080p"
            : link.includes("m.mp4")
            ? "720p"
            : link.includes("s.mp4")
            ? "480p"
            : "av";
          js[i].file =
            "http://191.101.2.27:3030/v2/ar/proxy?url=" +
            encodeURIComponent(js[i].file);
        }
        return js;
      });

    servers.push(
      new StreamingLink(
        -1,
        "https://www.snanime.com",
        "www.snanime.com",
        og_urls
      )
    );
  } */

  return servers;
}

async function getEnglishEpisode(episodeId) {
  // TODO: Get English Episode
  try {
    if (!episodeId)
      return {
        error: true,
        error_message: "Episode ID not provided",
      };

    episodeId = episodeId.split("-").pop();

    const res = await axios.get(
      zoroBase + `/ajax/v2/episode/servers?episodeId=${episodeId}`,
      {
        headers: headerOption,
      }
    );
    const $ = load(res.data.html);

    // console.log(res.data.html)

    let dataId;
    // console.log(subOrDub)

    $(`div.servers-sub > div.ps__-list > div.server-item`).each((i, el) => {
      if ($(el).attr("data-server-id") == 1) {
        dataId = $(el).attr("data-id");
      }
    });

    if (!dataId) {
      $(`div.servers-raw > div.ps__-list > div.server-item`).each((i, el) => {
        if ($(el).attr("data-server-id") == 1) {
          dataId = $(el).attr("data-id");
        }
      });
    }

    const sources = await scrapeSource(dataId);

    return sources;
  } catch (err) {
    console.log(err);
    return {
      error: true,
      error_message: err,
    };
  }
}

module.exports = { getArabicEpisode, getEnglishEpisode };

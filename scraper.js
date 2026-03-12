import axios from "axios";
import * as cheerio from "cheerio";
import fs from "fs";

async function scrapePage(page) {
  const url = `https://ncs.io/?display=&page=${page}`;

  console.log("Scraping:", url);

  const { data } = await axios.get(url);

  const $ = cheerio.load(data);

  const songs = [];

  $("a.player-play").each((i, el) => {
    songs.push({
      title: $(el).attr("data-track"),
      artist: $(el).attr("data-artistraw"),
      mp3: $(el).attr("data-url"),
      cover: $(el).attr("data-cover"),
      genre: $(el).attr("data-genre"),
      preview: $(el).attr("data-preview"),
      id: $(el).attr("data-tid"),
    });
  });

  return songs;
}

async function scrapePages(startingPage, endingPage) {
  for (let page = startingPage; page <= endingPage; page++) {
    const songs = await scrapePage(page);

    fs.mkdirSync("songs-json", { recursive: true });

    fs.writeFileSync(
      `songs-json/songs-page-${page}.json`,
      JSON.stringify(songs, null, 2),
    );

    console.log(`Saved page ${page}`);

    await new Promise((r) => setTimeout(r, 500));
  }
}

export default scrapePages;

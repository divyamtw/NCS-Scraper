import axios from "axios";
import * as cheerio from "cheerio";
import fs from "fs";

async function getLastPage() {
  const { data } = await axios.get("https://ncs.io/?display=&page=1");

  const $ = cheerio.load(data);

  let maxPage = 1;

  $(".pagination a.page-link").each((i, el) => {
    const text = $(el).text().trim();
    const pageNumber = parseInt(text);

    if (!isNaN(pageNumber) && pageNumber > maxPage) {
      maxPage = pageNumber;
    }
  });

  return maxPage;
}

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
  fs.mkdirSync("songs-json", { recursive: true });

  const allSongs = [];

  // auto mode
  if (startingPage === undefined || endingPage === undefined) {
    console.log("Automatic mode enabled");

    let page = 1;

    const lastPage = await getLastPage();

    console.log(`Detected last page: ${lastPage}`);

    while (page <= lastPage) {
      const songs = await scrapePage(page);

      if (!songs || songs.length === 0) {
        console.log("No more songs found. Stopping.");
        break;
      }

      fs.writeFileSync(
        `songs-json/songs-page-${page}.json`,
        JSON.stringify(songs, null, 2),
      );

      allSongs.push(...songs);

      console.log(`Saved page ${page}`);

      page++;

      await new Promise((r) => setTimeout(r, 500));
    }

    fs.writeFileSync(
      "songs-json/songs.json",
      JSON.stringify(allSongs, null, 2),
    );

    console.log(`Saved combined dataset (${allSongs.length} songs)`);

    return;
  }

  // manual mode
  for (let page = startingPage; page <= endingPage; page++) {
    const songs = await scrapePage(page);

    if (!songs || songs.length === 0) {
      console.log(`No songs found on page ${page}. Stopping.`);
      break;
    }

    fs.writeFileSync(
      `songs-json/songs-page-${page}.json`,
      JSON.stringify(songs, null, 2),
    );

    allSongs.push(...songs);

    console.log(`Saved page ${page}`);

    await new Promise((r) => setTimeout(r, 500));
  }

  fs.writeFileSync("songs-json/songs.json", JSON.stringify(allSongs, null, 2));

  console.log(`Saved combined dataset (${allSongs.length} songs)`);
}

export default scrapePages;

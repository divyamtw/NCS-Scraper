import scrapePages from "./scraper.js";

const startPage = process.argv[2];
const endPage = process.argv[3];

scrapePages(startPage, endPage);

import scrapePages from "./scraper.js";

const startPage = process.argv[2] || 1;
const endPage = process.argv[3] || 50;

scrapePages(startPage, endPage);

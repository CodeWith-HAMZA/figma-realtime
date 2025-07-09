const axios = require('axios');
const cheerio = require('cheerio');
const { URL } = require('url');

const visited = new Set();

async function crawl(url, depth = 1) {
  if (depth === 0 || visited.has(url)) return;

  visited.add(url);

  try {
    const { data } = await axios.get(url);
    // data is html content
    const $ = cheerio.load(data);

    console.log(`🔍 Crawling: ${url},  ${$} \n\n\n${data}`);

    const links = $("a[href]")
      .map((_, el) => new URL($(el).attr("href"), url).href)
      .get();





    for (const link of links) {
      if (!visited.has(link) && link.startsWith('http')) {
        await crawl(link, depth - 1); // Recursive crawl
      }
    }
  } catch (err) {
    console.error(`❌ Failed to crawl ${url}: ${err.message}`);
  }
}

// Start crawling from a base URL
const startUrl = 'https://dailypakistan.com.pk/latest';
crawl(startUrl, 2); // depth = 2

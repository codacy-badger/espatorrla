const axios = require('axios');
const DEFAULT_URLS = ['http://torrentrapid.com/ultimas-descargas', 'http://descargas2020.com/ultimas-descargas']

/**
 * Return which URL is online to perform further scraping on torrents,
 * @param {Array[String]} urls List of URLs to be checked. By default, there are TorrentRapid and Descargas2020.
 * @returns {Promise<String>} If any URL is working, it returns the working URL. If not, the method is rejected.
 */
function getWorkingPage(urls = DEFAULT_URLS) {
  return new Promise(async (resolve, reject) => {
    let workingURL

    for (let i = 0; i < urls.length; i++) {
      const url = urls[i]

      try {
        await axios.get(url)
        workingURL = url
        break
      } catch (exception) {
        // Page not online. Try the next one
      }
    }

    if (!workingURL) {
      reject(undefined)
    } else {
      resolve(workingURL)
    }
  })
}

module.exports = {
  getWorkingPage
}

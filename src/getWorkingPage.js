const axios = require('axios');
const DEFAULT_URLS = ['http://torrentrapid.com/ultimas-descargas', 'http://descargas2020.com/ultimas-descargas']

/**
 * Retrieves which page of the parametrized ones are working in the moment of the execution
 * @returns Base URL of a working page for looking for torrents
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

const axios = require('axios');

/**
 * Extracts torrent link from a HTML document.
 * @param {String} content HTML content of the page.
 * @returns {Promise<String>} If any, the method resolves to the .torrent URL. Otherwise it is rejected.
 */
function extractTorrentLink(content) {
  const regex = /window\.location\.href\s*=\s*"(.*)"/gm

  return new Promise(async (resolve, reject) => {
    const regexResult = regex.exec(content)

    if (regexResult == null) {
      reject(undefined)
    } else {
      resolve(regexResult[1])
    }
  })
}

/**
 * Extracts torrent link of a given URL.
 * @param {String} url URL of the site to be extracted.
 * @returns {Promise<String>} If the URL is online and a torrent link is found, it resolves to the .torrent URL. Otherwise it is rejected.
 */
function getTorrentLink(url) {
  return new Promise((resolve, reject) => {
    axios.get(url)
      .then(res => {
        extractTorrentLink(res.data)
          .then(resolve)
          .catch(err => resolve(undefined)) // If there is any problem, do not add anything
      })
      .catch(err => resolve(undefined))
  })
}

module.exports = {
  getTorrentLink
}

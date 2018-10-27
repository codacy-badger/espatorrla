const axios = require('axios');

/**
 * Obtains the torrent of a given URL. If there is no torrent associated with it, returns undefined
 * @param {String} url URL of the site to be extracted
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

/**
 * Based on the HTML content of a web, extracts the link to the .torrent file
 * @param {String} content HTML content of the page
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


module.exports = {
  getTorrentLink
}

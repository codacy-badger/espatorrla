// HTTP Requests
const axios = require('axios');
const querystring = require('querystring');
const map = require('lodash/map')
axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';
axios.defaults.timeout = 2500;

// Scraping
const { load } = require('cheerio');

// POST params
const postParams = {
  date: 'Siempre',        // By default, search everything. When on batch, search only 'Semana' in order to speed up the queries
  categoryIDR: undefined  // Category to be searched
}

function getItemsForCategory({ url, category, limitPage, limitItem, date }) {
  return new Promise(async (resolve, reject) => {
    if (!url) {
      reject("You have to provide an URL :(")
      return
    }

    if (!category) {
      reject("You have to provide a category")
      return
    }

    if (!category.id) {
      reject("You have to provide the ID of the category (category.id)")
      return
    }

    if (!category.description) {
      reject("You have to provide the description of the category (category.description)")
      return
    }
    if (limitPage && limitPage < 1) {
      reject("The limit page cannot be less than 1")
      return
    }

    // Defaults configuration
    if(date) postParams.date = date
    postParams.categoryIDR = category.id
    const hasEpisodes = category.hasEpisodes

    // Information about the process
    console.info(`Looking for items in category: ${category.description}`)
    console.info(` Has episodes? ${hasEpisodes}`)

    if(limitPage) console.info(` Limit Page: ${limitPage}`)
    if(limitItem) console.info(` Limit Item: ${limitItem}`)

    // Parameters in order to send the category to be searched and the date (Always)
    const params = querystring.stringify(postParams)

    let curPage = 1
    let items = []

    // Looking for a breakpoint. In this initial state, 3 pages is OK in order to test if this runs ok
    while (true) {
      console.log(`  Page ${curPage}/${limitPage}`)

      let data
      try {
        const res = await axios.post(`${url}/pg/${curPage}`, params)
        data = res.data
      } catch (ex) {
        console.error(`Error geting results from ${url}`)
        reject()
        return
      }

      const pageItems = await getItemsFromHTML(data, category)

      if(pageItems.length < 1) break

      items = items.concat(pageItems)
      
      // Stop if the limit page has been reached
      if (limitPage && curPage >= limitPage) break

      // Stop if the limit item has been reached
      if (limitItem) {
        const item = pageItems.filter(item => item.link === limitItem)
        if (item && item.length > 0) break
      }

      curPage++
    }
    resolve(items)
  })
}


/**
 * On the "Last updated torrents" page, extracts all the movies and series with their link, title, quality and image
 * @param {String} html Stringified HTML content of the web
 * @returns {JSON} Torrent, Title, Quality, Image
 */
function getItemsFromHTML(html, category) {
  return new Promise(async (resolve, reject) => {
    let $ = load(html)
    const elements = $('ul.noticias-series li')

    const basicData = await Promise.all(map(elements, async element => {
      $ = load(element)
      const info = $('div.info a:first-of-type')
      
      const url = info.attr('href')
      const image = $('img').attr('src')
      const title = info.attr('title')
      const quality = $('div.info #deco')[0].children[0].data.trim()

      return { url, title, image, quality, category }
    }))

    resolve(basicData)
  })
}

module.exports = {
  getItemsForCategory
}

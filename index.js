const { load} = require('cheerio');
const { map, flatten } = require('lodash')
const axios = require('axios');
const { baseURLs, endpoint, categories } = require('./params.js')
const querystring = require('querystring');

// Custom things
const log = console.log
const error = console.error
axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';

// Execute the main process
executeExtraction()


/**
 * Main process. This process will get all the necessary info about torrents and
 */
async function executeExtraction() {
  log('Obteniendo qué web está online...')
  const url = await getWorkingPage();

  if (!url) {
    log('No se encontró ninguna web online en este momento');
    error('\tAbortando obtención de Torrents...')
    process.exit(-1)
  }

  const categoriesInfo = await getTorrents(url)
  const flatInfo = flatten(categoriesInfo)

  log(flatInfo)

  return flatInfo
}

function getTorrents(url) {
  return new Promise(async (resolve, reject) => {
    const categoriesInfo = await Promise.all(map(categories, category => getCategoryLinks(category, url)))
    resolve(categoriesInfo)
  })
}

function getCategoryLinks(category, url){
  return new Promise(async (resolve, reject) => {
    let curPage = 1
    let finished = false
    let info = []

    // Parameters in order to send the category to be searched and the date (Always)
    const params = querystring.stringify({
      categoryIDR: category.id,
      date: 'Siempre'
    })

    // Looking for a breakpoint. In this initial state, 3 pages is OK in order to test if this runs ok
    while (!finished) {
      console.info(`Categoría: ${category.name}`)
      console.info(`Página: ${curPage}`)
      try {
        let { data } = await axios.post(`${url}/pg/${curPage++}`, params)
        let entries = await getEntries(data, category)
  
        info = info.concat(entries)
        finished = entries.length === 0

        data = null
        entries = null
      } catch(ex) {
        console.log('---------------------')
        console.log(ex)
      }
    }

    resolve(info)
  })
}

/**
 * Based on the HTML content of a web, extracts the link to the .torrent file
 * @param {String} content HTML content of the page
 */
function getTorrentLink(content) {
  const regex = /window\.location\.href\s*=\s*"(.*)"/gm

  return new Promise(async (resolve, reject) => {
    const regexResult = regex.exec(content)

    if(!regexResult){
      reject()
    } else {
      resolve(regexResult[1])
    }
  })
}

/**
 * On the "Last updated torrents" page, extracts all the movies and series with their link, title, quality and image
 * @param {String} html Stringified HTML content of the web
 * @returns {JSON} Torrent, Title, Quality, Image
 */
function getEntries(html, category) {
  return new Promise(async (resolve, reject) => {
    let $ = load(html)

    const elements = $('ul.noticias-series li')

    const basicData = await Promise.all(map(elements, async element => {
      $ = load(element)
      element = null
      const info = $('div.info a:first-of-type')
      
      const title = info.attr('title')
      const quality = $('div.info #deco')[0].children[0].data.trim()
      const image = $('img').attr('src')
      const url = info.attr('href')

      let { data } = await axios.get(url)
      let torrent = undefined

      try{
        torrent = await getTorrentLink(data)
      } catch (ex) {
        // Do things
      }
      data  =null

      return { title, image, quality, torrent, category, url }
    }))

    const onlyWithTorrents = basicData.filter(element => element.torrent)

    const noTorrents = basicData.filter(element => !element.torrent)
    if(noTorrents.length > 0) console.log(noTorrents)
    
    resolve(onlyWithTorrents)
  })
}

/**
 * Retrieves which page of the parametrized ones are working in the moment of the execution
 * @returns Base URL of a working page for looking for torrents
 */
function getWorkingPage() {
  return new Promise(async (resolve, reject) => {
    let urlOK

    for (let i = 0; i < baseURLs.length; i++) {
      const url = `${baseURLs[i]}${endpoint}`

      try {
        await axios.get(url)
        log(`  ${baseURLs[i]} online!`)
        urlOK = url
        break
      } catch (exception) {
        log(`\t${baseURLs[i]} no se encuentra online.`)
      }
    }

    resolve(urlOK)
  })
}
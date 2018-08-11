const { load } = require('cheerio');
const { map } = require('lodash')
const axios = require('axios');
const { baseURLs, endpoint, categories } = require('./params.js')
const querystring = require('querystring');

const log = console.log
const error = console.error
axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';

executeExtraction()

async function executeExtraction() {
  // Validamos que tengamos alguna web de la lista que funcione
  log('Obteniendo qué web está online...')
  const url = await getWorkingPage();

  if(!url){
    log('No se encontró ninguna web online en este momento');
    error('\tAbortando obtención de Torrents...')
    process.exit(-1)
  }

  const categoriesInfo = await getCategoriesInfo(url)

  

  log(categoriesInfo)

  const urls = map(categoriesInfo, i => i.link)
  const content = await Promise.all(urls)

  const torrents = map(content, c => getTorrentLink)
  log(torrents)


}

function getCategoriesInfo(url){
  return new Promise((resolve, reject) => {
    const categoriesInfo = []
  
  categories.forEach(async category => {
    let curPage = 1
    let finished = false
    let info = []

    while (!finished) {
      const params = querystring.stringify({ 
        categoryIDR: category.id,
        date: 'Siempre'
      })
      const { data } = await axios.post(`${url}/pg/${curPage++}`, params)

      const entries = await getEntries(data)
      info = info.concat(entries)

      finished = curPage == 3
    }
    console.log(info)
    categoriesInfo[category.id] = info
  })
  resolve(categoriesInfo)
  })
  
}

function getTorrentLink(content){
  const regex = /window\.location\.href\s*=\s*"(.*)"/gm

  return new Promise(async (resolve, reject) => {
    const regexResult = regex.exec(content)
    resolve(regexResult[1])
  })
}

function getEntries(html){
  return new Promise(async (resolve, reject) => {
    let $ = load(html)

    const elements = $('ul.noticias-series li')

    const basicData = await Promise.all(map(elements, element => {
      $ = load(element)  
      const info = $('div.info a:first-of-type')

      const link = info.attr('href')
      const title = info.attr('title')
      const quality = $('div.info #deco')[0].children[0].data.trim()
      const image = $('img').attr('src')

      return { title, image, quality, link }
    }))

    resolve(basicData)
  })
}




function getWorkingPage(){
  return new Promise(async (resolve, reject) => {
    let urlOK

    for(let i = 0; i<baseURLs.length; i++){
      const url = `${baseURLs[i]}${endpoint}`

      try {
        await axios.get(url)
        log(`\t${baseURLs[i]} online!`)
        urlOK = url
        break
      } catch(exception) {
        log(`\t${baseURLs[i]} no se encuentra online.`)
        error(exception)
      }
    }

    resolve(urlOK)
  })
}
import Xray from 'x-ray'
import { compareTwoStrings } from 'string-similarity'

const API_URL = 'http://1337x.to/category-search/%query%/TV/1/'

const x = Xray({
  filters: {
    parseInt: val => parseInt(val),
    trim: val => val.trim()
  }
})

function PromisifyXray (xInstance) {
  return new Promise((resolve, reject) => {
    xInstance((err, result) => {
      if (err) return reject(err)

      resolve(result)
    })
  })
}

function formatResults (results, query) {
  const episodes = results.reduce((episodesObject = {}, ep) => {
    const name = ep.name.toLowerCase()
    const regex = /(s\d{2,}e\d{2,})|(\d{1,}x\d{2,})/g

    if (regex.test(name)) {
      const episodeDetails = name.match(regex)[0]
      const showName = name.slice(0, name.indexOf(episodeDetails)).trim()

      if (compareTwoStrings(showName, query.replace(/-/g, ' ')) < 0.6) return episodesObject

      const season = parseInt(
        episodeDetails.split(/x|e/g)[0].replace('s', '')
      )
      const episode = parseInt(
        episodeDetails.split(/x|e/g)[1]
      )

      if (!episodesObject[season]) episodesObject[season] = {}
      if (!episodesObject[season][episode]) {
        episodesObject[season][episode] = {
          season,
          episode,
          torrents: []
        }
      }

      episodesObject[season][episode].torrents.push(ep)
    }

    return episodesObject
  }, {})

  return Object.keys(episodes).reduce((seasons, key) => {
    seasons[key] = []

    Object.keys(episodes[key]).reduce((s, ep) => {
      s.push(episodes[key][ep])

      return s
    }, seasons[key])

    return seasons
  }, {})
}

function search (query) {
  const uri = API_URL.replace(
    '%query%',
    encodeURIComponent(query)
  )
  return PromisifyXray(
    x(uri, '.search-page .table-list tbody tr', [{
      torrent: '.name a:last-child@href',
      name: '.name | trim'
    }])
      .paginate('.pagination .active + li a@href')
  )
}

export async function getEpisodes (query) {
  const searchResult = await search(query)

  return formatResults(searchResult, query)
}

export function getTorrentData (torrentUri) {
  try {
    return PromisifyXray(
      x(torrentUri, {
        magnet: '.download-links-dontblock li:first-child a@href',
        name: '.box-info-heading | trim',
        seeds: '.seeds | parseInt',
        size: '.torrent-category-detail .list li:nth-child(4) span'
      })
    )
  } catch (err) {
    return null
  }
}

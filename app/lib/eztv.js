import Xray from 'x-ray'

const URL = 'https://eztv.ag/search'
const x = Xray({
  filters: {
    int: val => parseInt(val.replace(/,/g, '')),
    trim: val => val.trim()
  }
})

function formatResults (results, query) {
  const episodes = results.reduce((episodesObject, ep) => {
    const name = ep.name.toLowerCase()
    const regex = /(s\d{2,}e\d{2,})|(\d{1,}x\d{2,})/g
    if (ep.episodeUrl.indexOf(query) < 0) return episodesObject

    if (regex.test(name)) {
      const parsedName = name.match(regex)[0].split(/x|e/g)
      const season = parseInt(
        parsedName[0].replace('s', '')
      )
      const episode = parseInt(
        parsedName[1]
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

      return episodesObject
    }
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

export function getEZTVData (query) {
  return new Promise((resolve, reject) =>
    x(`${URL}/${query}`, 'table.forum_header_border tr.forum_header_border', [{
      episodeUrl: 'td:nth-child(2) a@href',
      name: 'td:nth-child(2) | trim',
      magnet: 'td:nth-child(3) a:nth-child(1)@href',
      size: 'td:nth-child(4)',
      seeds: 'td:nth-child(6) | int'
    }])((err, result) => {
      if (err) reject(err)

      resolve(result)
    })
  )
}

export async function getEpisodes (query) {
  const data = await getEZTVData(query)

  if (data.length === 0) throw new Error('No episodes found')

  return formatResults(data, query)
}

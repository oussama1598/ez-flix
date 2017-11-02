import Xray from 'x-ray'

const URL = 'https://eztv.ag/search'
const x = Xray({
  filters: {
    int: val => parseInt(val.replace(/,/g, '')),
    trim: val => val.trim()
  }
})

function formatResults (results, query) {
  const episodes = {}
  const seasons = {}

  results.forEach(ep => {
    const name = ep.name.toLowerCase()
    const regex = /(s\d{2,}e\d{2,})|(\d{1,}x\d{2,})/g
    if (ep.episodeUrl.indexOf(query) < 0) return

    if (regex.test(name)) {
      const parsedName = name.match(regex)[0].split(/x|e/g)
      const season = parseInt(
        parsedName[0].replace('s', '')
      )
      const episode = parseInt(
        parsedName[1]
      )

      if (!episodes[season]) episodes[season] = {}
      if (!episodes[season][episode]) {
        episodes[season][episode] = {
          season,
          episode,
          torrents: []
        }
      }

      episodes[season][episode].torrents.push(ep)
    }
  })

  Object.keys(episodes).forEach(key => {
    seasons[key] = []
    Object.keys(episodes[key]).forEach(ep => {
      seasons[key].push(episodes[key][ep])
    })
  })

  return seasons
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

  if (data.length === 0) throw new Error('no Episodes Found')

  return formatResults(data, query)
}

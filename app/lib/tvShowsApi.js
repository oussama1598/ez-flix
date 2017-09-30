import request from 'request-promise'
import _ from 'underscore'
import { URL } from 'url'

const ENDPOINT = 'https://api.apidomain.info/show'

const parseEpisode = episode => ({
  title: episode.title,
  season: episode.season,
  episode: episode.episode,
  torrents: _.chain(episode.items).map(torrent => ({
    hash: torrent.id,
    magnet: torrent.torrent_magnet,
    seeds: torrent.torrent_seeds,
    quality: torrent.quality,
    file: torrent.file,
    size: torrent.size_bytes
  })).sortBy(item => item.size).value()
})

const parseSeason = (data, episodeNumber) =>
  _.chain(data)
    .map(episode => parseEpisode(episode))
    .filter(item =>
      Object.keys(item.torrents).length > 0 &&
      (episodeNumber ? parseInt(item.episode, 10) === episodeNumber : true)
    )
    .sortBy(item => item.episode)
    .value()

export const getTorrents = (imdb, _season, _episode) => {
  const season = parseInt(_season, 10)
  const episode = parseInt(_episode, 10)
  if (!season) return Promise.reject(new Error('Season is required'))

  const Uri = new URL(ENDPOINT)
  Uri.searchParams.append('imdb', imdb)

  return request({
    uri: Uri.href,
    json: true
  })
    .then(data => {
      if (!data) return Promise.reject(new Error('Nothing found :('))
      if (!data[season]) {
        return Promise.reject(new Error('Season cannot be found'))
      }

      if (episode) return parseSeason(data[season], episode)[0]

      return parseSeason(data[season])
    })
}

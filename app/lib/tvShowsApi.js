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

export const parseSeason = data =>
  _.chain(data)
    .map(episode => parseEpisode(episode))
    .sortBy(item => item.episode)
    .value()

export const getTorrents = imdb => {
  const Uri = new URL(ENDPOINT)
  Uri.searchParams.append('imdb', imdb)

  return request({
    uri: Uri.href,
    json: true
  })
    .then(data => {
      if (!data) return Promise.reject(new Error('Nothing found :('))

      return data
    })
}

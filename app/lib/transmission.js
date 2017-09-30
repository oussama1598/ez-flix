import request from 'request-promise'
import cheerio from 'cheerio'

const RPC = 'http://localhost:9091/transmission/rpc/'

export const addTorrent = (magnet, uri, session) =>
  request({
    uri: RPC,
    method: 'POST',
    headers: {
      'X-Transmission-Session-Id': session
    },
    json: {
      method: 'torrent-add',
      arguments: {
        'download-dir': uri,
        filename: magnet,
        paused: false
      }
    }
  })

export const getSession = () =>
  request({
    uri: RPC,
    method: 'POST'
  })
    .catch(res => {
      if (res.statusCode !== 409) return Promise.reject(res)

      const $ = cheerio.load(res.message)
      return $('code').text().replace('X-Transmission-Session-Id: ', '')
    })

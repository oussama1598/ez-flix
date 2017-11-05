import request from 'request-promise'
import cheerio from 'cheerio'

const RPC = 'http://localhost:9091/transmission/rpc/'

export function addTorrent (magnet, uri, session) {
  return request({
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
}

export async function getSession () {
  const res = await request({
    uri: RPC,
    method: 'POST'
  }).catch(res => res)

  if (res.statusCode !== 409) return null

  const $ = cheerio.load(res.message)
  return $('code')
    .text()
    .replace('X-Transmission-Session-Id: ', '')
}

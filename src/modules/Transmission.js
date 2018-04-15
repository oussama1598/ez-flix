import request from 'request-promise';
import cheerio from 'cheerio';

export default class Tranmission {
  constructor() {
    // TODO: change this to work with config
    this.RPC_URI = 'http://localhost:9091/transmission/rpc/';
    this.id = null;
  }

  async load() {
    return this.getId();
  }

  async getId() {
    const res = await request({
      uri: this.RPC_URI,
      method: 'POST'
    }).catch(resp => resp);

    if (res.statusCode !== 409) return;

    this.id = cheerio
      .load(res.message)('code')
      .text()
      .replace('X-Transmission-Session-Id: ', '');
  }

  addTorrent(magnet, uri) {
    return request({
      uri: this.RPC_URI,
      method: 'POST',
      headers: {
        'X-Transmission-Session-Id': this.id
      },
      json: {
        method: 'torrent-add',
        arguments: {
          'download-dir': uri,
          filename: magnet,
          paused: false
        }
      }
    });
  }
}

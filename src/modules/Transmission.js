import request from 'request-promise';
import cheerio from 'cheerio';

export default class Tranmission {
  constructor(options) {
    this.options = Object.assign(
      {
        host: '127.0.0.1',
        port: 9091,
        useCwd: true
      },
      options
    );
    this.RPC_URI = `http://${this.options.host}:${
      this.options.port
    }/transmission/rpc/`;
    this.id = null;
  }

  async getToken() {
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
          'download-dir': this.options.useCwd ? uri : false,
          filename: magnet,
          paused: false
        }
      }
    });
  }
}

import request, { jar } from 'request-promise';
import cheerio from 'cheerio';
import { URL } from 'url';

export default class Utorrent {
  constructor(options) {
    this.options = Object.assign(
      {
        host: '127.0.0.1',
        port: 8888,
        username: 'admin',
        password: 'admin'
      },
      options
    );
    this.baseUrl = `http://${this.options.host}:${this.options.port}/gui`;
    this.token = null;
    this.jar = jar();

    const { username: user, password: pass } = this.options;
    this.auth = { user, pass };
  }

  async getToken() {
    const $ = await request({
      method: 'GET',
      uri: `${this.baseUrl}/token.html`,
      auth: this.auth,
      jar: this.jar,
      transform: body => cheerio.load(body)
    });

    this.token = $('#token').text();
  }

  addTorrent(magnet) {
    const uri = new URL(`${this.baseUrl}/`);

    uri.searchParams.append('token', this.token);
    uri.searchParams.append('action', 'add-url');
    uri.searchParams.append('s', magnet);

    request({
      method: 'GET',
      uri: uri.toString(),
      jar: this.jar,
      auth: this.auth,
      json: true
    });
  }
}

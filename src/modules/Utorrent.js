import request, { jar } from 'request-promise';
import cheerio from 'cheerio';
import { URL } from 'url';

export default class Utorrent {
  constructor(baseUrl, username, password) {
    this.baseUrl = baseUrl;
    this.username = username;
    this.password = password;
    this.token = null;
    this.jar = jar();
  }

  async getToken() {
    const $ = await request({
      method: 'GET',
      uri: `${this.baseUrl}/token.html`,
      auth: {
        user: this.username,
        pass: this.password
      },
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
      auth: {
        user: this.username,
        pass: this.password
      },
      json: true
    });
  }
}

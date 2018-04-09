import request from 'request-promise';
import cheerio from 'cheerio';
import { parse as parseCookie } from 'cookie';
import { Cookie } from 'tough-cookie';
import { URL } from 'url';

export default class Utorrent {
  constructor(baseUrl, username, password) {
    this.baseUrl = baseUrl;
    this.username = username;
    this.password = password;
    this.token = null;
  }

  async getToken() {
    const res = await request({
      method: 'GET',
      uri: `${this.baseUrl}/token.html`,
      auth: {
        user: this.username,
        pass: this.password
      },
      resolveWithFullResponse: true
    });
    const $ = cheerio.load(res.body);

    this.guid = parseCookie(res.headers['set-cookie'][0]).GUID;
    this.token = $('#token').text();
  }

  addTorrent(magnet) {
    console.log(this);

    const cookie = new Cookie({
      key: 'GUID',
      value: this.guid,
      domain: '127.0.0.1'
    });
    const jar = request.jar();
    const uri = new URL(this.baseUrl);

    uri.searchParams.append('token', this.token);
    uri.searchParams.append('action', 'add-url');
    uri.searchParams.append('s', magnet);

    jar.setCookie(cookie, this.baseUrl);

    request({
      method: 'GET',
      uri: uri.toString(),
      jar,
      auth: {
        user: this.username,
        pass: this.password
      },
      json: true
    });
  }
}

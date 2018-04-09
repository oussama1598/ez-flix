import request from 'request-promise';
import cheerio from 'cheerio';

export default class Utorrent {
  constructor(baseUrl, username, password) {
    this.baseUrl = baseUrl;
    this.username = username;
    this.password = password;
    this.token = null;
  }

  async getToken() {
    const $ = await request({
      method: 'GET',
      uri: `${this.baseUrl}/token.html`,
      auth: {
        user: this.username,
        pass: this.password
      },
      transform: res => cheerio.load(res)
    });

    this.token = $('#token').text();

    console.log(this.token);
  }
}

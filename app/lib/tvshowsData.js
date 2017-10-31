import Xray from 'x-ray'
import { URL } from 'url'

const TRAKT_END_POINT = 'https://trakt.tv/search'
const x = Xray()

export const searchForShow = query =>
  new Promise((resolve, reject) => {
    const uri = new URL(TRAKT_END_POINT)
    uri.searchParams.append('query', query)

    x(uri.toString(), 'div[data-type=show]', [{
      name: '.titles h3',
      url: 'meta[itemprop=url]@content'
    }])((err, results) => {
      if (err) reject(err)
      resolve(results)
    })
  })

import Xray from 'x-ray'
import { URL } from 'url'

const TRAKT_END_POINT = 'https://trakt.tv/search'
const x = Xray()

export function searchForShow (query) {
  const uri = new URL(TRAKT_END_POINT)
  uri.searchParams.append('query', query)

  return new Promise((resolve, reject) =>
    x(uri.toString(), 'div[data-type=show]', [{
      name: '.titles h3',
      url: 'meta[itemprop=url]@content'
    }])((err, result) => {
      if (err) reject(err)

      resolve(result)
    })
  )
}

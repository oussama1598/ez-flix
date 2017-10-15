import request from 'request-promise'
import Xray from 'x-ray'
import { URL } from 'url'

const ENDPOINT = 'https://showsdb-api.herokuapp.com/api/show/'
const TRAKT_END_POINT = 'https://trakt.tv/search'

const x = Xray()

export const getShowId = (name, id = 'imdb') => {
  console.log(`Searching for ${name}`)

  return request({
    uri: `${ENDPOINT}${name}`,
    json: true
  })
    .then(data => data.externals[id])
}

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
